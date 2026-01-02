'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface ProductFilterProps {
  categories: string[];
  onFilterChange: (filters: any) => void;
}

export function ProductFilter({ categories, onFilterChange }: ProductFilterProps) {
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    search: '',
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const applyFilters = () => {
    onFilterChange(filters);
  };

  const clearFilters = () => {
    const emptyFilters = {
      category: '',
      minPrice: '',
      maxPrice: '',
      search: '',
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold text-gray-900">Filters</h2>

      <div className="mt-4 space-y-4">
        {/* Search */}
        <div>
          <label className="text-sm font-medium text-gray-700">Search</label>
          <Input
            type="text"
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="mt-1"
          />
        </div>

        {/* Category */}
        <div>
          <label className="text-sm font-medium text-gray-700">Category</label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="text-sm font-medium text-gray-700">Price Range</label>
          <div className="mt-1 flex gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            />
            <Input
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button onClick={applyFilters} className="flex-1">
            Apply
          </Button>
          <Button onClick={clearFilters} variant="outline" className="flex-1">
            Clear
          </Button>
        </div>
      </div>
    </Card>
  );
}
