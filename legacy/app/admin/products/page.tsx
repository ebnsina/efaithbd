'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTable, type DataColumn, type ListResponse, useListParams } from '@/components/data-table';
import { fetchJson } from '@/lib/api';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit, MoreVertical, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  images: string[];
  featured: boolean;
  active: boolean;
  category: { name: string };
  _count: { variants: number };
}

const productKeys = {
  all: ['admin', 'products'] as const,
  list: (query: string) => [...productKeys.all, 'list', query] as const,
};

const money = new Intl.NumberFormat('en-US');

const badge = 'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset';

function columns(onDelete: (id: string) => void): DataColumn<Product>[] {
  return [
    {
      id: 'image',
      header: 'Image',
      enableSorting: false,
      cell: ({ row }) =>
        row.original.images[0] ? (
          <img
            src={row.original.images[0]}
            alt=""
            loading="lazy"
            className="h-12 w-12 rounded-md object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted text-muted-foreground text-xs">
            None
          </div>
        ),
    },
    {
      id: 'name',
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <div className="font-medium">{row.original.name}</div>
          <div className="text-muted-foreground text-xs">{row.original.slug}</div>
        </div>
      ),
    },
    { id: 'category', header: 'Category', enableSorting: false, cell: ({ row }) => row.original.category.name },
    { id: 'price', accessorKey: 'price', header: 'Price', cell: ({ row }) => `৳${money.format(row.original.price)}` },
    {
      id: 'stock',
      accessorKey: 'stock',
      header: 'Stock',
      cell: ({ row }) =>
        row.original._count.variants > 0 ? (
          <span className="text-muted-foreground text-xs">{row.original._count.variants} variants</span>
        ) : (
          row.original.stock
        ),
    },
    {
      id: 'status',
      header: 'Status',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex flex-col items-start gap-1">
          {row.original.active ? (
            <span className={`${badge} bg-green-50 text-green-700 ring-green-600/20`}>Active</span>
          ) : (
            <span className={`${badge} bg-gray-50 text-gray-600 ring-gray-500/10`}>Inactive</span>
          )}
          {row.original.featured && (
            <span className={`${badge} bg-blue-50 text-blue-700 ring-blue-600/20`}>Featured</span>
          )}
        </div>
      ),
    },
    {
      id: 'actions',
      header: '',
      enableSorting: false,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={`Actions for ${row.original.name}`}>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/admin/products/${row.original.id}/edit`}>
                <Edit className="h-4 w-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(row.original.id)} className="text-destructive">
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}

export default function ProductsPage() {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const list = useListParams(['status']);
  const queryClient = useQueryClient();

  const products = useQuery({
    queryKey: productKeys.list(list.apiQuery),
    queryFn: () => fetchJson<ListResponse<Product>>(`/api/admin/products?${list.apiQuery}`),
    placeholderData: keepPreviousData,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetchJson(`/api/admin/products/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      toast.success('Product deleted');
    },
    onError: () => toast.error('Could not delete this product. Please try again.'),
    onSettled: () => setDeleteId(null),
  });

  const confirmDelete = () => {
    if (deleteId) deleteMutation.mutate(deleteId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Management</h1>
          <p className="text-muted-foreground mt-2">Create and manage products</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4" />
            {'Add New'}
          </Link>
        </Button>
      </div>

      <DataTable
        columns={columns(setDeleteId)}
        data={products.data}
        list={list}
        isLoading={products.isLoading}
        isError={products.isError}
        isFetching={products.isFetching}
        getRowId={(product) => product.id}
        searchPlaceholder="Search by name, slug or category"
        emptyMessage="No products found"
        filters={[
          {
            name: 'status',
            label: 'Status',
            options: [
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'featured', label: 'Featured' },
            ],
          },
        ]}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
