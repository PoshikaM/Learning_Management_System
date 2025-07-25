// app/student-dashboard/layout.js
"use client";

import { SessionProvider } from "next-auth/react";

export default function StudentDashboardLayout({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}
