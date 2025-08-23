import React, { useState, useEffect, useRef, useCallback } from "react"; 
import { motion } from "framer-motion";
import { Plus, Trash, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

type ProgressMsg =
  | { type: "start"; title: string; total: number }
  | { type: "item-start"; index: number; label: string }
  | { type: "item-complete"; index: number; label: string; url: string }
  | { type: "item-error"; index: number; label: string; message: string }
  | { type: "done"; course_id: string | number; course_code: string }
  | { type: "fatal"; message: string }
  | { type: "item-progress"; index: number; percent: number }; // optional if you emit it

export const Course_Manage: React.FC = () => {
  // ----- your existing state -----
  const [class_title, setTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [instructors, setInstructors] = useState<{ instructor_code: string; name: string }[]>([]);
  const [loadingInstructors, setLoadingInstructors] = useState(true);

  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [instructor, setInstructor] = useState("");
  const [level, setLevel] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [language, setLanguage] = useState("");

  const [faqs, setFaqs] = useState([{ question: "", answer: "" }]);
  const [playlist, setPlaylist] = useState([{ class_title: "", class_url: "", duration: "" }]);

  const [dialogOpen, setDialogOpen] = useState(false);

  const [notifQueue, setNotifQueue] = useState<string[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifMsg, setNotifMsg] = useState("");

  const fileRef = useRef<HTMLInputElement | null>(null);

// helper to clear everything
const resetForm = useCallback(() => {
  setTitle("");
  setDescription("");
  setCategory("");
  setInstructor("");
  setLevel("");
  setIsPaid(false);
  setThumbnail(null);
  if (fileRef.current) fileRef.current.value = ""; // clears file input
  setLanguage("");
  setFaqs([{ question: "", answer: "" }]);
  setPlaylist([{ class_title: "", class_url: "", duration: "" }]);

  // clear progress + stop any open SSE
  setProgressTotal(0);
  setProgressItems({});
  setProgressId("");
  eventSrcRef.current?.close();
  eventSrcRef.current = null;

  // safety: ensure saving spinner is off
  setIsSaving(false);
}, []);
  
  const enqueueNotification = useCallback((msg: string) => {
    setNotifQueue(q => [...q, msg]);
  }, []);
  
  // ----- NEW: progress UI state -----
  const [progressTotal, setProgressTotal] = useState<number>(0);
  const [progressItems, setProgressItems] = useState<
    Record<number, { label: string; status: "pending" | "uploading" | "done" | "error"; url?: string; message?: string; percent?: number }>
  >({});
  const [progressId, setProgressId] = useState<string>("");
  const eventSrcRef = useRef<EventSource | null>(null);

  const upsertProgress = (idx: number, patch: Partial<{ label: string; status: "pending" | "uploading" | "done" | "error"; url?: string; message?: string; percent?: number }>) => {
    setProgressItems(prev => ({
      ...prev,
      [idx]: { label: prev[idx]?.label || `Class ${idx + 1}`, status: prev[idx]?.status || "pending", ...prev[idx], ...patch }
    }));
  };

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const res = await fetch("https://digitalbillionbackendcode-245452534397.europe-west1.run.app/api/v1/admin/instructor-codes");
        const data = await res.json();
        if (res.ok && data.success) setInstructors(data.data);
      } finally {
        setLoadingInstructors(false);
      }
    };
    fetchInstructors();

    // NEW: cleanup on unmount (close SSE if open)
    return () => { eventSrcRef.current?.close(); };
  }, []);

  useEffect(() => {
  let timer: ReturnType<typeof setTimeout> | null = null;

  if (!notifOpen && notifQueue.length > 0) {
    const [next, ...rest] = notifQueue;
    setNotifMsg(next);
    setNotifQueue(rest);
    setNotifOpen(true);

    timer = setTimeout(() => {
      setNotifOpen(false);
    }, 10_000); // 10 seconds
  }
  return () => { if (timer) clearTimeout(timer); };
}, [notifOpen, notifQueue]);



  // ----- your existing handlers (FAQ, playlist) -----
  const handleAddFaq = () => setFaqs([...faqs, { question: "", answer: "" }]);
  const handleRemoveFaq = (index: number) => setFaqs(faqs.filter((_, i) => i !== index));
  const handleFaqChange = (index: number, field: "question" | "answer", value: string) => {
    const updated = [...faqs]; updated[index][field] = value; setFaqs(updated);
  };

  const handleAddPlaylist = () => setPlaylist([...playlist, { class_title: "", class_url: "", duration: "" }]);
  const handleRemovePlaylist = (index: number) => setPlaylist(playlist.filter((_, i) => i !== index));
  const handlePlaylistChange = (index: number, field: "class_title" | "class_url", value: string) => {
    const updated = [...playlist]; updated[index][field] = value; setPlaylist(updated);
  };

  // ----- UPDATED: Save Handler with SSE progress -----
