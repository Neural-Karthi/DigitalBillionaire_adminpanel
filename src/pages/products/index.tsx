import React from "react";
import AdminProductList from "./AdminProductList";

const ProductsPage: React.FC = () => {
  return (
    <div className="">
      <h1 className="text-3xl font-bold mb-2">Product Management</h1>
      <p className="mb-6 text-gray-600">
        View, add, edit, or delete products below. Use the search and pagination
        controls for easy management.
      </p>
      <AdminProductList />
    </div>
  );
};

export default ProductsPage;
