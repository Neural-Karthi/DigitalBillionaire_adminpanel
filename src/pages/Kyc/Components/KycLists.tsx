import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { API_BASE_URL } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface CustomerBankDetail {
  id: string;
  guide_code: string;
  full_name: string;
  account_type: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  created_at: string;
  modified_at: string;
  customer_bank_images: string;
  account_verification_note: string;
  customer_pan_card_image: string;
  aadhaar_card_number: string;
  account_verification_status: boolean;
}

const PAGE_SIZE = 10;

const KycLists: React.FC = () => {
  const [kycData, setKycData] = useState<CustomerBankDetail[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [rejectNoteDialogOpen, setRejectNoteDialogOpen] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [isSubmittingReject, setIsSubmittingReject] = useState(false);
  const { toast } = useToast();

  const pageCount = Math.ceil(total / PAGE_SIZE);
  const getToken = () => localStorage.getItem("admin_token");

  const fetchKycData = async () => {
    setLoading(true);
    const params = new URLSearchParams({
      search,
      page: page.toString(),
      limit: PAGE_SIZE.toString(),
      status: statusFilter,
    });

    const res = await fetch(
      `${API_BASE_URL}/api/Admin/Kycpending?${params.toString()}`
    );
    const data = await res.json();
    setKycData(data.results);
    setTotal(data.total);
    setLoading(false);
  };

  useEffect(() => {
    fetchKycData();
  }, [search, page, statusFilter]);

  const handleDelete = async () => {
    if (!pendingDeleteId) return;

    const res = await fetch(
      `${API_BASE_URL}/api/Admin/Kycpending/${pendingDeleteId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );

    setDeleteDialogOpen(false);
    setPendingDeleteId(null);

    if (res.ok) {
      fetchKycData();
      toast({ title: "Record deleted" });
    } else {
      toast({
        title: "Error",
        description: "Failed to delete record",
        variant: "destructive",
      });
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectingId) return;

    setIsSubmittingReject(true);
    const res = await fetch(`${API_BASE_URL}/api/Admin/Kycpending/${rejectingId}/reject`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ note: rejectNote }),
    });

    setIsSubmittingReject(false);
    setRejectNoteDialogOpen(false);
    setRejectNote("");
    setRejectingId(null);

    if (res.ok) {
      toast({ title: "KYC rejected" });
      fetchKycData();
    } else {
      toast({
        title: "Error",
        description: "Failed to reject",
        variant: "destructive",
      });
    }
  };

  const handleApprove = async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/api/Admin/Kycpending/${id}/verify`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${getToken()}` },
    });

    if (res.ok) {
      toast({ title: "KYC approved" });
      fetchKycData();
    } else {
      toast({ title: "Error", description: "Failed to approve", variant: "destructive" });
    }
  };

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(pageCount, p + 1));

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
      className="bg-white rounded-lg p-5 shadow-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">KYC Verification</h1>
        <div className="flex gap-3">
          <Input
            placeholder="Search by name, bank, account number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded shadow text-sm">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 border">Guide Code</th>
                <th className="px-4 py-3 border">Full Name</th>
                <th className="px-4 py-3 border">Bank</th>
                <th className="px-4 py-3 border">Account No.</th>
                <th className="px-4 py-3 border">Aadhaar</th>
                <th className="px-4 py-3 border">PAN</th>
                <th className="px-4 py-3 border">Bank Image</th>
                <th className="px-4 py-3 border">Note</th>
                <th className="px-4 py-3 border">Status</th>
                <th className="px-4 py-3 border">Created</th>
                <th className="px-4 py-3 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {kycData?.map((data) => (
                <tr key={data.id}>
                  <td className="px-4 py-3 border">{data.guide_code}</td>
                  <td className="px-4 py-3 border">{data.full_name}</td>
                  <td className="px-4 py-3 border">{data.bank_name}</td>
                  <td className="px-4 py-3 border">{data.account_number}</td>
                  <td className="px-4 py-3 border">{data.aadhaar_card_number}</td>
                  <td className="px-4 py-3 border">
                    <a href={data.customer_pan_card_image} target="_blank" rel="noreferrer" className="text-blue-600 underline">View</a>
                  </td>
                  <td className="px-4 py-3 border">
                    <a href={data.customer_bank_images} target="_blank" rel="noreferrer" className="text-blue-600 underline">View</a>
                  </td>
                  <td className="px-4 py-3 border">{data.account_verification_note}</td>
                  <td className="px-4 py-3 border space-y-2 flex flex-col">
                    {(statusFilter === "pending" || statusFilter === "rejected") && (
                      <Button size="sm" onClick={() => handleApprove(data.id)}>Approve</Button>
                    )}
                    {(statusFilter === "pending" || statusFilter === "verified") && (
                      <Button size="sm" variant="outline" onClick={() => {
                        setRejectNoteDialogOpen(true);
                        setRejectingId(data.id);
                      }}>Reject</Button>
                    )}
                  </td>
                  <td className="px-4 py-3 border">{formatDate(data.created_at)}</td>
                  <td className="px-4 py-3 border">
                    <Button size="sm" variant="destructive" onClick={() => {
                      setPendingDeleteId(data.id);
                      setDeleteDialogOpen(true);
                    }}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-center items-center gap-4 mt-6">
        <Button onClick={handlePrev} disabled={page === 1} variant="outline">Prev</Button>
        <span>Page {page} of {pageCount || 1}</span>
        <Button onClick={handleNext} disabled={page === pageCount || pageCount === 0} variant="outline">Next</Button>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Record</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this KYC record? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingDeleteId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={rejectNoteDialogOpen} onOpenChange={setRejectNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject KYC</DialogTitle>
          </DialogHeader>
          <Textarea
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            placeholder="Enter rejection note"
          />
          <DialogFooter>
            <Button variant="secondary" onClick={() => setRejectNoteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleRejectSubmit} disabled={isSubmittingReject}>
              {isSubmittingReject ? "Submitting..." : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default KycLists;
