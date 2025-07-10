import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/api";

interface Product {
  _id: string;
  name: string;
  price: number;
  soldCount: number;
  category: string;
}

export const TopProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const token = localStorage.getItem("admin_token");
        const response = await fetch(
          `${API_BASE_URL}/api/Admin/Topboard`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch top products");
        }

        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching top products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopProducts();
  }, []);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-IN").format(num);
  };

  const getTopProductsWithRealData = () => {
    return products.map((product, index) => {
      const revenue = product.price * product.soldCount;
      return {
    id: product?._id,
        name: product?.name,
        sales: product?.sales,
        revenue: product?.revenue,
        trend: "up", 
      };
    });
  };

  const currentTopProducts = getTopProductsWithRealData();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Products</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-4 text-center">
              <p className="text-gray-500 font-medium">Loading...</p>
              {[1, 2, 3, 4, 5].map((index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg animate-pulse"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-300 rounded-lg"></div>
                    <div>
                      <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="h-4 bg-gray-300 rounded w-20 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-8"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : currentTopProducts.length > 0 ? (
            currentTopProducts.map((product, index) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatNumber(product.sales)} sales
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{product.revenue}</p>
                  <Badge
                    variant={product.trend === "up" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {product.trend === "up" ? "↗" : "↘"}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No products found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
