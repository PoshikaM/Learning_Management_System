// import { NextResponse } from 'next/server';
// import { getToken } from 'next-auth/jwt';

// export async function middleware(req) {
//   const { pathname } = req.nextUrl;

//   // Public routes that don't need protection
//   const publicPaths = ['/', '/signin', '/signup'];
//   const isPublic = publicPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));

//   // Retrieve JWT token from cookies
//   const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
//   const userRole = token?.role || token?.user?.role;

//   // If authenticated and trying to access /signin, redirect to their dashboard
//   if (token && pathname.startsWith('/signin')) {
//     let redirectPath = '/';
//     if (userRole === 'admin') redirectPath = '/admin_dashboard';
//     else if (userRole === 'student') redirectPath = '/student_dashboard';
//     const dashboardUrl = req.nextUrl.clone();
//     dashboardUrl.pathname = redirectPath;
//     return NextResponse.redirect(dashboardUrl);
//   }

//   // Allow access to public paths
//   if (isPublic) {
//     return NextResponse.next();
//   }

//   // Redirect unauthenticated users to signin
//   if (!token) {
//     console.log(`[MIDDLEWARE] No token found. Redirecting to /signin from ${pathname}`);
//     const signinUrl = req.nextUrl.clone();
//     signinUrl.pathname = '/signin';
//     signinUrl.searchParams.set('callbackUrl', pathname);
//     return NextResponse.redirect(signinUrl);
//   }

//   // Block admin-only routes from students
//   if (pathname.startsWith('/admin_dashboard') && userRole !== 'admin') {
//     console.log(`[MIDDLEWARE] User with role ${userRole} tried to access admin dashboard. Redirecting.`);
//     let redirectPath = '/';
//     if (userRole === 'student') redirectPath = '/student-dashboard';
//     const dashboardUrl = req.nextUrl.clone();
//     dashboardUrl.pathname = redirectPath;
//     return NextResponse.redirect(dashboardUrl);
//   }

//   // Block student-only routes from admins
//   if (pathname.startsWith('/student_dashboard') && userRole !== 'student') {
//     console.log(`[MIDDLEWARE] User with role ${userRole} tried to access student dashboard. Redirecting.`);
//     let redirectPath = '/';
//     if (userRole === 'admin') redirectPath = '/admin_dashboard';
//     const dashboardUrl = req.nextUrl.clone();
//     dashboardUrl.pathname = redirectPath;
//     return NextResponse.redirect(dashboardUrl);
//   }

//   // Allow access to valid users
//   return NextResponse.next();
// }

// // Apply to specific routes
// export const config = {
//   matcher: ['/admin_dashboard/:path*', '/student-dashboard/:path*'],
// };


import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Public routes
  const publicPaths = ['/', '/signin', '/signup'];
  const isPublic = publicPaths.some((path) =>
    pathname === path || pathname.startsWith(`${path}/`)
  );

  // Get token from cookies
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const userRole = token?.role || token?.user?.role;

  // Log token and role
//   console.log(`[MIDDLEWARE] Path: ${pathname}`);
//   console.log(`[MIDDLEWARE] Token: ${token ? 'Found' : 'Not Found'}`);
//   if (token) console.log(`[MIDDLEWARE] Role: ${userRole}`);

  // Authenticated user visiting /signin → redirect to dashboard
  if (token && pathname.startsWith('/signin')) {
    const redirectPath = userRole === 'admin'
      ? '/admin_dashboard'
      : '/student-dashboard';

    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = redirectPath;

    console.log(`[MIDDLEWARE] Authenticated. Redirecting /signin → ${redirectPath}`);
    return NextResponse.redirect(redirectUrl);
  }

  // Allow public access
  if (isPublic) {
    return NextResponse.next();
  }

  // Unauthenticated user trying to access protected route
  if (!token) {
    console.log(`[MIDDLEWARE] No token. Redirecting to /signin from ${pathname}`);
    const signinUrl = req.nextUrl.clone();
    signinUrl.pathname = '/signin';
    signinUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signinUrl);
  }

  // Admin route access by non-admin
  if (pathname.startsWith('/admin_dashboard') && userRole !== 'admin') {
    console.log(`[MIDDLEWARE] Student trying to access admin dashboard. Redirecting.`);
    const studentRedirect = req.nextUrl.clone();
    studentRedirect.pathname = '/student-dashboard';
    return NextResponse.redirect(studentRedirect);
  }

  // Student route access by non-student
  if (pathname.startsWith('/student-dashboard') && userRole !== 'student') {
    console.log(`[MIDDLEWARE] Admin trying to access student dashboard. Redirecting.`);
    const adminRedirect = req.nextUrl.clone();
    adminRedirect.pathname = '/admin_dashboard';
    return NextResponse.redirect(adminRedirect);
  }

  // Valid access
  return NextResponse.next();
}

// Protect only the dashboard routes
export const config = {
  matcher: ['/admin_dashboard/:path*', '/student-dashboard/:path*', '/signin'],
};