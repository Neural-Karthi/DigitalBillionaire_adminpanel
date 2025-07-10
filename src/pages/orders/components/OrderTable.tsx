import React, { useEffect, useState } from "react";
import { Eye, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/api";

// Dummy data commented out for real API integration
// const orders = [ ... ];

interface OrderTableProps {
  searchTerm: string;
  currentPage: number;
  pageSize: number;
  onTotalOrders: (count: number) => void;
}

interface Order {
  _id: string;
  orderId: string;
  orderBy: {
    firstName: string;
    lastName: string;
    email: string;
  };
  placedAt: string;
  status: string;
  quantity: number;
  price: number;
  productId: any;
  paymentMethod: string;
}

const STATUS_OPTIONS = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export const OrderTable: React.FC<OrderTableProps> = ({
  searchTerm,
  currentPage,
  pageSize,
  onTotalOrders,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rowLoading, setRowLoading] = useState<{ [id: string]: boolean }>({});
  const [rowError, setRowError] = useState<{ [id: string]: string | null }>({});
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("admin_token");
        const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ORDERS}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch orders");
        setOrders(data.orders || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setRowLoading((prev) => ({ ...prev, [orderId]: true }));
    setRowError((prev) => ({ ...prev, [orderId]: null }));
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.ORDER_STATUS(orderId)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update status");
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
      toast({
        title: "Order status updated",
        description: `Order status changed to "${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}".`,
        variant: "default",
      });
    } catch (err: any) {
      setRowError((prev) => ({
        ...prev,
        [orderId]: err.message || "Failed to update status",
      }));
      toast({
        title: "Failed to update order status",
        description: err.message || "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setRowLoading((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const filteredOrders = orders.filter((order) => {
    const customer = order.orderBy
      ? `${order.orderBy.firstName} ${order.orderBy.lastName}`
      : "";
    const productName = order.productId?.name || "";
    return (
      customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderBy?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      productName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  useEffect(() => {
    onTotalOrders(filteredOrders.length);
  }, [filteredOrders.length, onTotalOrders]);

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return <Badge className="bg-green-100 text-green-800">Delivered</Badge>;
      case "shipped":
        return <Badge className="bg-blue-100 text-blue-800">Shipped</Badge>;
      case "processing":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>
        );
      case "pending":
        return <Badge className="bg-gray-100 text-gray-800">Pending</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">Loading orders...</div>
    );
  }
  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Order Name</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-400">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedOrders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell className="font-medium">
                    {order.orderId || order._id}
                  </TableCell>
                  <TableCell>{order.productId?.name || "N/A"}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">
                        {order.orderBy
                          ? `${order.orderBy.firstName} ${order.orderBy.lastName}`
                          : "N/A"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.orderBy?.email || "N/A"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {order.placedAt
                      ? new Date(order.placedAt).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <select
                        value={order.status}
                        disabled={rowLoading[order._id]}
                        onChange={(e) =>
                          handleStatusChange(order._id, e.target.value)
                        }
                        className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt.charAt(0).toUpperCase() + opt.slice(1)}
                          </option>
                        ))}
                      </select>
                      {getStatusBadge(order.status)}
                      {rowLoading[order._id] && (
                        <span className="text-xs text-blue-500 ml-2">
                          Updating...
                        </span>
                      )}
                    </div>
                    {rowError[order._id] && (
                      <div className="text-xs text-red-500 mt-1">
                        {rowError[order._id]}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{order.quantity}</TableCell>
                  <TableCell>
                    ₹{order.price?.toFixed(2)} <br />
                    <span className="text-xs text-gray-500">
                      {order.paymentMethod}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
