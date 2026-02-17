import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="from-primary/20 via-background to-accent/20 relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="bg-primary/10 absolute -top-1/2 -left-1/2 h-full w-full animate-pulse rounded-full blur-3xl" />
        <div className="bg-accent/10 absolute -right-1/2 -bottom-1/2 h-full w-full animate-pulse rounded-full blur-3xl delay-1000" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-lg space-y-6 px-6 text-center">
        {/* Logo/Icon */}
        <div className="from-primary to-primary/80 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br shadow-2xl">
          <span className="text-4xl">⚽</span>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Chào Mừng Đến
          </h1>
          <h2 className="from-primary to-accent bg-gradient-to-r bg-clip-text text-5xl font-bold text-transparent md:text-6xl">
            Phủi Đê
          </h2>
        </div>

        {/* Subtitle */}
        <p className="text-muted-foreground mx-auto max-w-md text-lg leading-relaxed">
          Nền tảng quản lý đội bóng, tìm trận, và đặt sân cho cộng đồng bóng đá
          phủi Việt Nam
        </p>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 py-4">
          <div className="bg-background/50 border-border/50 rounded-xl border p-3 backdrop-blur-sm">
            <div className="mb-1 text-2xl">🏆</div>
            <div className="text-xs font-medium">Quản lý đội</div>
          </div>
          <div className="bg-background/50 border-border/50 rounded-xl border p-3 backdrop-blur-sm">
            <div className="mb-1 text-2xl">⚡</div>
            <div className="text-xs font-medium">Tìm trận</div>
          </div>
          <div className="bg-background/50 border-border/50 rounded-xl border p-3 backdrop-blur-sm">
            <div className="mb-1 text-2xl">📅</div>
            <div className="text-xs font-medium">Đặt sân</div>
          </div>
        </div>

        {/* CTA Button */}
        <Button
          onClick={onStart}
          size="lg"
          className="h-12 w-full max-w-xs text-base font-semibold shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
        >
          <Sparkles className="mr-2 h-5 w-5" />
          Bắt Đầu Ngay
        </Button>

        {/* Footer note */}
        <p className="text-muted-foreground text-xs">
          Thỏa Sức Đam Mê. Kết Nối Cộng Đồng.
        </p>
      </div>
    </div>
  );
}
