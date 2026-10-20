'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { FormActionBar } from '@/components/form-action-bar'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface FeatureCard {
  id: string
  title: string
  description?: string | null
  icon: string
  order: number
  active: boolean
}

export default function FeatureCardEditPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const isNew = params.id === 'new'

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: '🚚',
    order: 0,
    active: true,
  })

  const [initialData, setInitialData] = useState(formData)
  const [formState, setFormState] = useState<
    'idle' | 'dirty' | 'saving' | 'saved'
  >('idle')

  // Fetch existing card for edit
  const { data: card, isLoading } = useQuery<FeatureCard>({
    queryKey: ['feature-card', params.id],
    queryFn: async () => {
      const res = await fetch(`/api/admin/feature-cards/${params.id}`)
      if (!res.ok) throw new Error('Failed to fetch feature card')
      return res.json()
    },
    enabled: !isNew,
  })

  // Set form data when card loads
  useEffect(() => {
    if (card) {
      const data = {
        title: card.title,
        description: card.description || '',
        icon: card.icon,
        order: card.order,
        active: card.active,
      }
      setFormData(data)
      setInitialData(data)
    }
  }, [card])

  // Track form changes
  useEffect(() => {
    if (formState === 'saving' || formState === 'saved') return
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialData)
    setFormState(hasChanges ? 'dirty' : 'idle')
  }, [formData, initialData, formState])

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const url = isNew
        ? '/api/admin/feature-cards'
        : `/api/admin/feature-cards/${params.id}`
      const method = isNew ? 'POST' : 'PUT'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error('Failed to save feature card')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-cards'] })
      queryClient.invalidateQueries({ queryKey: ['feature-card', params.id] })
      setFormState('saved')
      toast.success(
        isNew
          ? 'Feature card added successfully'
          : 'Feature card updated successfully'
      )

      setTimeout(() => {
        router.push('/admin/homepage')
      }, 1000)
    },
    onError: () => {
      setFormState('dirty')
      toast.error('Failed to save feature card')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormState('saving')
    saveMutation.mutate(formData)
  }

  const handleCancel = () => {
    router.push('/admin/homepage')
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const commonIcons = ['🚚', '💳', '🔒', '↩️', '⏰', '🎁', '📞', '✨']

  return (
    <div className="min-h-screen bg-background">
      <FormActionBar
        state={
          formState === 'saving'
            ? 'loading'
            : formState === 'saved'
            ? 'success'
            : formState === 'dirty'
            ? 'dirty'
            : 'idle'
        }
        onSave={() => handleSubmit(new Event('submit') as any)}
        onReset={handleCancel}
      />

      <div className="p-4 md:p-8 pt-20">
        <div className="mx-auto max-w-3xl space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin/homepage">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                {isNew ? 'Add New Feature Card' : 'Edit Feature Card'}
              </h1>
              <p className="text-muted-foreground">
                Configure feature card displayed on homepage
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Card>
              <CardContent className="space-y-6 pt-6">
                {/* Icon */}
                <div className="space-y-2">
                  <Label htmlFor="icon">
                    Icon <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="icon"
                    value={formData.icon}
                    onChange={e =>
                      setFormData({ ...formData, icon: e.target.value })
                    }
                    placeholder="🚚"
                    className="text-2xl"
                    required
                  />
                  <div className="flex gap-2 flex-wrap">
                    {commonIcons.map(icon => (
                      <Button
                        key={icon}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData({ ...formData, icon })}
                        className="text-xl"
                      >
                        {icon}
                      </Button>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Use any emoji or icon
                  </p>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={e =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Free Delivery"
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={e =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Free delivery on orders over 1000 BDT"
                    rows={3}
                  />
                </div>

                {/* Order */}
                <div className="space-y-2">
                  <Label htmlFor="order">Order</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        order: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="0"
                  />
                  <p className="text-muted-foreground">
                    Lower numbers appear first
                  </p>
                </div>

                {/* Active */}
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="active">Active</Label>
                    <p className="text-sm text-muted-foreground">
                      Display this card on homepage
                    </p>
                  </div>
                  <Switch
                    id="active"
                    checked={formData.active}
                    onCheckedChange={checked =>
                      setFormData({ ...formData, active: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </div>
  )
}
