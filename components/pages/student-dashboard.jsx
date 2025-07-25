// import React from 'react';
// import MainLayout from '../layout/main-layout';
// import Sidebar from '../layout/sidebar';
// import Navbar from '../layout/navbar';
// import Card from '../global/card';

// const StudentDashboardPage = () => (
//   <MainLayout sidebar={<Sidebar role="student" />} navbar={<Navbar />}>
//     <h1 className="text-3xl font-bold mb-6 text-black">Student Dashboard</h1>
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//       <Card>
//         <h2 className="text-xl text-black font-semibold mb-2">Welcome!</h2>
//         <p className='text-black'>This is your student dashboard. Here you can find your enrolled courses, grades, and profile information.</p>
//       </Card>
//     </div>
//   </MainLayout>
// );

// export default StudentDashboardPage;


"use client";
import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import MainLayout from '../layout/main-layout';
import Sidebar from '../layout/sidebar';
import Navbar from '../layout/navbar';
import Card from '../global/card';

const StudentDashboardPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user?.role !== "student") {
      router.replace("/signin");
    }
  }, [session, status, router]);

  console.log(session?.user); // Submission requirement

  if (status === "loading" || !session || session.user?.role !== "student") {
    return <div className="text-center mt-10 text-black">Loading...</div>;
  }

  return (
    <MainLayout sidebar={<Sidebar role="student" />} navbar={<Navbar />}>
      <h1 className="text-3xl font-bold mb-6 text-black">Student Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl text-black font-semibold mb-2">Welcome!</h2>
          <p className='text-black'>This is your student dashboard. Here you can find your enrolled courses, grades, and profile information.</p>
        </Card>
      </div>
    </MainLayout>
  );
};

export default StudentDashboardPage;