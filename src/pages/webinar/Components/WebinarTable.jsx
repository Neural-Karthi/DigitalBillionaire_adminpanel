import React, { useEffect, useState } from "react";
import { Edit, Plus, Trash } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/api";

const formatTime12Hour = (timeStr) => {
  if (!timeStr) return "";
  const [hour, minute] = timeStr.split(":");
  const h = parseInt(hour, 10);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${minute} ${suffix}`;
};

export const WebinarTable = () => {
  const [webinars, setWebinars] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedWebinar, setSelectedWebinar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [webinarData, setWebinarData] = useState({
    title: "",
    trainer: "",
    date: "",
    language: "",
    timingFrom: "",
    timingTo: "",
    imageFile: null,
  });

  const [webinarToDelete, setWebinarToDelete] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const fetchWebinars = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/Webinar/GetWebinars`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch webinars");
      setWebinars(data.webinars || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebinars();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setWebinarData((prev) => ({ ...prev, [name]: value }));
  };

  const openAddDialog = () => {
    setIsEditing(false);
    setSelectedWebinar(null);
    setWebinarData({
      title: "",
      trainer: "",
      date: "",
      language: "",
      timingFrom: "",
      timingTo: "",
      imageFile: null,
    });
    setIsDialogOpen(true);
  };

  const handleEditClick = (webinar) => {
    const fromTime = webinar.timing_from || "";
    const toTime = webinar.timing_to || "";
    setIsEditing(true);
    setSelectedWebinar(webinar);
    setWebinarData({
      title: webinar.title,
      trainer: webinar.trainer,
      date: webinar.date,
      language: webinar.language,
      timingFrom: fromTime,
      timingTo: toTime,
      imageFile: null,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (webinar) => {
    setWebinarToDelete(webinar);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteWebinar = async () => {
    if (!webinarToDelete?.id) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/Webinar/DeleteWebinar/${webinarToDelete.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete webinar");

      toast.success("Webinar deleted successfully");
      setWebinars((prev) => prev.filter((w) => w.id !== webinarToDelete.id));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsDeleting(false);
      setWebinarToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleCreateWebinar = async () => {
    setIsSubmitting(true);
    const token = localStorage.getItem("admin_token");
    const formData = new FormData();
    formData.append("title", webinarData.title);
    formData.append("trainer", webinarData.trainer);
    formData.append("date", webinarData.date);
    formData.append("language", webinarData.language);
    formData.append("timingFrom", webinarData.timingFrom);
    formData.append("timingTo", webinarData.timingTo);

    const endpoint = `${API_BASE_URL}/api/v1/admin/Webinar/AddWebinar`;

    const submitForm = async (base64Image = null) => {
      if (base64Image) {
        formData.append("image", base64Image);
      }

      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to create webinar");
        toast.success(data.message || "Webinar created successfully");
        setIsDialogOpen(false);
        fetchWebinars();
      } catch (err) {
        toast.error(err.message);
      } finally {
        setIsSubmitting(false);
      }
    };

    if (webinarData.imageFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        submitForm(reader.result);
      };
      reader.readAsDataURL(webinarData.imageFile);
    } else {
      submitForm();
    }
  };

  const handleUpdateWebinar = async () => {
    if (!selectedWebinar?.id) return toast.error("Missing webinar ID");
    setIsSubmitting(true);
    const token = localStorage.getItem("admin_token");
    const formData = new FormData();
    formData.append("id", selectedWebinar.id.toString());
    formData.append("title", webinarData.title);
    formData.append("trainer", webinarData.trainer);
    formData.append("date", webinarData.date);
    formData.append("language", webinarData.language);
    formData.append("timingFrom", webinarData.timingFrom);
    formData.append("timingTo", webinarData.timingTo);

    const endpoint = `${API_BASE_URL}/api/v1/admin/Webinar/UpdateWebinar`;

    const submitForm = async (base64Image = null) => {
      if (base64Image) {
        formData.append("image", base64Image);
      }

      try {
        const res = await fetch(endpoint, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to update webinar");
        toast.success(data.message || "Webinar updated successfully");
        setIsDialogOpen(false);
        fetchWebinars();
      } catch (err) {
        toast.error(err.message);
      } finally {
        setIsSubmitting(false);
      }
    };

    if (webinarData.imageFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        submitForm(reader.result);
      };
      reader.readAsDataURL(webinarData.imageFile);
    } else {
      submitForm();
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold"></h2>
        <Button onClick={openAddDialog}>
          <Plus className="w-4 h-4 mr-2" /> Add Webinar
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading webinars...</div>
          ) : error ? (
            <div className="p-6 text-center text-red-500">{error}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Trainer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead>Timings</TableHead>
                  <TableHead>Banner</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {webinars.map((webinar) => (
                  <TableRow key={webinar.id}>
                    <TableCell>{webinar.title}</TableCell>
                    <TableCell>{webinar.trainer}</TableCell>
                    <TableCell>
                      {new Date(webinar.date).toLocaleDateString("en-US", {
                        weekday: "short", 
                        day: "2-digit", 
                        month: "short",   
                        year: "numeric", 
                      })}
                    </TableCell>
                    <TableCell>{webinar.language}</TableCell>
                    <TableCell>
                      {formatTime12Hour(webinar.timing_from)} -{" "}
                      {formatTime12Hour(webinar.timing_to)}
                    </TableCell>
                    <TableCell>
                      {webinar.image ? (
                        <img
                          src={webinar.image}
                          alt="Webinar Banner"
                          className="h-12 w-20 object-cover rounded"
                        />
                      ) : (
                        <span className="text-gray-400 italic">No image</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(webinar)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(webinar)}
                      >
                        <Trash className="w-4 h-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Webinar" : "Add Webinar"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input name="title" value={webinarData.title} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Trainer</label>
              <Input name="trainer" value={webinarData.trainer} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Input
                type="date"
                name="date"
                min={new Date().toISOString().split("T")[0]}
                value={webinarData.date}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Language</label>
              <select
                name="language"
                value={webinarData.language}
                onChange={handleInputChange}
                className="w-full border px-3 py-2 rounded-md"
              >
                <option value="">Select Language</option>
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Tamil">Tamil</option>
                <option value="Telugu">Telugu</option>
                <option value="Malayalam">Malayalam</option>
                <option value="Kannada">Kannada</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">From Time</label>
                <Input
                  type="time"
                  name="timingFrom"
                  value={webinarData.timingFrom}
                  onChange={handleInputChange}
                  step="900"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">To Time</label>
                <Input
                  type="time"
                  name="timingTo"
                  value={webinarData.timingTo}
                  onChange={handleInputChange}
                  step="900"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Banner Image</label>
              <Input
                type="file"
                accept="image/*"
                className="cursor-pointer"
                onChange={(e) =>
                  setWebinarData((prev) => ({
                    ...prev,
                    imageFile: e.target.files[0],
                  }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={isEditing ? handleUpdateWebinar : handleCreateWebinar}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? isEditing
                  ? "Updating..."
                  : "Creating..."
                : isEditing
                ? "Update"
                : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this webinar?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteWebinar} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WebinarTable;
