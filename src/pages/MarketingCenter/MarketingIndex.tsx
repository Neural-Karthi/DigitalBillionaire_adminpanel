import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Megaphone, ArrowLeft, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { API_BASE_URL } from "@/lib/api";
import CategoryMarketing from "./components/CategoryMarketing";

interface Category {
  id: number;
  name: string;
}

export const MarketingIndex = () => {
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedlist, setselectedlist] = useState("");
  const [searchText, setSearchText] = useState("");

  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/Admin/get-categories`);
        setCategoryList(response.data?.categories || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    if (!categoryName.trim()) {
      setFormError("Category name is required");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      const response = await axios.post(`${API_BASE_URL}/api/Admin/add-category`, {
        name: categoryName.trim(),
      });
      const newCategory = response.data?.category ?? response.data;
      setCategoryList((prev) => [...prev, newCategory]);
      setCategoryName("");
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to add category:", error);
      setFormError("Failed to add category. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;

    setIsDeleting(true);
    try {
      await axios.delete(`${API_BASE_URL}/api/Admin/delete-category/${categoryToDelete.id}`);
      setCategoryList((prev) => prev.filter((cat) => cat.id !== categoryToDelete.id));
      setDeleteConfirmDialog(false);
      setCategoryToDelete(null);
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Failed to delete category. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCategories = categoryList.filter((category) =>
    category.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="min-h-screen cursor-pointer">
      <div className="mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Marketing Center</h1>
            <p className="text-gray-600 mt-1">
              Upload and manage all promotional, branding, and affiliate materials
            </p>
          </div>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Megaphone className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center items-center p-4 h-40 text-lg text-gray-600 mt-10">
            Loading categories...
          </div>
        ) : selectedlist === "" ? (
          <>
            <div className="mt-8">
              <Input
                type="text"
                placeholder="Search categories..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full sm:w-96 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex flex-wrap gap-4 mt-6">
              {filteredCategories.map((category, index) => (
                <div
                  key={category.id}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{
                    position: "relative",
                    fontSize: "1.125rem",
                    fontWeight: 600,
                    background:
                      hoveredIndex === index
                        ? "linear-gradient(to right, #6b21a8, #1e3a8a)"
                        : "linear-gradient(to right, #c4b5fd, #bfdbfe)",
                    color: hoveredIndex === index ? "#ffffff" : "#000000",
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.75rem",
                    padding: "1rem",
                    width: "350px",
                    height: "150px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                    transition: "all 0.3s ease-in-out",
                    transform: hoveredIndex === index ? "scale(1.05)" : "scale(1)",
                    cursor: "pointer",
                  }}
                  onClick={() => setselectedlist(category.name)}
                >
                  {category.name}

                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className="absolute top-2 right-2 p-1 rounded hover:bg-gray-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical size={18} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-red-600 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCategoryToDelete(category);
                          setDeleteConfirmDialog(true);
                        }}
                      >
                        Delete Category
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="mt-10 cursor-pointer">
            <h1
              onClick={() => setselectedlist("")}
              className="text-lg flex items-center gap-2 text-gray-700 hover:text-black"
            >
              <ArrowLeft size={20} />
              Back
            </h1>
            <CategoryMarketing selectedata={selectedlist} />
          </div>
        )}
      </div>

      {/* Add Category Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium">Category Name</label>
            <Input
              placeholder="Enter category name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
            />
            {formError && <p className="text-red-500 text-sm">{formError}</p>}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddCategory}
              disabled={isSubmitting}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isSubmitting ? "Adding..." : "Add Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmDialog} onOpenChange={setDeleteConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Category?</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-gray-700">
            <p>
              Are you sure you want to delete the category{" "}
              <strong className="text-black">"{categoryToDelete?.name}"</strong>?
            </p>
            <p className="mt-2 text-red-500">
              Note: All videos and images under this category will also be permanently deleted.
            </p>
          </div>
          <DialogFooter className="pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteConfirmDialog(false);
                setCategoryToDelete(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDeleteCategory}
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
