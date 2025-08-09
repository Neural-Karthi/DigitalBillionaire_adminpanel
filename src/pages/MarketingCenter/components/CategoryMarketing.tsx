import React, { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/api";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CategoryMarketingProps {
  selectedata: string;
}

const AddPromotionDialog: React.FC<CategoryMarketingProps> = ({ selectedata }) => {
  const [open, setOpen] = useState(false);
  const [videoTitle, setVideoTitle] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<"video" | "image" | "pdf"  | null>(null);

  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [errors, setErrors] = useState({
    title: "",
    media: "",
    thumbnail: "",
  });

  const [promotions, setPromotions] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<null | number>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  const handleFileChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  type: "media" | "thumbnail"
) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (type === "media") {
    setMediaType(
      file.type.startsWith("video/")
        ? "video"
        : file.type.startsWith("image/")
        ? "image"
        : file.type === "application/pdf"
        ? "pdf"
        : null
    );
    setMediaFile(file); // <-- IMPORTANT: Set the actual media file
  } else {
    setThumbnail(file);
  }
};


  const validateForm = () => {
    const newErrors = {
      title: "",
      media: "",
      thumbnail: "",
    };
    let isValid = true;

    if (!videoTitle.trim()) {
      newErrors.title = "Title is required.";
      isValid = false;
    }
    if (!mediaFile) {
      newErrors.media = "Media file is required.";
      isValid = false;
    }
    if (!thumbnail) {
      newErrors.thumbnail = "Thumbnail image is required.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const formData = new FormData();
      formData.append("title", videoTitle);
      formData.append("category", selectedata);
      formData.append("media", mediaFile as Blob);
      formData.append("thumbnail", thumbnail as Blob);

      setUploadProgress(0);

      await axios.post(`${API_BASE_URL}/api/v1/admin/PromotionalMaterial/upload-promotion`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          setUploadProgress(percentCompleted);
        },
      });

      setUploadProgress(null);
      setVideoTitle("");
      setMediaFile(null);
      setThumbnail(null);
      setMediaType(null);
      setErrors({ title: "", media: "", thumbnail: "" });
      setOpen(false);
      setPage(1); // Reset to first page after upload
      fetchdetails(1);
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadProgress(null);
    }
  };

  const handleDelete = async () => {
    if (!videoToDelete) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/v1/admin/PromotionalMaterial/delete-promotion/${videoToDelete}`);
      setDeleteDialogOpen(false);
      setVideoToDelete(null);
      fetchdetails(page); // Refresh same page after deletion
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const fetchdetails = async (currentPage = page) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/admin/PromotionalMaterial/promotional_videos/${selectedata}?page=${currentPage}&limit=${limit}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch");
      setPromotions(data.data);
      setTotalPages(data.pagination.totalPages || 1);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchdetails(page);
  }, [page]);

  return (
    <div>
      <div className="flex justify-between items-center my-8">
        <h2 className="text-2xl font-semibold">{selectedata}</h2>
        <Button onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Upload new video / Image
        </Button>
      </div>

      <Card>
        <CardContent className="p-0 px-5">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>S.no</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Upload Type</TableHead>
                <TableHead>Video/Image</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promotions.map((item: any, index: number) => (
                <TableRow key={item.id}>
                  <TableCell>{(page - 1) * limit + index + 1}</TableCell>
                  <TableCell>{item.title}</TableCell>
                  <TableCell className="capitalize">{item.uploadtype}</TableCell>
                  <TableCell>
                    <img
                      src={item.thumbnail_url}
                      alt={item.title}
                      className="w-16 h-12 object-cover cursor-pointer rounded"
                      onClick={() => window.open(item.media_url, "_blank")}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Trash2
                      className="w-5 h-5 text-red-500 cursor-pointer"
                      onClick={() => {
                        setVideoToDelete(item.id);
                        setDeleteDialogOpen(true);
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          <div className="flex justify-between items-center py-4">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-700">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={page === totalPages}
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Upload Promotional Video/Image</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                placeholder="Enter title"
              />
              {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="media">Media (Video/Image)</Label>
              <Input
  id="media"
  type="file"
  accept="video/*,image/*,application/pdf"
  onChange={(e) => handleFileChange(e, "media")}
/>

              {errors.media && <p className="text-red-500 text-sm">{errors.media}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnail">Thumbnail (Image)</Label>
              <Input
                id="thumbnail"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "thumbnail")}
              />
              {errors.thumbnail && <p className="text-red-500 text-sm">{errors.thumbnail}</p>}
            </div>

            {uploadProgress !== null && (
              <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
                <div
                  className="bg-blue-600 h-4 rounded-full transition-all duration-200 ease-in-out"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
                <p className="text-sm text-center text-gray-700 mt-1">
                  Uploading: {uploadProgress}%
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={handleSubmit} disabled={uploadProgress !== null}>
              {uploadProgress !== null ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
          </DialogHeader>
          <p>This will permanently delete the media from the database and GCS.</p>
          <DialogFooter className="mt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddPromotionDialog;