const handleSave = async () => {
  if (!class_title || !description || !category || !instructor || !level) {
    alert("Please fill all required fields!"); return;
  }

  try {
    setIsSaving(true);

    const id = (crypto?.randomUUID && crypto.randomUUID()) || Math.random().toString(36).slice(2);
    setProgressId(id);

    // Reset progress panel
    setProgressTotal(0);
    setProgressItems({});

    // Open SSE and await 'ready' (or 'start') before POST
    await new Promise<void>((resolve) => {
      const es = new EventSource(`https://digitalbillionbackendcode-245452534397.europe-west1.run.app/api/v1/admin/progress/${id}`);
      eventSrcRef.current = es;

      es.onmessage = (ev) => {
        const data: ProgressMsg | { type: 'ready' } = JSON.parse(ev.data);

        if (data.type === 'ready') {
          // listener attached → we can safely POST now
          resolve();
          return; // keep handler: we also handle later messages below
        }

        if (data.type === "item-complete") {
          upsertProgress(data.index, { label: data.label, status: "done", url: data.url, percent: 100 });
          enqueueNotification(`Video ${data.index + 1} uploaded`);
        }
        if (data.type === "item-error") {
          upsertProgress(data.index, { label: data.label, status: "error", message: data.message });
          enqueueNotification(`Video ${data.index + 1} failed: ${data.message}`);
        }
        
        if (data.type === "start") {
          setProgressTotal(data.total);
          setProgressItems(() => {
            const seed: Record<number, any> = {};
            for (let i = 0; i < data.total; i++) seed[i] = { label: `Class ${i + 1}`, status: "pending" };
            return seed;
          });
        } else if (data.type === "item-start") {
          upsertProgress(data.index, { label: data.label, status: "uploading" });
        } else if (data.type === "item-progress") {
          upsertProgress(data.index, { percent: data.percent, status: "uploading" });
        } else if (data.type === "item-complete") {
          upsertProgress(data.index, { label: data.label, status: "done", url: data.url, percent: 100 });
        } else if (data.type === "item-error") {
          upsertProgress(data.index, { label: data.label, status: "error", message: data.message });
        } else if (data.type === "fatal") {
          alert(`Upload failed: ${data.message}`);
        } else if (data.type === "done") {
          setTimeout(() => { es.close(); eventSrcRef.current = null; }, 1000);
        }
      };

      es.onerror = () => {
        // optional retry/backoff
      };
    });

    // Now that SSE listener is ready, POST the form
    const formData = new FormData();
    formData.append("progress_id", id);
    formData.append("title", class_title);
    formData.append("course_description", description);
    formData.append("categories", category);
    formData.append("instructor_id", instructor);
    formData.append("level", level);
    formData.append("language", language);
    formData.append("is_paid_course", JSON.stringify(isPaid));
    if (thumbnail) formData.append("thumbnail_url", thumbnail);
    formData.append("faq", JSON.stringify(faqs));
    formData.append("playlist", JSON.stringify(playlist));

    const response = await fetch("https://digitalbillionbackendcode-245452534397.europe-west1.run.app/api/v1/admin/AddNewCourses", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    if (response.ok) {
      alert("✅ Course saved successfully!");
      setDialogOpen(false); 
    } else {
      alert(result?.error || "❌ Failed to save course");
    }
  } catch (err) {
    console.error("❌ Error saving course:", err);
    alert("Server error, check console.");
  } finally {
    setIsSaving(false);
  }
};


  return (
    <div className="space-y-6 cursor-pointer relative">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Courses</h1>
          <p className="text-gray-600 mt-1">Easily organize, edit, and update your course content in one place.</p>
        </div>
      </motion.div>

 {isSaving && progressTotal === 0 && (
   <div className="absolute inset-0 z-40 grid place-items-center bg-white/70 backdrop-blur-sm">
     <div className="flex items-center gap-3 rounded-xl border px-4 py-3 shadow-sm">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="font-medium">Preparing upload…</span>
     </div>
   </div>
  )}

{/* Dialog */}
<Dialog
  open={dialogOpen}
  onOpenChange={(open) => {
    setDialogOpen(open);
    if (!open) resetForm(); // ← clears form & progress when closed
  }}
>
  <DialogTrigger asChild>
    <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 w-[180px] hover:to-blue-700">
      <Plus className="w-4 h-4 mr-2" /> Add Course
    </Button>
  </DialogTrigger>

  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>Add New Course</DialogTitle>
    </DialogHeader>

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Course fields */}
      <Input placeholder="Course Title" value={class_title} onChange={(e) => setTitle(e.target.value)} />
      <Textarea placeholder="Course Description" value={description} onChange={(e) => setDescription(e.target.value)} />

      <div>
        <label className="text-sm font-medium">Thumbnail</label>
        <Input type="file" accept="image/*" className="mt-2" ref={fileRef}
          onChange={(e) => setThumbnail(e.target.files ? e.target.files[0] : null)} />
      </div>

      <Select onValueChange={setInstructor} value={instructor}>
        <SelectTrigger>
          <SelectValue placeholder={loadingInstructors ? "Loading..." : "Select Instructor"} />
        </SelectTrigger>
        <SelectContent>
          {instructors.map((inst) => (
            <SelectItem key={inst.instructor_code} value={inst.instructor_code}>
              {inst.name} ({inst.instructor_code})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center space-x-2">
        <Switch id="paid" checked={isPaid} onCheckedChange={setIsPaid} />
        <label htmlFor="paid" className="text-sm">Is Paid Course</label>
      </div>

      <Select onValueChange={setLevel}>
        <SelectTrigger><SelectValue placeholder="Select Level" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="beginner">Beginner</SelectItem>
          <SelectItem value="intermediate">Intermediate</SelectItem>
          <SelectItem value="advanced">Advanced</SelectItem>
        </SelectContent>
      </Select>

      <div>
        <label className="text-sm font-medium">Category</label>
        <Input placeholder="Enter Category" value={category} onChange={(e) => setCategory(e.target.value)} />
      </div>

      <Select onValueChange={setLanguage}>
        <SelectTrigger><SelectValue placeholder="Select Language" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="Telugu">Telugu</SelectItem>
          <SelectItem value="English">English</SelectItem>
          <SelectItem value="Tamil">Tamil</SelectItem>
          <SelectItem value="Kannada">Kannada</SelectItem>
          <SelectItem value="Malayalam">Malayalam</SelectItem>
        </SelectContent>
      </Select>

      {/* FAQs */}
      <div className="space-y-3">
        <h3 className="font-semibold">FAQs</h3>
        {faqs.map((faq, index) => (
          <div key={index} className="flex gap-2">
            <Input placeholder="Question" className="flex-1" value={faq.question}
              onChange={(e) => handleFaqChange(index, "question", e.target.value)} />
            <Input placeholder="Answer" className="flex-1" value={faq.answer}
              onChange={(e) => handleFaqChange(index, "answer", e.target.value)} />
            <Button variant="destructive" size="icon" onClick={() => handleRemoveFaq(index)}>
              <Trash className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button onClick={handleAddFaq} variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-1" /> Add FAQ
        </Button>
      </div>

      {/* Playlist */}
      <div className="space-y-3">
        <h3 className="font-semibold">Playlist</h3>
        {playlist.map((item, index) => (
          <div key={index} className="flex gap-2">
            <Input placeholder="Class Title" className="flex-1" value={item.class_title}
              onChange={(e) => handlePlaylistChange(index, "class_title", e.target.value)} />
            <Input placeholder="Drive URL" className="flex-1" value={item.class_url}
              onChange={(e) => handlePlaylistChange(index, "class_url", e.target.value)} />
            <Button variant="destructive" size="icon" onClick={() => handleRemovePlaylist(index)}>
              <Trash className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button onClick={handleAddPlaylist} variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-1" /> Add Class
        </Button>
      </div>

      {/* 🔥 Upload Progress Panel INSIDE the dialog */}
      {(isSaving || progressTotal > 0) && (
        <div className="rounded-xl border p-4 space-y-2">
          <div className="font-medium">Uploading videos…</div>
          <div className="text-sm text-gray-600">
            {Object.values(progressItems).filter(x => x.status === "done").length}/{progressTotal} completed
          </div>

          <div className="space-y-2 max-h-64 overflow-auto">
            {Array.from({ length: progressTotal }).map((_, i) => {
              const row = progressItems[i] || { label: `Class ${i + 1}`, status: "pending" as const };
              return (
                <div key={i} className="flex items-center justify-between rounded-lg border px-3 py-2">
                  <div className="truncate mr-2">{row.label}</div>
                  <div className="text-sm">
                    {row.status === "pending" && <span>Queued</span>}
                    {row.status === "uploading" && (
                      <span className="inline-flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {typeof row.percent === "number" ? `${row.percent}%` : "Uploading…"}
                      </span>
                    )}
                    {row.status === "done" && <span className="text-green-600">Uploaded</span>}
                    {row.status === "error" && <span className="text-red-600">Failed</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Save button */}
      <Button
        onClick={handleSave}
        disabled={isSaving}
        aria-busy={isSaving}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-60"
      >
        {isSaving ? (
          <span className="inline-flex items-center">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
          </span>
        ) : ("Save Course")}
      </Button>
    </motion.div>
  </DialogContent>
</Dialog>


      <Dialog open={notifOpen} onOpenChange={setNotifOpen}>
  <DialogContent
    className="sm:max-w-md border shadow-xl"
    onInteractOutside={(e) => e.preventDefault()} // optional: keep manual close only via button
  >
    <DialogHeader>
      <DialogTitle className="text-green-600">Upload update</DialogTitle>
    </DialogHeader>
    <div className="text-sm">{notifMsg}</div>

    {/* Manual Close Button */}
    <div className="mt-4 flex justify-end">
      <Button variant="outline" onClick={() => setNotifOpen(false)}>
        Close
      </Button>
    </div>
  </DialogContent>
</Dialog>

    </div>
  );
};
