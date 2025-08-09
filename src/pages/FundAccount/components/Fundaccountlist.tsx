import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { API_BASE_URL } from "@/lib/api";
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

const Fundaccountlist: React.FC = () => {
  const [kycData, setfundaccountData] = useState<CustomerBankDetail[]>([]);
  const [pendingDeleteItem, setPendingDeleteItem] = useState<CustomerBankDetail | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  const pageCount = Math.ceil(total / PAGE_SIZE);
  const getToken = () => localStorage.getItem("admin_token");

  const fetchKycData = async () => {
    setLoading(true);
    const params = new URLSearchParams({ search, page: page.toString(), limit: PAGE_SIZE.toString(), status: statusFilter,});

    const res = await fetch(
      `${API_BASE_URL}/api/v1/admin/Fund_account_list/Customer_list?${params.toString()}`
    );
    const data = await res.json();
    setfundaccountData(data.results);
    setTotal(data.total);
    setLoading(false);
  };

  useEffect(() => {
    fetchKycData();
  }, [search, page, statusFilter]);


  const handleDelete = async () => {
  if (!pendingDeleteId) return;

  setIsDeleting(true);

  const res = await fetch(
    `${API_BASE_URL}/api/v1/admin/Fund_account_list/Customer_list/${pendingDeleteId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );

  setDeleteDialogOpen(false);
  setPendingDeleteId(null);
  setIsDeleting(false);

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


  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(pageCount, p + 1));


  return (
    <motion.div className="bg-white rounded-lg p-5 shadow-md" initial={{ opacity: 0, y: 20 }}  animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <div className="flex gap-3">
          <Input placeholder="Search by name, bank, account number..."  value={search} onChange={(e) => setSearch(e.target.value)}className="w-96"/>
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
                <th className="px-4 py-3 border">Aadhaar NO</th>
                <th className="px-4 py-3 border">PAN No</th>
                <th className="px-4 py-3 border">Status</th>
                <th className="px-4 py-3 border">Created</th>
                <th className="px-4 py-3 border">Actions</th>
              </tr>
            </thead>
           <tbody>
  {kycData.length === 0 ? (
    <tr>
      <td colSpan={9} className="text-center text-gray-500 py-6">
        No records found.
      </td>
    </tr>
  ) : (
    kycData.map((item) => (
      <tr key={item.id} className="border-b hover:bg-gray-50">
        <td className="px-4 py-3 border">{item.guide_code || "-"}</td>
        <td className="px-4 py-3 border">{item.account_holder_name || "-"}
            <span className="text-xs text-gray-500 block">Fund account ID - {item.id || "-"}</span>
            <span className="text-xs text-gray-500 block">Contact ID - {item.contact_id || "-"}</span>
        </td>
        <td className="px-4 py-3 border">{item.bank_name || "-"}</td>
        <td className="px-4 py-3 border">{item.account_number || "-"}
            <span className="text-xs text-gray-500 block">IFSC - {item.ifsc_code || "-"}</span>
        </td>
        <td className="px-4 py-3 border">{item.aadhaar_number || "-"}</td>
        <td className="px-4 py-3 border">{item.pan_code || "-"}</td>
        <td className="px-4 py-3 border">
          {item.active ? (
            <span className="text-green-600 font-medium">Active</span>
          ) : (
            <span className="text-red-600 font-medium">Inactive</span>
          )}
        </td>
        <td className="px-4 py-3 border">
          {new Date(item.created_on).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </td>
        <td className="px-4 py-3 border">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              setDeleteDialogOpen(true);
              setPendingDeleteId(item.guide_code);
              setPendingDeleteItem(item);
            }}
          >
            Delete
          </Button>
        </td>
      </tr>
    ))
  )}
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
            <AlertDialogDescription>
             Are you sure you want to delete the fund account for  
             <span className="font-medium text-black"> {pendingDeleteItem?.account_holder_name}</span>   
             <span className="text-purple-600 font-mono"> {pendingDeleteItem?.guide_code}</span>?
             <br />
             This action cannot be undone.
           </AlertDialogDescription>
           
                     </AlertDialogHeader>
           <AlertDialogFooter>
             <AlertDialogCancel onClick={() => setPendingDeleteId(null)} disabled={isDeleting}>
               Cancel
             </AlertDialogCancel>
             <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
               {isDeleting ? "Deleting..." : "Delete"}
             </AlertDialogAction>
           </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </motion.div>
  );
};

export default Fundaccountlist;
