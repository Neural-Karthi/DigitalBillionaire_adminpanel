
import React, { useEffect, useState } from 'react';
import { Edit, Trash2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,

} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';


interface CouponTableProps {
  searchTerm: string;
  onEditCoupon: (coupon: any) => void;
}

export const CouponTable: React.FC<CouponTableProps> = ({
  searchTerm,
  onEditCoupon,
}) => {

  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const fetchCoupons = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/admin/coupons`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to fetch coupons");
      setCoupons(data.coupons || []);
    } catch (err: any) {
      setError(err.message || "Error fetching coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/admin/coupons/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to delete coupon");
      toast({ title: "Coupon deleted" });
      fetchCoupons();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const filteredCoupons = coupons.filter(coupon =>
    coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (coupon.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (coupon: any) => {
    const now = new Date();
    if (!coupon.active) return <Badge className="bg-gray-100 text-gray-800">Disabled</Badge>;
    if (coupon.expiryDate && new Date(coupon.expiryDate) < now) return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
    return <Badge className="bg-green-100 text-green-800">Active</Badge>;
  };

  const formatDiscount = (discount: number, type: string) => {
    return type === 'percentage' ? `${discount}%` : `₹${discount}`;

  };

  return (
    <Card>
      <CardContent className="p-0">

        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading coupons...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">{error}</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead className="text-right">Actions</TableHead>

              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCoupons.map((coupon) => (
                <TableRow key={coupon._id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                        {coupon.code}
                      </code>
                    </div>
                  </TableCell>
                  <TableCell>{coupon.description || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {formatDiscount(coupon.discountValue, coupon.discountType)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {(coupon.usedBy?.length || 0)}/{coupon.usageLimit || '∞'}
                  </TableCell>
                  <TableCell>{getStatusBadge(coupon)}</TableCell>
                  <TableCell>{coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => {navigator.clipboard.writeText(coupon.code); toast({ title: "Copied!" });}}>
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEditCoupon(coupon)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(coupon._id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
