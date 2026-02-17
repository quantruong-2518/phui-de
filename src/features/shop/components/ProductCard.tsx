import { ShoppingBag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image_url: string | null;
  is_new: boolean;
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="group relative overflow-hidden transition-all duration-200 hover:shadow-md">
      {/* Image Placeholder */}
      <div className="relative flex aspect-square items-center justify-center bg-zinc-100 p-6 dark:bg-zinc-800">
        <ShoppingBag className="h-12 w-12 text-zinc-300 transition-transform duration-300 group-hover:scale-110 dark:text-zinc-600" />
        {product.is_new && (
          <Badge className="bg-primary text-primary-foreground pointer-events-none absolute top-3 left-3">
            NEW
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="space-y-2 p-4">
        <div className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
          {product.category}
        </div>
        <h3 className="group-hover:text-primary line-clamp-2 h-10 text-sm leading-tight font-semibold transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center justify-between pt-2">
          <span className="text-lg font-bold">
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(product.price)}
          </span>
        </div>
        <Button
          size="sm"
          className="mt-2 w-full opacity-0 transition-opacity group-hover:opacity-100"
        >
          Thêm vào giỏ
        </Button>
      </div>
    </Card>
  );
}
