'use client'

import { useState, useEffect } from 'react'
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
import { GripVertical, Plus, Edit, Trash2, Truck } from 'lucide-react'

interface ShippingMethod {
  id: string
  name: string
  description: string | null
  cost: number
  minOrder: number | null
  maxOrder: number | null
  active: boolean
  order: number
}

function SortableShippingMethod({
  method,
  onEdit,
  onDelete,
}: {
  method: ShippingMethod
  onEdit: (method: ShippingMethod) => void
  onDelete: (id: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: method.id })

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
        <div className="font-medium">{method.name}</div>
        {method.description && (
          <div className="text-sm text-muted-foreground">
            {method.description}
          </div>
        )}
      </TableCell>
      <TableCell className="text-right">৳{method.cost.toLocaleString('en-US')}</TableCell>
      <TableCell>
        {method.minOrder && (
          <div className="text-sm">Min: ৳{method.minOrder.toLocaleString('en-US')}</div>
        )}
        {method.maxOrder && (
          <div className="text-sm">Max: ৳{method.maxOrder.toLocaleString('en-US')}</div>
        )}
        {!method.minOrder && !method.maxOrder && (
          <span className="text-muted-foreground text-sm">No limits</span>
        )}
      </TableCell>
      <TableCell>
        <Switch checked={method.active} disabled />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onEdit(method)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onDelete(method.id)}
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}

