import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Enrollmenttable from './components/EnrollPayment';
import axios from 'axios';
import { API_BASE_URL } from "@/lib/api";

import { toast } from "sonner";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";


export const Rollout_index: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    verified: { userCount: 0, totalAmount: 0 },
    unverified: { userCount: 0, totalAmount: 0 }
  });

  const [previewLoading, setPreviewLoading] = useState(false);
  const [rolloutdata, setrolloutdata] = useState<any>(null);

  const [fetchinloader,setfechingloader] = useState(false)

  const [summaryData, setSummaryData] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);


const handleProcessClick = async () => {
  try {
    setfechingloader(true);
    const response = await axios.get(`${API_BASE_URL}/api/Admin/get-full-payroll-preview`);
    setSummaryData(response.data.summary);
    setDialogOpen(true);
  } catch (error) {
    console.error(error);
  } finally {
    setfechingloader(false);
  }
};

const handleConfirm = async () => {
  try {
    setfechingloader(true);

    const response = await axios.post(`${API_BASE_URL}/api/Admin/payout`);

    if (response.data.success) {
      toast.success("✅ Payouts processed successfully", {
        description: `Done`,
      });

      // Optional: refresh summary or table
    } else {
      toast.error("❌ Failed to process payouts", {
        description: response.data.message || "Something went wrong",
      });
    }

    setDialogOpen(false);
  } catch (error) {
    console.error("Payout session error:", error);
    toast.error("❌ Server error while processing payouts");
  } finally {
    setfechingloader(false);
  }
};


const [otp, setOtp] = useState("");


const [otpDialogOpen, setOtpDialogOpen] = useState(false);

const handleSendOtp = async () => {
  setfechingloader(true);
  try {
    const res = await axios.post(`${API_BASE_URL}/api/v_1/users/PayoutSendOtp`);
    if (res.data.success) {
      toast.info("📧 OTP sent to admin email");
      setOtpDialogOpen(true);
    } else {
      toast.error(res.data.message || "Failed to send OTP");
    }
  } catch (error) {
    console.error(error);
    toast.error("Server error while sending OTP");
  } finally {
    setfechingloader(false);
  }
};

const handleVerifyOtpAndPayout = async () => {
  setfechingloader(true);
  try {
    const verifyRes = await axios.post(`${API_BASE_URL}/api/v_1/users/PayoutVerifyOtp`, { otp });

    if (!verifyRes.data.success) {
      toast.error(verifyRes.data.message || "OTP verification failed");
      return;
    }

    setOtpDialogOpen(false); // close OTP dialog
    await handleConfirm(); // proceed to payout
  } catch (error) {
    console.error(error);
    toast.error("Server error during OTP verification");
  } finally {
    setfechingloader(false);
  }
};


const handleCancel = () => {
  setDialogOpen(false);
};


useEffect(() => {
  const firstLoad = { current: true }; // useRef alternative in this example

  const get_rollout_info = async () => {
    if (firstLoad.current) {
      setPreviewLoading(true);  // Show loader only first time
    }
    try {
      const res = await axios.get(`${API_BASE_URL}/api/Admin/Get_Rollout_list`);
      setrolloutdata(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      if (firstLoad.current) {
        setPreviewLoading(false);
        firstLoad.current = false; // mark as loaded once done
      }
    }
  };

  get_rollout_info();

  const intervalId = setInterval(() => {
    get_rollout_info(); // no loader this time
  }, 5000);

  return () => clearInterval(intervalId);
}, []);



  return (
    <div className="space-y-6 cursor-pointer relative">
      {/* 🔄 Full Screen Loader */}
      {previewLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          <span className="ml-4 text-lg font-semibold text-gray-700">Loading...</span>
        </div>
      )}

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Enrollments</h1>
          <p className="text-gray-600 mt-1"> View customer referrals and manage enrollments</p>
        </div>
        <Button variant="default" onClick={handleProcessClick} disabled={previewLoading}>
          {fetchinloader && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {fetchinloader ? 'Fetching Preview...' : "Enroll this week payout"}
        </Button>
      </motion.div>

      {/* Total Amount Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}>
        <div className="bg-white shadow flex gap-10 rounded-lg p-4 py-6 border border-gray-200">
          <div className='flex-1 h-full'>
            <h2 className="text-lg font-semibold text-gray-700">Total Pending Rollout amount</h2>
            <p className="text-2xl font-bold text-blue-600 mt-1">₹{rolloutdata?.total_processable_amount.toFixed(2)}</p>
            <div className="text-sm pt-4 text-gray-600 space-y-1">
              <p>✅ Verified Users: {rolloutdata?.total_pending_users} | ₹ {rolloutdata?.total_pending_amount.toFixed(2)}</p>
              <p>❌ Unverified Users: {rolloutdata?.unverified_user_count} | ₹ {rolloutdata?.total_unverified_amount.toFixed(2)} </p>
            </div>
          </div>
          <div className='h-full'>
            <h2 className="text-lg font-semibold text-gray-700">Total Pending Can Rollout Now</h2>
            <p className="text-2xl text-right font-bold text-blue-600 mt-1">₹{rolloutdata?.total_pending_amount.toFixed(2)}</p>
          </div>
        </div>
      </motion.div>

      {/* Search Input */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }} className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input type="text" placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
        <Enrollmenttable searchTerm={searchTerm} />
      </motion.div>




<Dialog open={otpDialogOpen} onOpenChange={setOtpDialogOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Enter OTP</DialogTitle>
      <DialogDescription>
        Please enter the OTP sent to the admin email.
      </DialogDescription>
    </DialogHeader>

    <Input
      type="text"
      value={otp}
      onChange={(e) => setOtp(e.target.value)}
      placeholder="Enter OTP"
    />

    <DialogFooter>
      <Button variant="ghost" onClick={() => setOtpDialogOpen(false)}>
        Cancel
      </Button>
      <Button onClick={handleVerifyOtpAndPayout} disabled={fetchinloader}>
        {fetchinloader && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        {fetchinloader ? "Verifying..." : "Verify & Process Payout"}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>




      {summaryData && (
  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Confirm Weekly Payout</DialogTitle>
        <DialogDescription>
          Please review the summary before enrolling this week’s payout.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-2 text-sm">
        <p>
          <span className="font-medium">Total Referrals:</span> {summaryData.total_count}
        </p>
        <p>
          <span className="font-medium">Total Amount:</span> ₹{summaryData.total_amount}
        </p>
        <p>
          <span className="font-medium">First Referral Date:</span>{" "}
          {new Date(summaryData.first_referral_date).toLocaleDateString()}
        </p>
        <p>
          <span className="font-medium">Payout Period:</span>{" "}
          {new Date(summaryData.payout_period.start).toLocaleDateString()} →{" "}
          {new Date(summaryData.payout_period.end).toLocaleDateString()}
        </p>
      </div>

      <DialogFooter className="mt-4">
         <Button variant="ghost" onClick={handleCancel}>
           Cancel
         </Button>
         <Button onClick={handleSendOtp} disabled={fetchinloader}>
  {fetchinloader ? (
    <svg
      className="animate-spin h-5 w-5 mr-2 text-white inline-block"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      ></path>
    </svg>
  ) : null}
  {fetchinloader ? "Sending OTP..." : "Confirm"}
</Button>

      </DialogFooter>
    </DialogContent>
  </Dialog>
)}

    </div>
  );
};

export default Rollout_index;
