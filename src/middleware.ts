import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/', '/login', '/register', '/auth/callback'];
const AUTH_PATHS = ['/login', '/register'];

function isPublic(pathname: string) {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  if (pathname.startsWith('/auth/')) return true;
  if (pathname.startsWith('/_next/')) return true;
  if (pathname.startsWith('/api/')) return true;
  // /admin/* tự gate trong layout (admin login flow tách khỏi user flow phone-based)
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return true;
  return false;
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  // Authenticated user landing on auth pages → bounce to /teams
  if (user && AUTH_PATHS.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/teams';
    url.search = '';
    return NextResponse.redirect(url);
  }

  // Unauthenticated user accessing a protected page → /login
  if (!user && !isPublic(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    // Match all paths except static assets. /api/* MUST be matched so Supabase
    // can refresh the session cookie before route handlers call auth.getUser().
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