export default function ShippingMethodsPage() {
  const [loading, setLoading] = useState(true)
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingMethod, setEditingMethod] = useState<ShippingMethod | null>(null)
  const [formState, setFormState] = useState<FormState>('idle')
  const [form, setForm] = useState({
    name: '',
    description: '',
    cost: '',
    minOrder: '',
    maxOrder: '',
    active: true,
  })
  const [savedForm, setSavedForm] = useState<typeof form | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    fetchShippingMethods()
  }, [])

  useEffect(() => {
    if (showForm && savedForm) {
      const hasChanges = JSON.stringify(form) !== JSON.stringify(savedForm)
      setFormState(hasChanges ? 'dirty' : 'idle')
    } else if (!showForm) {
      setFormState('idle')
    }
  }, [form, savedForm, showForm])

  const fetchShippingMethods = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/shipping-methods')
      const data = await res.json()
      setShippingMethods(data)
    } catch (error) {
      console.error('Error fetching shipping methods:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setShippingMethods(items => {
        const oldIndex = items.findIndex(item => item.id === active.id)
        const newIndex = items.findIndex(item => item.id === over.id)

        const newItems = arrayMove(items, oldIndex, newIndex)
        const updatedItems = newItems.map((item, index) => ({
          ...item,
          order: index,
        }))

        saveOrder(updatedItems)
        return updatedItems
      })
    }
  }

  const saveOrder = async (items: ShippingMethod[]) => {
    try {
      await fetch('/api/admin/shipping-methods', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })
    } catch (error) {
      console.error('Error saving order:', error)
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setFormState('loading')

    try {
      const url = editingMethod
        ? `/api/admin/shipping-methods/${editingMethod.id}`
        : '/api/admin/shipping-methods'
      const method = editingMethod ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description || null,
          cost: parseFloat(form.cost),
          minOrder: form.minOrder ? parseFloat(form.minOrder) : null,
          maxOrder: form.maxOrder ? parseFloat(form.maxOrder) : null,
          active: form.active,
          order: shippingMethods.length,
        }),
      })

      if (res.ok) {
        setFormState('success')
        setTimeout(() => {
          setShowForm(false)
          setEditingMethod(null)
          setForm({
            name: '',
            description: '',
            cost: '',
            minOrder: '',
            maxOrder: '',
            active: true,
          })
          setSavedForm(null)
          setFormState('idle')
          fetchShippingMethods()
        }, 1000)
      } else {
        setFormState('error')
      }
    } catch (error) {
      console.error('Error saving shipping method:', error)
      setFormState('error')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this shipping method?')) return

    try {
      const res = await fetch(`/api/admin/shipping-methods/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchShippingMethods()
      }
    } catch (error) {
      console.error('Error deleting shipping method:', error)
    }
  }

  const openEditForm = (method: ShippingMethod) => {
    setEditingMethod(method)
    const formData = {
      name: method.name,
      description: method.description || '',
      cost: method.cost.toString(),
      minOrder: method.minOrder?.toString() || '',
      maxOrder: method.maxOrder?.toString() || '',
      active: method.active,
    }
    setForm(formData)
    setSavedForm({ ...formData })
    setFormState('idle')
    setShowForm(true)
  }

  const openAddForm = () => {
    setEditingMethod(null)
    const initialForm = {
      name: '',
      description: '',
      cost: '',
      minOrder: '',
      maxOrder: '',
      active: true,
    }
    setForm(initialForm)
    setSavedForm({ ...initialForm })
    setFormState('idle')
    setShowForm(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Truck className="w-8 h-8" />
            Shipping Methods
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage shipping options for your store
          </p>
        </div>
        {!showForm && (
          <Button onClick={openAddForm}>
            <Plus className="w-4 h-4 mr-2" />
            Add Shipping Method
          </Button>
        )}
      </div>

      {loading ? (
        <div className="p-8">Loading...</div>
      ) : (
        <>
          {showForm && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingMethod ? 'Edit Shipping Method' : 'Add Shipping Method'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        value={form.name}
                        onChange={e =>
                          setForm({ ...form, name: e.target.value })
                        }
                        placeholder="e.g., Standard Delivery"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cost">
                        Cost (৳) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="cost"
                        type="number"
                        step="0.01"
                        value={form.cost}
                        onChange={e =>
                          setForm({ ...form, cost: e.target.value })
                        }
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={form.description}
                      onChange={e =>
                        setForm({ ...form, description: e.target.value })
                      }
                      rows={3}
                      placeholder="Optional description for this shipping method"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="minOrder">Minimum Order Amount (৳)</Label>
                      <Input
                        id="minOrder"
                        type="number"
                        step="0.01"
                        value={form.minOrder}
                        onChange={e =>
                          setForm({ ...form, minOrder: e.target.value })
                        }
                        placeholder="Leave empty for no minimum"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxOrder">Maximum Order Amount (৳)</Label>
                      <Input
                        id="maxOrder"
                        type="number"
                        step="0.01"
                        value={form.maxOrder}
                        onChange={e =>
                          setForm({ ...form, maxOrder: e.target.value })
                        }
                        placeholder="Leave empty for no maximum"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="active"
                      checked={form.active}
                      onCheckedChange={checked =>
                        setForm({ ...form, active: checked })
                      }
                    />
                    <Label htmlFor="active">Active</Label>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowForm(false)
                        setEditingMethod(null)
                        setSavedForm(null)
                        setFormState('idle')
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Shipping Methods List</CardTitle>
            </CardHeader>
            <CardContent>
              {shippingMethods.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No shipping methods found. Add your first shipping method to get started.
                </p>
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
                          <TableHead>Name</TableHead>
                          <TableHead className="text-right">Cost</TableHead>
                          <TableHead>Order Limits</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <SortableContext
                          items={shippingMethods.map(m => m.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {shippingMethods.map(method => (
                            <SortableShippingMethod
                              key={method.id}
                              method={method}
                              onEdit={openEditForm}
                              onDelete={handleDelete}
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
        </>
      )}

      {showForm && (
        <FormActionBar
          state={formState}
          onReset={() => {
            if (savedForm) {
              setForm({ ...savedForm })
            }
          }}
          onSave={() => handleSubmit()}
          onAnimationComplete={() => {
            if (formState === 'success' || formState === 'error') {
              setTimeout(() => setFormState('idle'), 500)
            }
          }}
          resetLabel="Reset"
          saveLabel={editingMethod ? 'Update' : 'Add'}
          dirtyMessage="Unsaved Changes"
          loadingMessage={editingMethod ? 'Updating...' : 'Adding...'}
          successMessage={
            editingMethod ? 'Method Updated!' : 'Method Added!'
          }
          errorMessage="Failed to save"
        />
      )}
    </div>
  )
}
