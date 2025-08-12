import React, { useEffect, useState } from "react";
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
import { API_BASE_URL } from "@/lib/api";

interface User {
  id: string;
  contact_id: string;
  guide_code: string;
  account_type: string;
  account_holder_name: string;
  account_number: string;
  ifsc_code: string;
  bank_name: string;
  is_email_verified: boolean;
  active: boolean;
  total_pending_amount: string;
  pending_order_ids: string[];
}

interface UserTableProps {
  searchTerm: string;
  onStatsChange?: (data: {
    totalPendingAmount: number;
    verified: { userCount: number; totalAmount: number };
    unverified: { userCount: number; totalAmount: number };
  }) => void;
}

export const Enrollmenttable: React.FC<UserTableProps> = ({
  searchTerm
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const limit = 10;
  const totalPages = Math.ceil(totalUsers / limit);


 useEffect(() => {
  const firstLoad = { current: true };

  const fetchReferralAmounts = async () => {
    if (firstLoad.current) {
      setLoading(true);   // Show loader only on first load
    }
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search: searchTerm,
      });

      const response = await fetch(
        `${API_BASE_URL}/api/Admin/getuserpayrolllist?${queryParams.toString()}`
      );
      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error || "Failed to fetch referral amounts");
      }
      setUsers(json.data);
      setTotalUsers(json.pagination.total);
    } catch (error: any) {
      setError(error.message || "Error fetching referral amounts");
      console.error("fetchReferralAmounts error:", error);
    } finally {
      if (firstLoad.current) {
        setLoading(false);
        firstLoad.current = false; // mark first load done
      }
    }
  };

  fetchReferralAmounts();

  const intervalId = setInterval(() => {
    fetchReferralAmounts(); // no loader for subsequent fetches
  }, 5000);

  return () => clearInterval(intervalId);
}, [page, searchTerm]);



  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading users...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <Table>
  <TableHeader>
    <TableRow>
      <TableHead>Guide Code</TableHead>
      <TableHead>Contact ID</TableHead>
      <TableHead>Fund Account ID</TableHead>
      <TableHead>Account Holder Name</TableHead>
      <TableHead>Account Type</TableHead>
      <TableHead>Bank Name</TableHead>
      <TableHead>Account Number</TableHead>
      <TableHead>IFSC Code</TableHead>
      <TableHead>Total Pending Earnings</TableHead>
      <TableHead>Status</TableHead> {/* Added Status column header */}
    </TableRow>
  </TableHeader>
  <TableBody>
    {users.length === 0 ? (
      <TableRow>
        <TableCell colSpan={9} className="text-center">
          No users found.
        </TableCell>
      </TableRow>
    ) : (
      users.map((user) => {
        // Determine status display and style
        let statusText = "";
        let statusStyle = {};

        if (user.payout_status === "no_payout_requested") {
          statusText = "Yet to Payout";
          statusStyle = {
            color: "blue",
            backgroundColor: "#cce5ff", // light blue background
            padding: "4px 8px",
            borderRadius: "4px",
            display: "inline-block",
            fontWeight: "bold",
          };
        } else if (user.payout_status === "requested") {
          statusText = "In Process";
          // Optional: Add style if you want
          statusStyle = {
            color: "orange",
            fontWeight: "bold",
          };
        } else {
          // fallback text and style for other or missing status
          statusText = user.payout_status || "Unknown";
          statusStyle = {};
        }

        return (
          <TableRow key={user.id}>
            <TableCell>
              <div>
                <h1>{user.guide_code}</h1>
              </div>
            </TableCell>
            <TableCell>{user.contact_id}</TableCell>
            <TableCell>{user.id}</TableCell>
            <TableCell>{user.account_holder_name}</TableCell>
            <TableCell>{user.account_type}</TableCell>
            <TableCell>{user.bank_name}</TableCell>
            <TableCell>{user.account_number}</TableCell>
            <TableCell>{user.ifsc_code}</TableCell>
            <TableCell>₹{parseFloat(user.total_pending_amount).toFixed(2)}</TableCell>
            <TableCell style={statusStyle}>{statusText}</TableCell>
          </TableRow>
        );
      })
    )}
  </TableBody>
</Table>

          <div className="flex justify-end items-center p-4 gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {page} of {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default Enrollmenttable;
