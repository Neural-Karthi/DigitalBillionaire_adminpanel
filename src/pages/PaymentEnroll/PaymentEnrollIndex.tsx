import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Enrollmenttable } from './components/Enrollmenttable';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import axios from 'axios';
import { API_BASE_URL } from "@/lib/api";

export const PaymentEnrollIndex: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [stats, setStats] = useState<{
    verified: { userCount: number; totalAmount: number };
    unverified: { userCount: number; totalAmount: number };
  }>({
    verified: { userCount: 0, totalAmount: 0 },
    unverified: { userCount: 0, totalAmount: 0 }
  });

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false); // for confirmProcessing
  const [previewLoading, setPreviewLoading] = useState(false); // for handleProcessClick

  const [previewData, setPreviewData] = useState<{
    total_pending_amount: number;
    total_pending_users: number;
    from_date: string;
    to_date: string;
    alreadyProcessed?: boolean;
  } | null>(null);

  const handleProcessClick = async () => {
    setPreviewLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/Admin/ProcessingPreview`);
      const data = res.data;
      if (data.total_pending_amount > 0) {
        setPreviewData(data);
        setOpen(true);
      } else {
        toast.warning('No pending payroll to process this week.');
      }
    } catch (err) {
      toast.error('Failed to fetch preview data.');
    } finally {
      setPreviewLoading(false);
    }
  };

  const confirmProcessing = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/Admin/Paymenttoprocess`);
       window.location.reload();
      toast.success(res.data.message || 'Processed successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Processing failed');
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });

  return (
    <div className="space-y-6 cursor-pointer">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Enrollments</h1>
          <p className="text-gray-600 mt-1">
            View customer referrals and manage enrollments
          </p>
        </div>
        <Button variant="default" onClick={handleProcessClick} disabled={previewLoading}>
          {previewLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {previewLoading ? 'Fetching Preview...' : "Process This Week's Payroll"}
        </Button>
      </motion.div>

      {/* 💰 Total Amount Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
      >
        <div className="bg-white shadow flex  gap-10 rounded-lg p-4 py-6 border border-gray-200 ">
          <div className=' h-full'>
              <h2 className="text-lg font-semibold text-gray-700">
                Total Pending Enroll Payment
              </h2>
              <p className="text-2xl font-bold text-blue-600 mt-1">
₹{(stats.verified.totalAmount + stats.unverified.totalAmount).toFixed(2)}

              </p>
          </div>
          <div className='flex-1 h-full'>
              <h2 className="text-lg font-semibold text-gray-700">
                Total Pending Enroll Payment
              </h2>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                ₹{totalAmount.toFixed(2)}
              </p>
              <div className="text-sm pt-4 text-gray-600 space-y-1">
                <p>
                  ✅ Verified Users: {stats.verified.userCount} | ₹
                  {stats.verified.totalAmount.toFixed(2)}
                </p>
                <p>
                  ❌ Unverified Users: {stats.unverified.userCount} | ₹
                  {stats.unverified.totalAmount.toFixed(2)}
                </p>
              </div>
          </div>
        </div>
        
      </motion.div>

      {/* 🔍 Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </motion.div>

      {/* 📊 Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Enrollmenttable
          searchTerm={searchTerm}
          onStatsChange={({ totalPendingAmount, verified, unverified }) => {
            setTotalAmount(totalPendingAmount);
            setStats({ verified, unverified });
          }}
        />
      </motion.div>

      {/* 🧾 Confirm Payroll Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Payroll Processing</DialogTitle>
          </DialogHeader>
          <div className="text-gray-700 space-y-2">
            {previewData?.alreadyProcessed && (
              <p className="text-yellow-600 font-medium">
                ⚠️ This week has already been marked as processed.
                Remaining pending amounts (if any) are shown below.
              </p>
            )}
            <p>
              <strong>Total Pending Users:</strong>{' '}
              {previewData?.total_pending_users}
            </p>
            <p>
              <strong>Total Amount to Process:</strong>{' '}
              <span className="text-blue-600 font-semibold">
                ₹{previewData?.total_pending_amount.toFixed(2)}
              </span>
            </p>
            <p>
              <strong>Week Range:</strong>{' '}
              {previewData && (
                <>
                  {formatDate(previewData.from_date)} →{' '}
                  {formatDate(previewData.to_date)}
                </>
              )}
            </p>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={confirmProcessing} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Processing...' : 'Confirm & Process'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentEnrollIndex;
