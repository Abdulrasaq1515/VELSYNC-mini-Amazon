'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ProductForm } from '@/components/admin/ProductForm';
import { useToast } from '@/components/ui/toast';
import { ProductResponseDTO } from '@/lib/dto/response/product.dto';
import { Pencil, Trash2, Plus } from 'lucide-react';

export default function AdminProductsPage() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<ProductResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductResponseDTO | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?limit=100');
      const result = await response.json();
      if (result.success) {
        setProducts(result.data.products);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: any) => {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (result.success) {
        showToast('Product created!', 'success');
        setShowForm(false);
        fetchProducts();
      } else {
        showToast(result.error?.message || 'Failed to create product', 'error');
      }
    } catch (error) {
      showToast('An error occurred', 'error');
    }
  };

  const handleUpdate = async (data: any) => {
    try {
      const response = await fetch(`/api/products/${editingProduct!.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (result.success) {
        showToast('Product updated!', 'success');
        setEditingProduct(null);
        fetchProducts();
      } else {
        showToast(result.error?.message || 'Failed to update product', 'error');
      }
    } catch (error) {
      showToast('An error occurred', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;

    try {
      const response = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const result = await response.json();
      
      if (result.success) {
        showToast('Product deleted!', 'success');
        fetchProducts();
      } else {
        showToast('Failed to delete product', 'error');
      }
    } catch (error) {
      showToast('An error occurred', 'error');
    }
  };

  if (showForm || editingProduct) {
    return (
      <div className="mx-auto max-w-3xl">
        <ProductForm
          initialData={editingProduct}
          onSubmit={editingProduct ? handleUpdate : handleCreate}
          onCancel={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Products</h1>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-10 w-10 rounded object-cover"
                    />
                    <span className="font-medium">{product.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">{product.category}</td>
                <td className="px-6 py-4 text-sm">${product.price}</td>
                <td className="px-6 py-4 text-sm">{product.stock}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingProduct(product)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
