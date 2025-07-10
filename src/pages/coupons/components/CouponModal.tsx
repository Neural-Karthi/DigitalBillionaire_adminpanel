import React, { useState, useEffect } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface CouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  coupon?: any;
}

export const CouponModal: React.FC<CouponModalProps> = ({
  isOpen,
  onClose,
  coupon,
}) => {
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discount: "",
    type: "percentage",
    usageLimit: "",
    expiryDate: "",
    minOrderAmount: "",
  });
  const { toast } = useToast();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (coupon) {
      setFormData({
        code: coupon.code || "",
        description: coupon.description || "",
        discount: coupon.discount?.toString() || "",
        type: coupon.type || "percentage",
        usageLimit: coupon.usageLimit?.toString() || "",
        expiryDate: coupon.expiryDate || "",
        minOrderAmount: coupon.minOrderAmount?.toString() || "",
      });
    } else {
      setFormData({
        code: "",
        description: "",
        discount: "",
        type: "percentage",
        usageLimit: "",
        expiryDate: "",
        minOrderAmount: "",
      });
    }
  }, [coupon]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.code || formData.code.trim().length < 3) {
      newErrors.code = "Coupon code is required (min 3 chars)";
    }
    if (!formData.type || (formData.type !== "percentage" && formData.type !== "fixed")) {
      newErrors.type = "Discount type is required";
    }
    if (!formData.discount || isNaN(Number(formData.discount)) || Number(formData.discount) <= 0) {
      newErrors.discount = "Valid discount value is required";
    } else if (formData.type === "percentage" && (Number(formData.discount) > 100)) {
      newErrors.discount = "Percentage discount cannot exceed 100%";
    }
    if (!formData.usageLimit || isNaN(Number(formData.usageLimit)) || Number(formData.usageLimit) < 1) {
      newErrors.usageLimit = "Usage limit is required and must be a positive number";
    }
    if (!formData.minOrderAmount || isNaN(Number(formData.minOrderAmount)) || Number(formData.minOrderAmount) < 0) {
      newErrors.minOrderAmount = "Minimum order amount is required and must be a positive number";
    }
    if (!formData.expiryDate) {
      newErrors.expiryDate = "Expiry date is required";
    }
    if (!formData.description || formData.description.length > 300) {
      newErrors.description = !formData.description ? "Description is required" : "Description too long (max 300 chars)";
    }
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const token = localStorage.getItem('token');
    const payload = {
      code: formData.code,
      description: formData.description,
      discountValue: Number(formData.discount),
      discountType: formData.type,
      usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
      expiryDate: formData.expiryDate,
      minOrderValue: formData.minOrderAmount ? Number(formData.minOrderAmount) : 0,
      active: true,
    };
    try {
      let res, data;
      if (coupon && coupon._id) {
        res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/admin/coupons/${coupon._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.msg || 'Failed to update coupon');
        toast({ title: 'Coupon updated', description: `${formData.code} has been updated successfully.` });
      } else {
        res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/admin/coupons`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.msg || 'Failed to create coupon');
        toast({ title: 'Coupon created', description: `${formData.code} has been created successfully.` });
      }
      onClose();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }

  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {coupon ? "Edit Coupon" : "Create New Coupon"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Coupon Code</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) =>
                  handleInputChange("code", e.target.value.toUpperCase())
                }
                placeholder="SAVE20"
                required
              />
              {errors.code && <div className="text-red-500 text-xs">{errors.code}</div>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Discount Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange("type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && <div className="text-red-500 text-xs">{errors.type}</div>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount">
                Discount Value {formData.type === "percentage" ? "(%)" : "(₹)"}
              </Label>
              <Input
                id="discount"
                type="number"
                value={formData.discount}
                onChange={(e) => handleInputChange("discount", e.target.value)}
                placeholder={formData.type === "percentage" ? "20" : "50"}
                required
              />
              {errors.discount && <div className="text-red-500 text-xs">{errors.discount}</div>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="usageLimit">Usage Limit</Label>
              <Input
                id="usageLimit"
                type="number"
                value={formData.usageLimit}
                onChange={(e) =>
                  handleInputChange("usageLimit", e.target.value)
                }
                placeholder="100"
                required
              />
              {errors.usageLimit && <div className="text-red-500 text-xs">{errors.usageLimit}</div>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="minOrderAmount">Minimum Order Amount (₹)</Label>
              <Input
                id="minOrderAmount"
                type="number"
                step="0.01"
                value={formData.minOrderAmount}
                onChange={(e) =>
                  handleInputChange("minOrderAmount", e.target.value)
                }
                placeholder="0.00"
                required
              />
              {errors.minOrderAmount && <div className="text-red-500 text-xs">{errors.minOrderAmount}</div>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={(e) =>
                  handleInputChange("expiryDate", e.target.value)
                }
                required
              />
              {errors.expiryDate && <div className="text-red-500 text-xs">{errors.expiryDate}</div>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Coupon description..."
              rows={3}
              required
            />
            {errors.description && <div className="text-red-500 text-xs">{errors.description}</div>}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {coupon ? "Update Coupon" : "Create Coupon"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
