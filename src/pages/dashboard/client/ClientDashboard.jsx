import React from "react";
import { Outlet } from "react-router-dom";
import ClientHeader from "../../../components/dashboard/client/ClientHeader";
import Footer from "../../../components/dashboard/Footer";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <ClientHeader />

      <main className="min-h-[80vh]">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
