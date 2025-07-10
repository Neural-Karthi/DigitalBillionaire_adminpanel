import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ProductModal } from "./components/ProductModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  sizes: string[];
  colors: string[];
  features: string[];
  inStock: boolean;
  images: string[];
  description: string;
  createdAt: string;
}

import { API_BASE_URL, API_ENDPOINTS } from "@/lib/api";

const PAGE_SIZE = 10;
const SORTABLE = [
  { key: "name", label: "Name" },
  { key: "category", label: "Category" },
  { key: "price", label: "Price" },
  { key: "originalPrice", label: "Original Price" },
  { key: "inStock", label: "In Stock" },
  { key: "createdAt", label: "Created" },
];

const AdminProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("createdAt_desc");
  const { toast } = useToast();
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const getToken = () => localStorage.getItem("admin_token");

  // Fetch products from server with search, pagination, sorting, and filters
  const fetchProducts = async () => {
    const params = new URLSearchParams({
      search,
      page: page.toString(),
      limit: PAGE_SIZE.toString(),
      sort,
    });
    if (categoryFilter && categoryFilter !== "all")
      params.append("category", categoryFilter);
    if (stockFilter && stockFilter !== "all")
      params.append("inStock", stockFilter);
    const res = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.PRODUCTS}?${params.toString()}`
    );
    const data = await res.json();
    setProducts(data.products);
    setTotal(data.total);
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line
  }, [search, page, sort, categoryFilter, stockFilter]);

  // Handle create
  const handleCreate = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  // Handle edit
  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!pendingDeleteId) return;
    const res = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.PRODUCT_DETAIL(pendingDeleteId)}`,
      {
        method: "DELETE",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );
    setDeleteDialogOpen(false);
    setPendingDeleteId(null);
    if (res.ok) {
      fetchProducts();
      toast({ title: "Product deleted" });
    } else {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  // Refresh list after modal closes
  const handleModalClose = () => {
    setModalOpen(false);
    setEditingProduct(null);
    fetchProducts();
  };

  // Sorting logic
  const handleSort = (key: string) => {
    const [field, order] = sort.split("_");
    if (field === key) {
      setSort(`${key}_${order === "asc" ? "desc" : "asc"}`);
    } else {
      setSort(`${key}_asc`);
    }
  };

  const pageCount = Math.ceil(total / PAGE_SIZE);
  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(pageCount, p + 1));
  useEffect(() => {
    setPage(1);
  }, [search]);

  const formatINR = (value: number | undefined) =>
    typeof value === "number"
      ? value.toLocaleString("en-IN", { style: "currency", currency: "INR" })
      : "-";
  const formatDate = (date: string | undefined) =>
    date
      ? new Date(date).toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      : "-";

  return (
    <motion.div
      className="bg-white rounded-lg shadow-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Products</h1>
        <div className="flex gap-2 items-center flex-wrap">
          <Input
            placeholder="Search by name, category, or color..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="shirts">Shirts</SelectItem>
              <SelectItem value="pants">Pants</SelectItem>
              <SelectItem value="accessories">Accessories</SelectItem>
            </SelectContent>
          </Select>
          <Select value={stockFilter} onValueChange={setStockFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Stock" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stock</SelectItem>
              <SelectItem value="true">In Stock</SelectItem>
              <SelectItem value="false">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleCreate}>Add Product</Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded shadow text-sm">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left border border-gray-300">
                Name
              </th>
              <th className="px-4 py-3 text-left border border-gray-300">
                Category
              </th>
              <th className="px-4 py-3 text-left border border-gray-300">
                Price
              </th>
              <th className="px-4 py-3 text-left border border-gray-300">
                Original Price
              </th>
              <th className="px-4 py-3 text-left border border-gray-300">
                In Stock
              </th>
              <th className="px-4 py-3 text-left border border-gray-300">
                Created
              </th>
              <th className="px-4 py-3 text-left border border-gray-300">
                Sizes
              </th>
              <th className="px-4 py-3 text-left border border-gray-300">
                Colors
              </th>
              <th className="px-4 py-3 text-left border border-gray-300">
                Features
              </th>
              <th className="px-4 py-3 text-left border border-gray-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr
                key={product._id}
                className={
                  index % 2 === 0
                    ? "bg-white border-t border-gray-300"
                    : "bg-gray-50 border-t border-gray-300 hover:bg-gray-100 transition-colors"
                }
              >
                <td className="px-4 py-3 font-semibold align-middle border border-gray-300">
                  {product.name}
                </td>
                <td className="px-4 py-3 align-middle border border-gray-300">
                  {product.category}
                </td>
                <td className="px-4 py-3 align-middle border border-gray-300">
                  {formatINR(product.price)}
                </td>
                <td className="px-4 py-3 align-middle border border-gray-300">
                  {product.originalPrice
                    ? formatINR(product.originalPrice)
                    : "-"}
                </td>
                <td className="px-4 py-3 align-middle border border-gray-300">
                  {product.inStock ? (
                    <span className="text-green-600 font-bold">Yes</span>
                  ) : (
                    <span className="text-red-600 font-bold">No</span>
                  )}
                </td>
                <td className="px-4 py-3 align-middle border border-gray-300">
                  {formatDate(product.createdAt)}
                </td>
                <td className="px-4 py-3 align-middle border border-gray-300">
                  {product.sizes.join(", ")}
                </td>
                <td className="px-4 py-3 align-middle border border-gray-300">
                  {product.colors.join(", ")}
                </td>
                <td className="px-4 py-3 align-middle border border-gray-300">
                  {product.features.join(", ")}
                </td>
                <td className="px-4 py-3 align-middle border border-gray-300 space-y-2 flex flex-col items-start">
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={() => handleEdit(product)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="lg"
                    variant="destructive"
                    className="w-full"
                    onClick={() => {
                      setPendingDeleteId(product._id);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <Button onClick={handlePrev} disabled={page === 1} variant="outline">
          Prev
        </Button>
        <span>
          Page {page} of {pageCount || 1}
        </span>
        <Button
          onClick={handleNext}
          disabled={page === pageCount || pageCount === 0}
          variant="outline"
        >
          Next
        </Button>
      </div>
      <ProductModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        product={editingProduct}
      />
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this product? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingDeleteId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default AdminProductList;
