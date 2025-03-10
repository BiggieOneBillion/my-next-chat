// import { auth } from "@/auth"
// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// export async function middleware(request: NextRequest) {
//   const session = await auth();
//   const isAuthenticated = !!session;
  
//   const isLoginPage = request.nextUrl.pathname === "/login";
//   const isRegisterPage = request.nextUrl.pathname === "/register";
//   const isAuthPage = isLoginPage || isRegisterPage;

//   // Redirect authenticated users away from auth pages
//   if (isAuthenticated && isAuthPage) {
//     return NextResponse.redirect(new URL("/chat", request.url));
//   }

//   // Redirect unauthenticated users to login page
//   if (!isAuthenticated && !isAuthPage) {
//     return NextResponse.redirect(new URL("/login", request.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     "/((?!api|_next/static|_next/image|favicon.ico).*)",
//   ],
// };