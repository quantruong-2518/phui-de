import type { Metadata } from 'next';
import { Be_Vietnam_Pro, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/sonner';

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-be-vietnam-pro',
  display: 'swap',
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ['vietnamese', 'latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Phủi Đê - Nền tảng bóng đá phủi',
    template: '%s | Phủi Đê',
  },
  description:
    'Quản lý đội bóng, quản lý sân bãi, kết nối cầu thủ phủi. Nền tảng tổng hợp dành cho cộng đồng bóng đá phủi Việt Nam.',
  keywords: [
    'bóng đá phủi',
    'quản lý đội bóng',
    'quản lý sân bóng',
    'kết nối cầu thủ',
    'phủi đê',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${beVietnamPro.variable} ${jetBrainsMono.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
