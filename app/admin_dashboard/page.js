// import DashboardPage from "@/components/pages/dashboard-page";

// const AdminDashboardPage = () => {
//   return <DashboardPage />;
// };

// export default AdminDashboardPage;


import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import DashboardPage from "@/components/pages/dashboard-page";
import { authOptions } from '../api/auth/[...nextauth]/route';

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'admin') {
    redirect('/signin');
  }

  console.log(session.user); // Submission requirement

  return <DashboardPage />;
}