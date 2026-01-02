'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { ShopButton } from '@/components/ShopButton';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Package, Tag, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string>('');
  const [couponSuccess, setCouponSuccess] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
    description?: string;
  } | null>(null);
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({ isOpen: false, title: '', message: '' });
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    paymentMethod: 'COD' as 'COD' | 'BKASH',
    bkashNumber: '',
    bkashTrxId: '',
    couponCode: '',
    shippingMethodId: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [bkashSettings, setBkashSettings] = useState<{
    bkashNumber?: string;
    bkashNote?: string;
  }>({});
  const [bkashSettingsLoaded, setBkashSettingsLoaded] = useState(false);
  const [shippingMethods, setShippingMethods] = useState<any[]>([]);
  const [shippingMethodsLoading, setShippingMethodsLoading] = useState(false);

  const subtotalAmount = total();
  const discountAmount = appliedCoupon?.discount || 0;
  const selectedShipping = shippingMethods.find((m) => m.id === formData.shippingMethodId);
  const shippingCost = selectedShipping?.cost || 0;
  const finalTotal = subtotalAmount - discountAmount + shippingCost;

  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }

    // Fetch bKash settings
    fetch('/api/admin/site-settings/basic')
      .then((res) => res.json())
      .then((data) => {
        console.log('bKash settings loaded:', data);
        setBkashSettings({
          bkashNumber: data.bkashNumber,
          bkashNote: data.bkashNote,
        });
        setBkashSettingsLoaded(true);
      })
      .catch((err) => {
        console.error('Failed to fetch bKash settings:', err);
        setBkashSettingsLoaded(true);
      });

    // Fetch shipping methods
    fetchShippingMethods();
  }, []);

  const fetchShippingMethods = async () => {
    setShippingMethodsLoading(true);
    try {
      const res = await fetch(`/api/shipping-methods?subtotal=${subtotalAmount}`);
      const data = await res.json();
      setShippingMethods(data);
      // Auto-select first method if available
      if (data.length > 0 && !formData.shippingMethodId) {
        setFormData((prev) => ({ ...prev, shippingMethodId: data[0].id }));
      }
    } catch (error) {
      console.error('Failed to fetch shipping methods:', error);
    } finally {
      setShippingMethodsLoading(false);
    }
  };

  if (items.length === 0) {
    return null;
  }

  const applyCoupon = async () => {
    if (!formData.couponCode.trim()) {
      return;
    }

    setCouponLoading(true);
    setCouponError('');
    setCouponSuccess('');
    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: formData.couponCode,
          subtotal: subtotalAmount,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        setCouponError(error.error || 'Coupon Error');
        return;
      }

      const data = await response.json();
      setAppliedCoupon({
        code: data.coupon.code,
        discount: data.discount,
        description: data.coupon.description,
      });
      setCouponSuccess(`Coupon applied! You saved ৳${data.discount.toLocaleString('en-US')}.`);
    } catch (error) {
      setCouponError('Failed to apply coupon. Please try again.');
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
    setCouponSuccess('');
    setFormData({ ...formData, couponCode: '' });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Name Required';
    }

    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = 'Phone Required';
    } else if (!/^01[0-9]{9}$/.test(formData.customerPhone)) {
      newErrors.customerPhone = 'Invalid Phone';
    }

    if (!formData.customerAddress.trim()) {
      newErrors.customerAddress = 'Address Required';
    }

    if (!formData.shippingMethodId) {
      newErrors.shippingMethod = 'Please select a shipping method';
    }

    if (formData.paymentMethod === 'BKASH') {
      if (!formData.bkashNumber.trim()) {
        newErrors.bkashNumber = 'Bkash Required';
      }
      if (!formData.bkashTrxId.trim()) {
        newErrors.bkashTrxId = 'Transaction Required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          items: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
          })),
          subtotal: subtotalAmount,
          discount: discountAmount,
          shippingCost: shippingCost,
          total: finalTotal,
          couponCode: appliedCoupon?.code,
          shippingMethodId: formData.shippingMethodId,
        }),
      });

      if (!response.ok) {
        throw new Error('Order Error');
      }

      const data = await response.json();
      clearCart();
      router.push(`/orders/${data.orderNumber}`);
    } catch (error) {
      setDialogState({
        isOpen: true,
        title: 'Error',
        message: 'Order Error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">{'Checkout'}</h1>
          <Link href="/cart" className="w-full sm:w-auto">
            <Button variant="outline" size="sm" className="gap-2 w-full sm:w-auto">
              <ArrowLeft className="w-4 h-4" />
              {'Back To Cart'}
            </Button>
          </Link>
        </div>

        {/* Guest Checkout Banner */}
        <div className="mb-4 sm:mb-6 bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
            <div className="flex-1">
              <h2 className="font-semibold text-blue-900 mb-1 text-sm sm:text-base">
                {'Guest Checkout'}
              </h2>
              <p className="text-xs sm:text-sm text-blue-700">
                Order quickly without login. You can track your order with just your phone number.
              </p>
            </div>
            <Link href="/login" className="w-full sm:w-auto">
              <Button variant="outline" size="sm" className="shrink-0 w-full sm:w-auto">
                {'Login'}
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4 sm:p-5 md:p-6">
              <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">{'Shipping Details'}</h2>

              <div className="space-y-4">
                <div>
                  <label className="block font-semibold mb-1">
                    {'Name'} <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="Enter your name"
                    className="h-10"
                  />
                  {errors.customerName && (
                    <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold mb-1">
                    {'Phone'} <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customerPhone: e.target.value,
                      })
                    }
                    placeholder="01XXXXXXXXX"
                    className="h-10"
                  />
                  {errors.customerPhone && (
                    <p className="text-red-500 text-sm mt-1">{errors.customerPhone}</p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold mb-1">
                    {'Address'} <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    value={formData.customerAddress}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customerAddress: e.target.value,
                      })
                    }
                    rows={3}
                    placeholder="Enter your complete address"
                  />
                  {errors.customerAddress && (
                    <p className="text-red-500 text-sm mt-1">{errors.customerAddress}</p>
                  )}
                </div>

                {/* Shipping Method Selection */}
                <div>
                  <label className="block font-semibold mb-2">
                    {'Shipping Method'} <span className="text-red-500">*</span>
                  </label>
                  {shippingMethodsLoading ? (
                    <div className="p-4 text-center text-muted-foreground">
                      Loading shipping methods...
                    </div>
                  ) : shippingMethods.length === 0 ? (
                    <div className="p-4 text-center text-amber-600 bg-amber-50 rounded border border-amber-200">
                      No shipping methods available. Please contact support.
                    </div>
                  ) : (
                    <RadioGroup
                      value={formData.shippingMethodId}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          shippingMethodId: value,
                        })
                      }
                    >
                      {shippingMethods.map((method) => (
                        <div
                          key={method.id}
                          className="flex items-center space-x-3 p-3 border rounded cursor-pointer hover:bg-gray-50"
                        >
                          <RadioGroupItem value={method.id} id={method.id} />
                          <Label htmlFor={method.id} className="cursor-pointer flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium">{method.name}</div>
                                {method.description && (
                                  <div className="text-xs text-muted-foreground mt-0.5">
                                    {method.description}
                                  </div>
                                )}
                              </div>
                              <div className="font-semibold text-right ml-2">
                                ৳{method.cost.toLocaleString('en-US')}
                              </div>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                  {errors.shippingMethod && (
                    <p className="text-red-500 text-sm mt-1">{errors.shippingMethod}</p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold mb-2">{'Payment Method'}</label>
                  <RadioGroup
                    value={formData.paymentMethod}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        paymentMethod: value as 'COD' | 'BKASH',
                      })
                    }
                  >
                    <div className="flex items-center space-x-3 p-3 border rounded cursor-pointer hover:bg-gray-50">
                      <RadioGroupItem value="COD" id="cod" />
                      <Label htmlFor="cod" className="cursor-pointer flex-1">
                        {'Cod'}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border rounded cursor-pointer hover:bg-gray-50">
                      <RadioGroupItem value="BKASH" id="bkash" />
                      <Label htmlFor="bkash" className="cursor-pointer flex-1">
                        {'Bkash'}
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {formData.paymentMethod === 'BKASH' && (
                  <>
                    {/* Show bKash Payment Instructions */}
                    {(bkashSettings.bkashNumber || bkashSettings.bkashNote) && (
                      <Card className="bg-orange-50 border-orange-200">
                        <CardContent className="pt-6">
                          <div className="space-y-3">
                            {bkashSettings.bkashNumber && (
                              <div>
                                <p className="text-sm font-semibold text-orange-900 mb-1">
                                  {'Send Money To'}:
                                </p>
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant="secondary"
                                    className="text-lg font-bold py-1.5 px-3 bg-orange-100 text-orange-900"
                                  >
                                    {bkashSettings.bkashNumber}
                                  </Badge>
                                </div>
                              </div>
                            )}
                            {bkashSettings.bkashNote && (
                              <div className="text-sm text-orange-800 bg-white/50 p-3 rounded-md border border-orange-200">
                                {bkashSettings.bkashNote}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <div>
                      <label className="block font-semibold mb-1">
                        {'Bkash Number'} <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="tel"
                        value={formData.bkashNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bkashNumber: e.target.value,
                          })
                        }
                        placeholder="01XXXXXXXXX"
                        className="h-10"
                      />
                      {errors.bkashNumber && (
                        <p className="text-red-500 text-sm mt-1">{errors.bkashNumber}</p>
                      )}
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">
                        {'Transaction Id'} <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        value={formData.bkashTrxId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bkashTrxId: e.target.value,
                          })
                        }
                        placeholder="Enter transaction ID"
                        className="h-10"
                      />
                      {errors.bkashTrxId && (
                        <p className="text-red-500 text-sm mt-1">{errors.bkashTrxId}</p>
                      )}
                    </div>
                  </>
                )}

                <ShopButton
                  type="submit"
                  disabled={loading}
                  variant="primary"
                  className="w-full h-12"
                >
                  {loading ? 'Processing Order' : 'Place Order'}
                </ShopButton>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20 shadow-lg">
              <CardHeader className="bg-muted/50">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                  {'Order Summary'}
                </CardTitle>
                <CardDescription>{'Your Order Details'}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {/* Items List */}
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {items.map((item) => {
                    const itemTotal = item.price * item.quantity;
                    return (
                      <div
                        key={`${item.productId}-${item.variantId || ''}`}
                        className="flex justify-between text-sm items-start gap-3 pb-2 border-b last:border-0"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.name}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {item.variantName && (
                              <Badge variant="secondary" className="text-xs h-5">
                                <Tag className="w-3 h-3 mr-1" />
                                {item.variantName}
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">x {item.quantity}</span>
                          </div>
                        </div>
                        <span className="font-semibold text-nowrap">
                          ৳{itemTotal.toLocaleString('en-US')}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <Separator />

                {/* Coupon Section */}
                <div className="space-y-2">
                  <label className="block font-semibold text-sm">{'Coupon Code If Any'}</label>
                  {appliedCoupon ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            <p className="font-semibold text-green-800">{appliedCoupon.code}</p>
                          </div>
                          {appliedCoupon.description && (
                            <p className="text-xs text-green-600 ml-6">
                              {appliedCoupon.description}
                            </p>
                          )}
                        </div>
                        <Button
                          type="button"
                          onClick={removeCoupon}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 px-2"
                        >
                          {'Remove'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          value={formData.couponCode}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              couponCode: e.target.value,
                            })
                          }
                          placeholder={'Enter Coupon'}
                          className="h-10"
                        />
                        <Button
                          type="button"
                          onClick={applyCoupon}
                          disabled={couponLoading || !formData.couponCode.trim()}
                          variant="secondary"
                        >
                          {couponLoading ? 'Checking' : 'Apply'}
                        </Button>
                      </div>
                      {couponError && (
                        <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
                          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                          <span>{couponError}</span>
                        </div>
                      )}
                    </div>
                  )}
                  {couponSuccess && (
                    <div className="flex items-start gap-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg p-2">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{couponSuccess}</span>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-muted-foreground flex items-center gap-1">
                      {'Subtotal'}
                      <span className="text-xs">
                        ({items.length}
                        {'Items Count'})
                      </span>
                    </span>
                    <span className="font-semibold text-base">
                      ৳{subtotalAmount.toLocaleString('en-US')}
                    </span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-sm items-center text-green-600">
                      <span className="flex items-center gap-1">{'Discount'}</span>
                      <span className="font-semibold">
                        -৳
                        {discountAmount.toLocaleString('en-US')}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-muted-foreground">{'Shipping Cost'}</span>
                    {selectedShipping ? (
                      <span className="font-semibold text-base">
                        ৳{shippingCost.toLocaleString('en-US')}
                      </span>
                    ) : (
                      <span className="text-xs text-amber-600">Select shipping method</span>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between items-center bg-primary/5 -mx-6 px-6 py-4 rounded-lg">
                  <span className="font-semibold text-lg">{'Total'}</span>
                  <span className="font-bold text-2xl sm:text-3xl text-primary">
                    ৳{finalTotal.toLocaleString('en-US')}
                  </span>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
                  <Package className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-green-800">{'All In Stock'}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Alert Dialog */}
      <Dialog
        open={dialogState.isOpen}
        onOpenChange={(open) => !open && setDialogState({ ...dialogState, isOpen: false })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogState.title}</DialogTitle>
            <DialogDescription>{dialogState.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setDialogState({ ...dialogState, isOpen: false })}>
              {'Ok'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
