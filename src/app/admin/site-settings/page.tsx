'use client'

import { useState, useEffect } from 'react'
import ImageUpload from '@/components/ImageUpload'
import { FormActionBar, type FormState } from '@/components/form-action-bar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Plus, Edit, Trash2 } from 'lucide-react'

type Tab = 'basic' | 'menu' | 'footer'

interface MenuItem {
  id: string
  label: string
  url: string
  parentId: string | null
  type: 'CUSTOM' | 'CATEGORY' | 'PRODUCT' | 'PAGE'
  targetId: string | null
  icon: string | null
  order: number
  active: boolean
  openInNewTab: boolean
  megaMenu: boolean
  featured: boolean
  children?: MenuItem[]
}

function SortableMenuItem({
  item,
  onEdit,
  onDelete,
}: {
  item: MenuItem
  onEdit: (item: MenuItem) => void
  onDelete: (id: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={isDragging ? 'bg-muted/50' : ''}
    >
      <TableCell className="w-12">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="cursor-grab active:cursor-grabbing h-8 w-8"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </Button>
      </TableCell>
      <TableCell>
        <div className="font-medium">{item.label}</div>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {item.url}
      </TableCell>
      <TableCell>
        <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset bg-blue-50 text-blue-700 ring-blue-700/10">
          {item.type}
        </span>
      </TableCell>
      <TableCell>
        <Switch checked={item.active} disabled />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onEdit(item)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onDelete(item.id)}
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}

export default function SiteSettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('basic')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form state management
  const [formState, setFormState] = useState<FormState>('idle')
  const [statusMessage, setStatusMessage] = useState<string>('')
  const [savedBasicData, setSavedBasicData] = useState<any>(null)
  const [savedFooterData, setSavedFooterData] = useState<any>(null)
  const [isBasicDataInitialized, setIsBasicDataInitialized] = useState(false)
  const [isFooterDataInitialized, setIsFooterDataInitialized] = useState(false)

  // Menu Management State
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [showMenuForm, setShowMenuForm] = useState(false)
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null)
  const [menuForm, setMenuForm] = useState({
    label: '',
    url: '',
    type: 'CUSTOM' as 'CUSTOM' | 'CATEGORY' | 'PRODUCT' | 'PAGE',
    targetId: '',
    icon: '',
    active: true,
    openInNewTab: false,
    megaMenu: false,
    featured: false,
  })
  const [savedMenuForm, setSavedMenuForm] = useState<typeof menuForm | null>(
    null
  )
  const [menuFormState, setMenuFormState] = useState<FormState>('idle')

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Basic Settings State
  const [basicSettings, setBasicSettings] = useState({
    siteName: 'SuperMart',
    siteDescription: '',
    logo: '',
    favicon: '',
    promoText: '',
    promoActive: false,
    promoLink: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    ogImage: '',
    supportEmail: '',
    supportPhone: '',
    currency: 'BDT',
    currencySymbol: '৳',
    timezone: 'Asia/Dhaka',
    enableWishlist: true,
    enableReviews: true,
    enableCoupons: true,
    bkashNumber: '',
    bkashNote: '',
  })

  // Footer Settings State
  const [footerSettings, setFooterSettings] = useState({
    logo: '',
    description: '',
    copyrightText: '',
    phone: '',
    email: '',
    address: '',
    workingHours: '',
    paymentMethods: [] as string[],
    showPaymentMethods: true,
    enableNewsletter: true,
    newsletterTitle: '',
    newsletterText: '',
    backgroundColor: '#1a1a1a',
    textColor: '#ffffff',
  })

  useEffect(() => {
    // Reset initialization flags and form state when switching tabs
    setIsBasicDataInitialized(false)
    setIsFooterDataInitialized(false)
    setFormState('idle')
    fetchSettings()
  }, [activeTab])

  // Track form changes for basic settings
  useEffect(() => {
    if (
      activeTab === 'basic' &&
      savedBasicData &&
      !loading &&
      isBasicDataInitialized
    ) {
      const hasChanges =
        JSON.stringify(basicSettings) !== JSON.stringify(savedBasicData)
      setFormState(hasChanges ? 'dirty' : 'idle')
    }
  }, [
    basicSettings,
    savedBasicData,
    activeTab,
    loading,
    isBasicDataInitialized,
  ])

  // Track form changes for footer settings
  useEffect(() => {
    if (
      activeTab === 'footer' &&
      savedFooterData &&
      !loading &&
      isFooterDataInitialized
    ) {
      const hasChanges =
        JSON.stringify(footerSettings) !== JSON.stringify(savedFooterData)
      setFormState(hasChanges ? 'dirty' : 'idle')
    }
  }, [
    footerSettings,
    savedFooterData,
    activeTab,
    loading,
    isFooterDataInitialized,
  ])

  // Track menu form changes
  useEffect(() => {
    if (showMenuForm && savedMenuForm) {
      const hasChanges =
        JSON.stringify(menuForm) !== JSON.stringify(savedMenuForm)
      setMenuFormState(hasChanges ? 'dirty' : 'idle')
    } else if (!showMenuForm) {
      setMenuFormState('idle')
    }
  }, [menuForm, savedMenuForm, showMenuForm])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      if (activeTab === 'basic') {
        const res = await fetch('/api/admin/site-settings/basic')
        const data = await res.json()
        if (data.id) {
          // Convert null values to empty strings and ensure all fields exist
          const sanitizedData = Object.fromEntries(
            Object.entries(data).map(([key, value]) => [
              key,
              value === null || value === undefined ? '' : value,
            ])
          )
          // Merge with existing state to ensure all fields are present
          setBasicSettings(prev => ({ ...prev, ...sanitizedData }))
          setSavedBasicData({ ...basicSettings, ...sanitizedData })
          // Set initialization flag after a brief delay to allow state to settle
          setTimeout(() => setIsBasicDataInitialized(true), 100)
        }
      } else if (activeTab === 'menu') {
        const res = await fetch('/api/admin/menu')
        const data = await res.json()
        setMenuItems(data)
      } else if (activeTab === 'footer') {
        const res = await fetch('/api/admin/site-settings/footer')
        const data = await res.json()
        if (data.id) {
          // Convert null values to empty strings and ensure all fields exist
          const sanitizedData = Object.fromEntries(
            Object.entries(data).map(([key, value]) => [
              key,
              value === null || value === undefined ? '' : value,
            ])
          )
          // Merge with existing state to ensure all fields are present
          setFooterSettings(prev => ({ ...prev, ...sanitizedData }))
          setSavedFooterData({ ...footerSettings, ...sanitizedData })
          // Set initialization flag after a brief delay to allow state to settle
          setTimeout(() => setIsFooterDataInitialized(true), 100)
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBasicSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormState('loading')
    setStatusMessage('Saving Settings')

    try {
      const res = await fetch('/api/admin/site-settings/basic', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(basicSettings),
      })

      if (res.ok) {
        const data = await res.json()
        const sanitizedData = Object.fromEntries(
          Object.entries(data).map(([key, value]) => [
            key,
            value === null || value === undefined ? '' : value,
          ])
        )
        setSavedBasicData({ ...basicSettings, ...sanitizedData })
        setStatusMessage('Settings Saved')
        setFormState('success')
      } else {
        setStatusMessage('Settings Save Error')
        setFormState('error')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      setStatusMessage('Settings Save Error')
      setFormState('error')
    }
  }

  const handleFooterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormState('loading')
    setStatusMessage('Footer Saving')

    try {
      const res = await fetch('/api/admin/site-settings/footer', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(footerSettings),
      })

      if (res.ok) {
        const data = await res.json()
        const sanitizedData = Object.fromEntries(
          Object.entries(data).map(([key, value]) => [
            key,
            value === null || value === undefined ? '' : value,
          ])
        )
        setSavedFooterData({ ...footerSettings, ...sanitizedData })
        setStatusMessage('Footer Saved')
        setFormState('success')
      } else {
        setStatusMessage('Settings Save Error')
        setFormState('error')
      }
    } catch (error) {
      console.error('Error saving footer settings:', error)
      setStatusMessage('Settings Save Error')
      setFormState('error')
    }
  }

  // Menu Management Functions
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setMenuItems(items => {
        const oldIndex = items.findIndex(item => item.id === active.id)
        const newIndex = items.findIndex(item => item.id === over.id)

        const newItems = arrayMove(items, oldIndex, newIndex)

        // Update orders
        const updatedItems = newItems.map((item, index) => ({
          ...item,
          order: index,
        }))

        // Save to server
        saveMenuOrder(updatedItems)

        return updatedItems
      })
    }
  }

  const saveMenuOrder = async (items: MenuItem[]) => {
    try {
      await fetch('/api/admin/menu', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })
    } catch (error) {
      console.error('Error saving menu order:', error)
    }
  }

  const handleAddMenuItem = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setMenuFormState('loading')

    try {
      const order = menuItems.length
      const res = await fetch('/api/admin/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...menuForm, order }),
      })

      if (res.ok) {
        setMenuFormState('success')
        setTimeout(() => {
          setShowMenuForm(false)
          setMenuForm({
            label: '',
            url: '',
            type: 'CUSTOM',
            targetId: '',
            icon: '',
            active: true,
            openInNewTab: false,
            megaMenu: false,
            featured: false,
          })
          setSavedMenuForm(null)
          setMenuFormState('idle')
        }, 1000)
        fetchSettings()
      } else {
        setMenuFormState('error')
      }
    } catch (error) {
      console.error('Error adding menu item:', error)
      setMenuFormState('error')
    }
  }

  const handleEditMenuItem = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!editingMenuItem) return
    setMenuFormState('loading')

    try {
      const res = await fetch(`/api/admin/menu/${editingMenuItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(menuForm),
      })

      if (res.ok) {
        setMenuFormState('success')
        setTimeout(() => {
          setEditingMenuItem(null)
          setShowMenuForm(false)
          setSavedMenuForm(null)
          setMenuFormState('idle')
        }, 1000)
        fetchSettings()
      } else {
        setMenuFormState('error')
      }
    } catch (error) {
      console.error('Error updating menu item:', error)
      setMenuFormState('error')
    }
  }

  const handleDeleteMenuItem = async (id: string) => {
    if (!confirm('Confirm Delete Menu Item')) return

    try {
      const res = await fetch(`/api/admin/menu/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchSettings()
      }
    } catch (error) {
      console.error('Error deleting menu item:', error)
    }
  }

  const openEditForm = (item: MenuItem) => {
    setEditingMenuItem(item)
    const formData = {
      label: item.label,
      url: item.url,
      type: item.type,
      targetId: item.targetId || '',
      icon: item.icon || '',
      active: item.active,
      openInNewTab: item.openInNewTab,
      megaMenu: item.megaMenu,
      featured: item.featured,
    }
    setMenuForm(formData)
    setSavedMenuForm({ ...formData })
    setMenuFormState('idle')
    setShowMenuForm(true)
  }

  const tabs = [
    { id: 'basic' as Tab, label: 'Basic Settings' },
    { id: 'menu' as Tab, label: 'Menu Management' },
    { id: 'footer' as Tab, label: 'Footer Management' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{'Site Settings'}</h1>
        <p className="text-muted-foreground mt-2">
          Configure your store settings
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        {tabs.map(tab => (
          <Button
            key={tab.id}
            variant="ghost"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-6 py-3 font-semibold transition-colors rounded-none',
              activeTab === tab.id
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="p-8">{'Loading...'}</div>
      ) : (
        <>
          {/* Basic Settings Tab */}
          {activeTab === 'basic' && (
            <form
              onSubmit={e => {
                e.preventDefault()
                handleBasicSubmit(e)
              }}
              className="max-w-4xl space-y-8"
            >
              {/* Site Identity */}
              <Card>
                <CardHeader>
                  <CardTitle>{'Site Identity'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      type="text"
                      value={basicSettings.siteName}
                      onChange={e =>
                        setBasicSettings({
                          ...basicSettings,
                          siteName: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{'Logo'}</Label>
                    <ImageUpload
                      images={basicSettings.logo ? [basicSettings.logo] : []}
                      onChange={urls =>
                        setBasicSettings({
                          ...basicSettings,
                          logo: urls[0] || '',
                        })
                      }
                      maxImages={1}
                      label={'Upload Logo'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="favicon">Favicon URL</Label>
                    <Input
                      id="favicon"
                      type="text"
                      value={basicSettings.favicon}
                      onChange={e =>
                        setBasicSettings({
                          ...basicSettings,
                          favicon: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="siteDescription">Description</Label>
                    <Textarea
                      id="siteDescription"
                      value={basicSettings.siteDescription}
                      onChange={e =>
                        setBasicSettings({
                          ...basicSettings,
                          siteDescription: e.target.value,
                        })
                      }
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* SEO Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>SEO Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="metaTitle">Meta Title</Label>
                    <Input
                      id="metaTitle"
                      type="text"
                      value={basicSettings.metaTitle}
                      onChange={e =>
                        setBasicSettings({
                          ...basicSettings,
                          metaTitle: e.target.value,
                        })
                      }
                      placeholder="Site Title for Search Engines"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="metaDescription">Meta Description</Label>
                    <Textarea
                      id="metaDescription"
                      value={basicSettings.metaDescription}
                      onChange={e =>
                        setBasicSettings({
                          ...basicSettings,
                          metaDescription: e.target.value,
                        })
                      }
                      rows={3}
                      placeholder="Brief description for search engines (160 characters recommended)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="metaKeywords">Meta Keywords</Label>
                    <Input
                      id="metaKeywords"
                      type="text"
                      value={basicSettings.metaKeywords}
                      onChange={e =>
                        setBasicSettings({
                          ...basicSettings,
                          metaKeywords: e.target.value,
                        })
                      }
                      placeholder="keyword1, keyword2, keyword3"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Open Graph Image</Label>
                    <ImageUpload
                      images={
                        basicSettings.ogImage ? [basicSettings.ogImage] : []
                      }
                      onChange={urls =>
                        setBasicSettings({
                          ...basicSettings,
                          ogImage: urls[0] || '',
                        })
                      }
                      maxImages={1}
                      label="Upload OG Image (1200x630px recommended)"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Promo Bar */}
              <Card>
                <CardHeader>
                  <CardTitle>{'Promo Bar'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="promoActive"
                      checked={basicSettings.promoActive}
                      onCheckedChange={checked =>
                        setBasicSettings({
                          ...basicSettings,
                          promoActive: checked,
                        })
                      }
                    />
                    <Label htmlFor="promoActive" className="font-semibold">
                      {'Enable Promo Bar'}
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="promoText">Promo Text</Label>
                    <Input
                      id="promoText"
                      type="text"
                      value={basicSettings.promoText}
                      onChange={e =>
                        setBasicSettings({
                          ...basicSettings,
                          promoText: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="promoLink">{'Promo Link'}</Label>
                    <Input
                      id="promoLink"
                      type="text"
                      value={basicSettings.promoLink}
                      onChange={e =>
                        setBasicSettings({
                          ...basicSettings,
                          promoLink: e.target.value,
                        })
                      }
                      placeholder="/products"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Contact & Business */}
              <Card>
                <CardHeader>
                  <CardTitle>{'Contact Business'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="supportEmail">{'Support Email'}</Label>
                      <Input
                        id="supportEmail"
                        type="email"
                        value={basicSettings.supportEmail}
                        onChange={e =>
                          setBasicSettings({
                            ...basicSettings,
                            supportEmail: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="supportPhone">{'Support Phone'}</Label>
                      <Input
                        id="supportPhone"
                        type="text"
                        value={basicSettings.supportPhone}
                        onChange={e =>
                          setBasicSettings({
                            ...basicSettings,
                            supportPhone: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currency">{'Currency'}</Label>
                      <Input
                        id="currency"
                        type="text"
                        value={basicSettings.currency}
                        onChange={e =>
                          setBasicSettings({
                            ...basicSettings,
                            currency: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currencySymbol">
                        {'Currency Symbol'}
                      </Label>
                      <Input
                        id="currencySymbol"
                        type="text"
                        value={basicSettings.currencySymbol}
                        onChange={e =>
                          setBasicSettings({
                            ...basicSettings,
                            currencySymbol: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">{'Timezone'}</Label>
                      <Input
                        id="timezone"
                        type="text"
                        value={basicSettings.timezone}
                        onChange={e =>
                          setBasicSettings({
                            ...basicSettings,
                            timezone: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Features */}
              <Card>
                <CardHeader>
                  <CardTitle>{'Feature Settings'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableWishlist"
                      checked={basicSettings.enableWishlist}
                      onCheckedChange={checked =>
                        setBasicSettings({
                          ...basicSettings,
                          enableWishlist: checked,
                        })
                      }
                    />
                    <Label htmlFor="enableWishlist">{'Enable Wishlist'}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableReviews"
                      checked={basicSettings.enableReviews}
                      onCheckedChange={checked =>
                        setBasicSettings({
                          ...basicSettings,
                          enableReviews: checked,
                        })
                      }
                    />
                    <Label htmlFor="enableReviews">{'Enable Reviews'}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableCoupons"
                      checked={basicSettings.enableCoupons}
                      onCheckedChange={checked =>
                        setBasicSettings({
                          ...basicSettings,
                          enableCoupons: checked,
                        })
                      }
                    />
                    <Label htmlFor="enableCoupons">{'Enable Coupons'}</Label>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>{'Payment Settings'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bkashNumber">bKash Number</Label>
                    <Input
                      id="bkashNumber"
                      type="text"
                      value={basicSettings.bkashNumber}
                      onChange={e =>
                        setBasicSettings({
                          ...basicSettings,
                          bkashNumber: e.target.value,
                        })
                      }
                      placeholder="01XXXXXXXXX"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bkashNote">bKash Note</Label>
                    <Textarea
                      id="bkashNote"
                      value={basicSettings.bkashNote}
                      onChange={e =>
                        setBasicSettings({
                          ...basicSettings,
                          bkashNote: e.target.value,
                        })
                      }
                      rows={3}
                      placeholder="Please send money to this number and provide the transaction ID"
                    />
                  </div>
                </CardContent>
              </Card>
            </form>
          )}

          {/* Menu Management Tab */}
          {activeTab === 'menu' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">{'Menu Management'}</h2>
                <Button
                  onClick={() => {
                    setEditingMenuItem(null)
                    const initialForm = {
                      label: '',
                      url: '',
                      type: 'CUSTOM' as
                        | 'CUSTOM'
                        | 'CATEGORY'
                        | 'PRODUCT'
                        | 'PAGE',
                      targetId: '',
                      icon: '',
                      active: true,
                      openInNewTab: false,
                      megaMenu: false,
                      featured: false,
                    }
                    setMenuForm(initialForm)
                    setSavedMenuForm({ ...initialForm })
                    setMenuFormState('idle')
                    setShowMenuForm(true)
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {'Add Menu Item'}
                </Button>
              </div>

              {/* Menu Form */}
              {showMenuForm && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {editingMenuItem ? 'Edit Menu Item' : 'Add Menu Item'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={
                        editingMenuItem ? handleEditMenuItem : handleAddMenuItem
                      }
                      className="space-y-6"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="label">Menu Item Label</Label>
                        <Input
                          id="label"
                          type="text"
                          value={menuForm.label}
                          onChange={e =>
                            setMenuForm({
                              ...menuForm,
                              label: e.target.value,
                            })
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="url">{'Menu Item Url'}</Label>
                        <Input
                          id="url"
                          type="text"
                          value={menuForm.url}
                          onChange={e =>
                            setMenuForm({ ...menuForm, url: e.target.value })
                          }
                          placeholder="/products"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="type">{'Menu Item Type'}</Label>
                          <select
                            id="type"
                            value={menuForm.type}
                            onChange={e =>
                              setMenuForm({
                                ...menuForm,
                                type: e.target.value as any,
                              })
                            }
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="CUSTOM">{'Custom'}</option>
                            <option value="CATEGORY">{'Category'}</option>
                            <option value="PRODUCT">{'Product Type'}</option>
                            <option value="PAGE">{'Page'}</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="icon">{'Icon'}</Label>
                          <Input
                            id="icon"
                            type="text"
                            value={menuForm.icon}
                            onChange={e =>
                              setMenuForm({ ...menuForm, icon: e.target.value })
                            }
                            placeholder="home, shopping-bag, etc."
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="active"
                            checked={menuForm.active}
                            onCheckedChange={checked =>
                              setMenuForm({
                                ...menuForm,
                                active: checked,
                              })
                            }
                          />
                          <Label htmlFor="active">{'Active'}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="openInNewTab"
                            checked={menuForm.openInNewTab}
                            onCheckedChange={checked =>
                              setMenuForm({
                                ...menuForm,
                                openInNewTab: checked,
                              })
                            }
                          />
                          <Label htmlFor="openInNewTab">
                            {'Open In New Tab'}
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="megaMenu"
                            checked={menuForm.megaMenu}
                            onCheckedChange={checked =>
                              setMenuForm({
                                ...menuForm,
                                megaMenu: checked,
                              })
                            }
                          />
                          <Label htmlFor="megaMenu">{'Mega Menu'}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="featured"
                            checked={menuForm.featured}
                            onCheckedChange={checked =>
                              setMenuForm({
                                ...menuForm,
                                featured: checked,
                              })
                            }
                          />
                          <Label htmlFor="featured">{'Featured'}</Label>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowMenuForm(false)
                            setEditingMenuItem(null)
                            setSavedMenuForm(null)
                            setMenuFormState('idle')
                          }}
                        >
                          {'Cancel'}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Menu Items List with DnD */}
              <Card>
                <CardHeader>
                  <CardTitle>{'Menu Item List'}</CardTitle>
                </CardHeader>
                <CardContent>
                  {menuItems.length === 0 ? (
                    <p className="text-muted-foreground">{'No Menu Items'}</p>
                  ) : (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-12"></TableHead>
                              <TableHead>{'Label'}</TableHead>
                              <TableHead>URL</TableHead>
                              <TableHead>{'Type'}</TableHead>
                              <TableHead>{'Status'}</TableHead>
                              <TableHead className="text-right">
                                {'Actions'}
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <SortableContext
                              items={menuItems.map(item => item.id)}
                              strategy={verticalListSortingStrategy}
                            >
                              {menuItems.map(item => (
                                <SortableMenuItem
                                  key={item.id}
                                  item={item}
                                  onEdit={openEditForm}
                                  onDelete={handleDeleteMenuItem}
                                />
                              ))}
                            </SortableContext>
                          </TableBody>
                        </Table>
                      </div>
                    </DndContext>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Footer Management Tab */}
          {activeTab === 'footer' && (
            <form onSubmit={handleFooterSubmit} className="max-w-4xl space-y-8">
              {/* Info Alert about Static Footer Links */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">
                  About Footer Links
                </h3>
                <p className="text-sm text-blue-800">
                  Footer links are now static and common across all shops. They
                  include: About Us, Contact, FAQ, Privacy Policy, and Terms &
                  Conditions pages. You can only customize contact information,
                  social links, and other footer settings below.
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>{'Footer Info'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>{'Footer Logo'}</Label>
                    <ImageUpload
                      images={footerSettings.logo ? [footerSettings.logo] : []}
                      onChange={urls =>
                        setFooterSettings({
                          ...footerSettings,
                          logo: urls[0] || '',
                        })
                      }
                      maxImages={1}
                      label={'Upload Footer Logo'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="footerDescription">Description</Label>
                    <Textarea
                      id="footerDescription"
                      value={footerSettings.description}
                      onChange={e =>
                        setFooterSettings({
                          ...footerSettings,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="copyrightText">Copyright Text</Label>
                    <Input
                      id="copyrightText"
                      type="text"
                      value={footerSettings.copyrightText}
                      onChange={e =>
                        setFooterSettings({
                          ...footerSettings,
                          copyrightText: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="footerPhone">{'Footer Phone'}</Label>
                      <Input
                        id="footerPhone"
                        type="text"
                        value={footerSettings.phone}
                        onChange={e =>
                          setFooterSettings({
                            ...footerSettings,
                            phone: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="footerEmail">{'Footer Email'}</Label>
                      <Input
                        id="footerEmail"
                        type="email"
                        value={footerSettings.email}
                        onChange={e =>
                          setFooterSettings({
                            ...footerSettings,
                            email: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="footerAddress">Address</Label>
                    <Input
                      id="footerAddress"
                      type="text"
                      value={footerSettings.address}
                      onChange={e =>
                        setFooterSettings({
                          ...footerSettings,
                          address: e.target.value,
                        })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{'Newsletter Settings'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableNewsletter"
                      checked={footerSettings.enableNewsletter}
                      onCheckedChange={checked =>
                        setFooterSettings({
                          ...footerSettings,
                          enableNewsletter: checked,
                        })
                      }
                    />
                    <Label htmlFor="enableNewsletter" className="font-semibold">
                      {'Enable Newsletter'}
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newsletterTitle">Newsletter Title</Label>
                    <Input
                      id="newsletterTitle"
                      type="text"
                      value={footerSettings.newsletterTitle}
                      onChange={e =>
                        setFooterSettings({
                          ...footerSettings,
                          newsletterTitle: e.target.value,
                        })
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </form>
          )}
        </>
      )}

      {(activeTab === 'basic' || activeTab === 'footer') && (
        <FormActionBar
          state={formState}
          onReset={() => {
            if (activeTab === 'basic' && savedBasicData) {
              setBasicSettings({ ...savedBasicData })
            } else if (activeTab === 'footer' && savedFooterData) {
              setFooterSettings({ ...savedFooterData })
            }
          }}
          onSave={() => {
            if (activeTab === 'basic') {
              handleBasicSubmit(new Event('submit') as any)
            } else if (activeTab === 'footer') {
              handleFooterSubmit(new Event('submit') as any)
            }
          }}
          onAnimationComplete={() => {
            if (formState === 'success' || formState === 'error') {
              setFormState('idle')
            }
          }}
          resetLabel={'Reset'}
          saveLabel={'Save'}
          dirtyMessage={'Unsaved Changes'}
          loadingMessage={statusMessage}
          successMessage={statusMessage}
          errorMessage={statusMessage}
        />
      )}

      {activeTab === 'menu' && showMenuForm && (
        <FormActionBar
          state={menuFormState}
          onReset={() => {
            if (savedMenuForm) {
              setMenuForm({ ...savedMenuForm })
            } else {
              setMenuForm({
                label: '',
                url: '',
                type: 'CUSTOM',
                targetId: '',
                icon: '',
                active: true,
                openInNewTab: false,
                megaMenu: false,
                featured: false,
              })
            }
          }}
          onSave={() => {
            if (editingMenuItem) {
              handleEditMenuItem()
            } else {
              handleAddMenuItem()
            }
          }}
          onAnimationComplete={() => {
            if (menuFormState === 'success' || menuFormState === 'error') {
              setTimeout(() => setMenuFormState('idle'), 500)
            }
          }}
          resetLabel={'Reset'}
          saveLabel={editingMenuItem ? 'Update Btn' : 'Add Btn'}
          dirtyMessage={'Unsaved Changes'}
          loadingMessage={editingMenuItem ? 'Updating' : 'Adding'}
          successMessage={
            editingMenuItem ? 'Menu Item Updated' : 'Menu Item Added'
          }
          errorMessage={'Settings Save Error'}
        />
      )}
    </div>
  )
}
