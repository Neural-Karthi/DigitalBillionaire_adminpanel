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
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"; // ensure this path matches your setup
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "@/lib/api";
interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  guide_code: string;
  created_at?: string;
  country?: string;
  is_email_verified: boolean;
  last_purchased_package: string;
  customer_image: string | null;
  full_name: string;
  account_type: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  account_verification_status: string;
  total_earning_amount: number;
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
  searchTerm,
  onStatsChange,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openSession, setOpenSession] = useState<any>(null);
  const limit = 10;

  const totalPages = Math.ceil(totalUsers / limit);

  const [session, setSession] = useState<any>(true);

const navigator = useNavigate();

useEffect(() => {
  const checkPendingSession = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Admin/GetInprocessPayments`);
      const data = await response.json();

      if (data.session) {
        setOpenSession(data.session);
        setSession(false);
      } else {
        setSession(false);
      }
    } catch (err) {
      console.error("Failed to check session:", err);
    }
  };

  checkPendingSession();
}, []);

useEffect(() => {
  if (session === false) {
    const fetchReferralAmounts = async () => {
      setLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          search: searchTerm,
        });

        const response = await fetch(
          `${API_BASE_URL}/api/Admin/GetreferralAmount?${queryParams.toString()}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch referral amounts");
        }

        const {
          data,
          totalUsers,
          totalPendingAmount,
          verified,
          unverified,
        } = await response.json();

        setUsers(data);
        setTotalUsers(totalUsers);

        if (onStatsChange) {
          onStatsChange({
            totalPendingAmount,
            verified,
            unverified,
          });
        }
      } catch (error: any) {
        setError(error.message || "Error fetching referral amounts");
      } finally {
        setLoading(false);
      }
    };

    fetchReferralAmounts();
  }
}, [session, page, searchTerm]);


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
                <TableHead>Name on Bank Book</TableHead>
                <TableHead>Account Type</TableHead>
                <TableHead>Bank Name</TableHead>
                <TableHead>Account Number</TableHead>
                <TableHead>Ifsc Code</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Account verification status</TableHead>
                <TableHead>Total Pending Earnings</TableHead>
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
                users.map((user) => (
                  <TableRow key={user.guide_code}>
                    <TableCell>
                      <div>
                        <h1>{user.guide_code}</h1>
                        <p className="text-sm opacity-75 truncate w-full max-w-[150px]">
                          {user.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{user.full_name}</TableCell>
                    <TableCell>{user.account_type}</TableCell>
                    <TableCell>{user.bank_name}</TableCell>
                    <TableCell>{user.account_number}</TableCell>
                    <TableCell>{user.ifsc_code}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>
                      {user.account_verification_status === "-" ? (
                        <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium">
                          Need to verify
                        </span>
                      ) : (
                        <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-medium">
                          Verified
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{user.total_earning_amount.toFixed(2)}</TableCell>
                  </TableRow>
                ))
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

      {/* Session Warning Modal */}
      <Dialog open={!!openSession} onOpenChange={() => navigator('/dashboard')}>
        <DialogContent className="max-w-md">
          <DialogTitle className="text-red-600">
            ⚠️ Open Transaction Session Found
          </DialogTitle>
          <p className="text-sm mt-2">
            You have already initiated a transaction session for pending payments.
            You must clear this before enrolling or processing new payments.
          </p>
          <div className="mt-4 text-sm space-y-1">
            <p><strong>Filename:</strong> {openSession?.filename}</p>
            <p><strong>Created At:</strong> {new Date(openSession?.created_at).toLocaleString()}</p>
          </div>
          <div className="mt-4 text-right">
            <Button onClick={() => navigator('/dashboard')}>Back to home</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Enrollmenttable;
