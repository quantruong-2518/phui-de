'use client';

import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MOCK_PRODUCTS } from '@/lib/mock-data';
import { ProductCard } from '@/features/shop/components/ProductCard';

export default function ShopPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      {/* Header */}
      <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">CỬA HÀNG</h1>
          <p className="text-muted-foreground text-sm">
            Trang bị thi đấu chính hãng dành cho dân phủi.
          </p>
        </div>
        <Button className="h-10 rounded-md px-4 text-sm font-medium">
          <ShoppingBag className="mr-2 h-4 w-4" />
          Giỏ hàng (0)
        </Button>
      </div>

      {/* Products List */}
      <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
        {MOCK_PRODUCTS.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
