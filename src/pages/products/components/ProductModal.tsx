import React, { useState, useEffect, ChangeEvent } from "react";
import { X, Upload, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/api";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: any;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    originalPrice: "",
    description: "",
    sizes: [] as string[],
    colors: [] as string[],
    features: [] as string[],
    inStock: true,
    images: [] as string[],
  });
  const { toast } = useToast();
  const [localImages, setLocalImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [rawInputs, setRawInputs] = useState({
    sizes: "",
    colors: "",
    features: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const getToken = () => {
    const token = localStorage.getItem("admin_token");
    return token;
  };

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        category: product.category || "",
        price: product.price?.toString() || "",
        originalPrice: product.originalPrice?.toString() || "",
        description: product.description || "",
        sizes: product.sizes || [],
        colors: product.colors || [],
        features: product.features || [],
        inStock: product.inStock !== undefined ? product.inStock : true,
        images: product.images || [],
      });
      setRawInputs({
        sizes: (product.sizes || []).join(", "),
        colors: (product.colors || []).join(", "),
        features: (product.features || []).join(", "),
      });
      setImagePreviews(product.images || []);
      setLocalImages([]);
    } else {
      setFormData({
        name: "",
        category: "",
        price: "",
        originalPrice: "",
        description: "",
        sizes: [],
        colors: [],
        features: [],
        inStock: true,
        images: [],
      });
      setRawInputs({ sizes: "", colors: "", features: "" });
      setImagePreviews([]);
      setLocalImages([]);
    }
  }, [product]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Helper for comma-separated input fields
  const handleArrayInput = (field: string, value: string) => {
    // Always update the input as a string for display
    setFormData((prev) => ({
      ...prev,
      [field]: value
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean),
    }));
  };

  // Helper to handle onBlur for array fields
  const handleArrayBlur = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean),
    }));
  };

  // Handle image URLs as comma-separated for now (can be replaced with upload logic)
  const handleImagesInput = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      images: value
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean),
    }));
  };

  // Preview local images before upload
  const handleImageFiles = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    setLocalImages((prev) => [...prev, ...newFiles]);
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImagePreviews((prev) => [...prev, e.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove image (both preview and local file)
  const handleRemoveImage = (idx: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
    setLocalImages((prev) => prev.filter((_, i) => i !== idx));
  };

  // Upload images to server and get URLs
  const uploadImageToServer = async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.UPLOAD}`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    return data.url;
  };

  // Validation function
  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = "Product name is required (min 2 chars)";
    }
    if (!formData.category) {
      newErrors.category = "Category is required";
    }
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = "Valid price is required";
    }
    if (!formData.originalPrice || isNaN(Number(formData.originalPrice)) || Number(formData.originalPrice) < 0) {
      newErrors.originalPrice = "Original price is required and must be a positive number";
    }
    if (!formData.description || formData.description.length > 500) {
      newErrors.description = !formData.description ? "Description is required" : "Description too long (max 500 chars)";
    }
    if (!rawInputs.sizes || !rawInputs.sizes.split(",").every(s => s.trim().length > 0)) {
      newErrors.sizes = "Sizes are required as comma separated values";
    }
    if (!rawInputs.colors || !rawInputs.colors.split(",").every(c => c.trim().length > 0)) {
      newErrors.colors = "Colors are required as comma separated values";
    }
    if (!rawInputs.features || !rawInputs.features.split(",").every(f => f.trim().length > 0)) {
      newErrors.features = "Features are required as comma separated values";
    }
    if (imagePreviews.length === 0 && (!formData.images || formData.images.length === 0)) {
      newErrors.images = "At least one product image is required";
    }
    if (localImages.some(img => img.size > 10 * 1024 * 1024)) {
      newErrors.images = "Each image must be less than 10MB";
    }
    return newErrors;
  };

  // On submit, upload images, then submit product
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      setLoading(false);
      return;
    }
    setLoading(true);
    // Ensure arrays are up to date from rawInputs
    const sizes = rawInputs.sizes
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
    const colors = rawInputs.colors
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
    const features = rawInputs.features
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
    let imageUrls = formData.images;
    if (localImages.length > 0) {
      imageUrls = [];
      for (let i = 0; i < localImages.length; i++) {
        const url = await uploadImageToServer(localImages[i]);
        imageUrls.push(url);
      }
    }
    const productData = {
      ...formData,
      sizes,
      colors,
      features,
      price: parseFloat(formData.price),
      originalPrice: formData.originalPrice
        ? parseFloat(formData.originalPrice)
        : undefined,
      images: imageUrls,
    };

    try {
      let res;
      if (product && product._id) {
        // Update
        res = await fetch(
          `${API_BASE_URL}${API_ENDPOINTS.PRODUCT_DETAIL(product._id)}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${getToken()}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(productData),
          }
        );
      } else {
        // Create
        res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN_PRODUCTS}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(productData),
        });
      }
      if (!res.ok) {
        const error = await res.json();
        toast({
          title: "Error",
          description: error.msg || "Failed to save product",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      toast({
        title: product ? "Product updated" : "Product created",
        description: `${formData.name} has been ${product ? "updated" : "created"} successfully.`,
      });
      setLoading(false);
      onClose();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save product",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  // Drag and drop handlers
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleImageFiles(e.dataTransfer.files);
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl overflow-y-auto max-h-screen">
        <DialogHeader>
          <DialogTitle>
            {product ? "Edit Product" : "Add New Product"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter product name"
                required
              />
              {errors.name && <div className="text-red-500 text-xs">{errors.name}</div>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="shirts">Shirts</SelectItem>
                  <SelectItem value="pants">Pants</SelectItem>
                  <SelectItem value="accessories">Accessories</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && <div className="text-red-500 text-xs">{errors.category}</div>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                placeholder="0.00"
                required
              />
              {errors.price && <div className="text-red-500 text-xs">{errors.price}</div>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="originalPrice">Original Price (₹)</Label>
              <Input
                id="originalPrice"
                type="number"
                step="0.01"
                value={formData.originalPrice}
                onChange={(e) =>
                  handleInputChange("originalPrice", e.target.value)
                }
                placeholder="0.00"
              />
              {errors.originalPrice && <div className="text-red-500 text-xs">{errors.originalPrice}</div>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sizes">Sizes (comma separated)</Label>
              <Input
                id="sizes"
                value={rawInputs.sizes}
                onChange={(e) =>
                  setRawInputs((prev) => ({ ...prev, sizes: e.target.value }))
                }
                onBlur={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    sizes: e.target.value
                      .split(",")
                      .map((v) => v.trim())
                      .filter(Boolean),
                  }))
                }
                placeholder="S, M, L, XL"
                required
              />
              {errors.sizes && <div className="text-red-500 text-xs">{errors.sizes}</div>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="colors">Colors (comma separated)</Label>
              <Input
                id="colors"
                value={rawInputs.colors}
                onChange={(e) =>
                  setRawInputs((prev) => ({ ...prev, colors: e.target.value }))
                }
                onBlur={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    colors: e.target.value
                      .split(",")
                      .map((v) => v.trim())
                      .filter(Boolean),
                  }))
                }
                placeholder="Red, Blue, Black"
                required
              />
              {errors.colors && <div className="text-red-500 text-xs">{errors.colors}</div>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="features">Features (comma separated)</Label>
              <Input
                id="features"
                value={rawInputs.features}
                onChange={(e) =>
                  setRawInputs((prev) => ({
                    ...prev,
                    features: e.target.value,
                  }))
                }
                onBlur={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    features: e.target.value
                      .split(",")
                      .map((v) => v.trim())
                      .filter(Boolean),
                  }))
                }
                placeholder="100% Cotton, Machine Washable"
                required
              />
              {errors.features && <div className="text-red-500 text-xs">{errors.features}</div>}
            </div>
            <div className="space-y-2 flex items-center mt-6">
              <Label htmlFor="inStock" className="mr-2">
                In Stock
              </Label>
              <input
                id="inStock"
                type="checkbox"
                checked={formData.inStock}
                onChange={(e) => handleInputChange("inStock", e.target.checked)}
                className="h-5 w-5"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Product Images</Label>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() =>
                document.getElementById("image-upload-input")?.click()
              }
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  Drag and drop images here, or click to select files
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
              <input
                id="image-upload-input"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleImageFiles(e.target.files)}
              />
            </div>
            {errors.images && <div className="text-red-500 text-xs">{errors.images}</div>}
            {imagePreviews.length > 0 && (
              <div className="flex flex-wrap gap-4 mt-4 justify-center">
                {imagePreviews.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={img}
                      alt={`Product Preview ${idx + 1}`}
                      className="h-24 w-24 object-cover rounded shadow border"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(idx);
                      }}
                      className="absolute top-0 right-0 bg-black bg-opacity-60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Product description..."
              rows={3}
              required
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin h-4 w-4" />
                  Saving...
                </span>
              ) : product ? (
                "Update Product"
              ) : (
                "Create Product"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
