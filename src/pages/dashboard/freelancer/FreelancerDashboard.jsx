import React from "react";
import { Outlet } from "react-router-dom";
import FreelancerHeader from "../../../components/dashboard/freelancer/FreelancerHeader";
import Footer from "../../../components/dashboard/Footer";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <FreelancerHeader />

      <main className="min-h-[80vh]">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
