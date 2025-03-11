import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// 使用 Clerk API 实现中间件
export default clerkMiddleware((auth, request) => {
  // 公开路由列表
  const publicRoutes = ['/', '/sign-in', '/sign-up', '/api/public'];
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname === route || 
    request.nextUrl.pathname.startsWith(`${route}/`)
  );

  // 如果是公开路由，允许访问
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // 检查用户是否已登录
  if (!auth) {
    // 如果未登录，重定向到登录页面
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect_url', request.url);
    return NextResponse.redirect(signInUrl);
  }

  // 用户已登录，允许访问
  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}; 