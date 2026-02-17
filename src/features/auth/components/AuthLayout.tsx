import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left: Form */}
      <div className="bg-background flex items-center justify-center p-8">
        <div className="animate-in fade-in slide-in-from-left-8 w-full max-w-md space-y-8 duration-500">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
          </div>
          {children}
        </div>
      </div>

      {/* Right: Hero Image */}
      <div className="relative hidden bg-zinc-900 lg:block">
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-zinc-900 to-transparent" />
        <img
          src="https://images.unsplash.com/photo-1579952363873-27f3bde9be51?q=80&w=2670&auto=format&fit=crop"
          alt="Football Match"
          className="absolute inset-0 h-full w-full object-cover grayscale transition duration-700 hover:grayscale-0"
        />
        <div className="absolute bottom-10 left-10 z-20 space-y-2 text-white">
          <div className="text-4xl font-bold">Phui De Platform</div>
          <p className="text-lg text-zinc-300">
            Quản lý đội bóng chưa bao giờ dễ dàng như thế.
          </p>
        </div>
      </div>
    </div>
  );
}
