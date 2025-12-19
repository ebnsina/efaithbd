'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2, Copy } from 'lucide-react'
import { useConfirm } from '@/hooks/use-confirm'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { toast } from 'sonner'

type Coupon = {
  id: string
  code: string
  description: string | null
  type: 'PERCENTAGE' | 'FIXED'
  value: number
  minPurchase: number | null
  maxDiscount: number | null
  validFrom: string
  validTo: string
  usageLimit: number | null
  usageCount: number
  active: boolean
}

type CouponFormData = {
  code: string
  description: string
  type: 'PERCENTAGE' | 'FIXED'
  value: number
  minPurchase: number | null
  maxDiscount: number | null
  validFrom: string
  validTo: string
  usageLimit: number | null
  active: boolean
}

export default function CouponsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const confirmDialog = useConfirm()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState<CouponFormData>({
    code: '',
    description: '',
    type: 'PERCENTAGE',
    value: 0,
    minPurchase: null,
    maxDiscount: null,
    validFrom: new Date().toISOString().split('T')[0],
    validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    usageLimit: null,
    active: true,
  })

  const { data: coupons, isLoading } = useQuery({
    queryKey: ['coupons'],
    queryFn: async () => {
      const response = await fetch('/api/admin/coupons')
      if (!response.ok) throw new Error('Failed to fetch coupons')
      return response.json() as Promise<Coupon[]>
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: CouponFormData) => {
      const response = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create coupon')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] })
      setIsDialogOpen(false)
      resetForm()
      toast.success('Coupon created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: Partial<CouponFormData>
    }) => {
      const response = await fetch(`/api/admin/coupons/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update coupon')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] })
      setIsDialogOpen(false)
      setEditingCoupon(null)
      resetForm()
      toast.success('Coupon updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/coupons/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete coupon')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] })
      toast.success('Coupon deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      type: 'PERCENTAGE',
      value: 0,
      minPurchase: null,
      maxDiscount: null,
      validFrom: new Date().toISOString().split('T')[0],
      validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      usageLimit: null,
      active: true,
    })
  }

  const handleOpenDialog = (coupon?: Coupon) => {
    if (coupon) {
      setEditingCoupon(coupon)
      setFormData({
        code: coupon.code,
        description: coupon.description || '',
        type: coupon.type,
        value: coupon.value,
        minPurchase: coupon.minPurchase,
        maxDiscount: coupon.maxDiscount,
        validFrom: new Date(coupon.validFrom).toISOString().split('T')[0],
        validTo: new Date(coupon.validTo).toISOString().split('T')[0],
        usageLimit: coupon.usageLimit,
        active: coupon.active,
      })
    } else {
      setEditingCoupon(null)
      resetForm()
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingCoupon) {
      updateMutation.mutate({ id: editingCoupon.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleDelete = async (id: string) => {
    const confirmed = await confirmDialog.confirm({
      title: 'Delete Coupon',
      description:
        'Are you sure you want to delete this coupon? This action cannot be undone.',
    })
    if (confirmed) {
      deleteMutation.mutate(id)
    }
  }

  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('Coupon code copied to clipboard')
  }

  const isExpired = (validTo: string) => {
    return new Date(validTo) < new Date()
  }

  const isUpcoming = (validFrom: string) => {
    return new Date(validFrom) > new Date()
  }

  return (
    <>
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.options.title}
        description={confirmDialog.options.description}
        confirmText={confirmDialog.options.confirmText}
        cancelText={confirmDialog.options.cancelText}
        onConfirm={confirmDialog.handleConfirm}
        onCancel={confirmDialog.handleCancel}
      />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Coupons</h1>
            <p className="text-muted-foreground">
              Manage discount coupons for your store
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Coupon
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Coupons</CardTitle>
            <CardDescription>
              {coupons?.length || 0} total coupons
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              {isLoading ? (
                <p>Loading...</p>
              ) : coupons && coupons.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Valid From</TableHead>
                      <TableHead>Valid To</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {coupons.map(coupon => (
                      <TableRow key={coupon.id}>
                        <TableCell className="font-mono font-semibold">
                          <div className="flex items-center gap-2">
                            {coupon.code}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => copyCouponCode(coupon.code)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{coupon.type}</Badge>
                        </TableCell>
                        <TableCell>
                          {coupon.type === 'PERCENTAGE'
                            ? `${coupon.value}%`
                            : `৳${coupon.value}`}
                        </TableCell>
                        <TableCell>
                          {coupon.usageCount}
                          {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ''}
                        </TableCell>
                        <TableCell>
                          {new Date(coupon.validFrom).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {new Date(coupon.validTo).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {!coupon.active ? (
                            <Badge variant="secondary">Inactive</Badge>
                          ) : isExpired(coupon.validTo) ? (
                            <Badge variant="destructive">Expired</Badge>
                          ) : isUpcoming(coupon.validFrom) ? (
                            <Badge variant="outline">Upcoming</Badge>
                          ) : (
                            <Badge>Active</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDialog(coupon)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(coupon.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No coupons found. Create your first coupon to get started.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
              </DialogTitle>
              <DialogDescription>
                {editingCoupon
                  ? 'Update the coupon details below'
                  : 'Fill in the details to create a new discount coupon'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Coupon Code *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={e =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    placeholder="SUMMER2024"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: 'PERCENTAGE' | 'FIXED') =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                      <SelectItem value="FIXED">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={e =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe what this coupon is for..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="value">
                    {formData.type === 'PERCENTAGE' ? 'Percentage' : 'Amount'} *
                  </Label>
                  <Input
                    id="value"
                    type="number"
                    min="0"
                    step={formData.type === 'PERCENTAGE' ? '1' : '0.01'}
                    value={formData.value}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        value: Number.parseFloat(e.target.value),
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxDiscount">
                    Max Discount{' '}
                    {formData.type === 'PERCENTAGE' ? '(optional)' : '(N/A)'}
                  </Label>
                  <Input
                    id="maxDiscount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.maxDiscount || ''}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        maxDiscount: e.target.value
                          ? Number.parseFloat(e.target.value)
                          : null,
                      })
                    }
                    disabled={formData.type === 'FIXED'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minPurchase">Min Purchase (optional)</Label>
                  <Input
                    id="minPurchase"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.minPurchase || ''}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        minPurchase: e.target.value
                          ? Number.parseFloat(e.target.value)
                          : null,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="usageLimit">Usage Limit (optional)</Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    min="0"
                    value={formData.usageLimit || ''}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        usageLimit: e.target.value
                          ? Number.parseInt(e.target.value)
                          : null,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="validFrom">Valid From *</Label>
                  <Input
                    id="validFrom"
                    type="date"
                    value={formData.validFrom}
                    onChange={e =>
                      setFormData({ ...formData, validFrom: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validTo">Valid To *</Label>
                  <Input
                    id="validTo"
                    type="date"
                    value={formData.validTo}
                    onChange={e =>
                      setFormData({ ...formData, validTo: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={e =>
                    setFormData({ ...formData, active: e.target.checked })
                  }
                  className="rounded"
                />
                <Label htmlFor="active">Active</Label>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  {editingCoupon ? 'Update' : 'Create'} Coupon
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}
