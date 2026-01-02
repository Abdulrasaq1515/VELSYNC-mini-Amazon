'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProductSchema } from '@/lib/validators/product.validator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateProductRequestDTO } from '@/lib/dto/request/product.dto';
import { useState } from 'react';

interface ProductFormProps {
  initialData?: any;
  onSubmit: (data: CreateProductRequestDTO) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  loading,
}) => {
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateProductRequestDTO>({
    resolver: zodResolver(createProductSchema),
    defaultValues: initialData,
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        setImages([...images, result.data.url]);
      }
    } catch (error) {
      console.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFormSubmit = async (data: CreateProductRequestDTO) => {
    await onSubmit({ ...data, images });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Product' : 'Create Product'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Product Name</label>
            <Input {...register('name')} />
            {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              {...register('description')}
              className="w-full rounded-md border border-gray-300 p-2"
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Price</label>
              <Input {...register('price', { valueAsNumber: true })} type="number" step="0.01" />
              {errors.price && <p className="text-sm text-red-600">{errors.price.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium">Stock</label>
              <Input {...register('stock', { valueAsNumber: true })} type="number" />
              {errors.stock && <p className="text-sm text-red-600">{errors.stock.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Category</label>
              <Input {...register('category')} />
              {errors.category && (
                <p className="text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium">Brand (Optional)</label>
              <Input {...register('brand')} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Images</label>
            <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
            <div className="mt-2 flex flex-wrap gap-2">
              {images.map((img, i) => (
                <div key={i} className="relative h-20 w-20">
                  <img src={img} alt="" className="h-full w-full rounded object-cover" />
                  <button
                    type="button"
                    onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                    className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            {images.length === 0 && <p className="text-sm text-red-600">At least one image required</p>}
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading || uploading || images.length === 0}>
              {loading ? 'Saving...' : initialData ? 'Update' : 'Create'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
