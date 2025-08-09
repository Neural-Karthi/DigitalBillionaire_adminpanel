import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

const PAGE_SIZE = 10;

interface FreelanceApplication {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  role: string;
  message: string;
  reply_status: string;
  resume_url?: string;
  created_at: string;
}

const FreelanceApplicationsList: React.FC = () => {
  const [applications, setApplications] = useState<FreelanceApplication[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [replyStatus, setReplyStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const pageCount = Math.ceil(total / PAGE_SIZE);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        page: page.toString(),
        limit: PAGE_SIZE.toString(),
      });

      if (replyStatus !== "all") {
        params.append("reply_status", replyStatus);
      }

      const res = await fetch(
        `${API_BASE_URL}/api/v1/admin/Application/GetFreelanceList?${params.toString()}`
      );
      const data = await res.json();
      setApplications(data.results || []);
      setTotal(data.total || 0);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch applications.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateReplyStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/admin/Application/GetFreelanceList/update-status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, reply_status: newStatus }),
        }
      );

      if (!res.ok) throw new Error("Failed to update status");

      toast({
        title: "Success",
        description: "Reply status updated successfully.",
      });

      fetchApplications(); // Refresh data
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update reply status.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [search, page, replyStatus]);

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
        <h1 className="text-2xl font-bold">Freelance Applications</h1>
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <Input
            placeholder="Search by name, email, role..."
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            className="w-64"
          />
          <Select
            value={replyStatus}
            onValueChange={(val) => {
              setPage(1);
              setReplyStatus(val);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="replied">Replied</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-16 text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Loading applications...
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded shadow text-sm">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 border">Name</th>
                  <th className="px-4 py-3 border">Email</th>
                  <th className="px-4 py-3 border">Phone</th>
                  <th className="px-4 py-3 border">Role</th>
                  <th className="px-4 py-3 border">Message</th>
                  <th className="px-4 py-3 border">Reply Status</th>
                  <th className="px-4 py-3 border">Resume</th>
                  <th className="px-4 py-3 border">Submitted At</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app, index) => (
                  <tr
                    key={app.id}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-4 py-3 border">{app.name}</td>
                    <td className="px-4 py-3 border">{app.email}</td>
                    <td className="px-4 py-3 border">{app.phone_number}</td>
                    <td className="px-4 py-3 border capitalize">{app.role}</td>
                    <td className="px-4 py-3 border">{app.message}</td>
                    <td className="px-4 py-3 border capitalize">
                      <Select
                        value={app.reply_status}
                        onValueChange={(val) =>
                          updateReplyStatus(app.id, val)
                        }
                      >
                        <SelectTrigger className="w-[100px] h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="replied">Replied</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3 border">
                      {app.resume_url ? (
                        <a
                          href={app.resume_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          View Resume
                        </a>
                      ) : (
                        <span className="text-gray-400 italic">No Resume</span>
                      )}
                    </td>
                    <td className="px-4 py-3 border">
                      {formatDate(app.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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
        </>
      )}
    </motion.div>
  );
};

export default FreelanceApplicationsList;
