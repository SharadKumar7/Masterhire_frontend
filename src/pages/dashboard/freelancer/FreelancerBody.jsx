
import axios from 'axios';
import React, { useEffect, useState } from "react";
import JobOverviewSection from '../../../components/dashboard/freelancer/JobOverviewSection';
import JobCarousel from '../../../components/dashboard/freelancer/JobCarousel';    // Reusable component
import ResourceCard from '../../../components/dashboard/ResourceCard'; // Reusable component
const apiUrl = import.meta.env.VITE_API_URL;


function MainBody() {
  const [name, setName] = useState("");
    const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchUserName = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setName("User");
        setLoading(false);
        return;
      }

      try {
        // Aapka getMe endpoint (URL apne backend ke hisaab se change karein)
        const response = await axios.get(`${apiUrl}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}` // Token bhejna zaroori hai
          }
        });

        // Backend se milne wala fullName set karein
        if (response.data && response.data.fullName) {
          setName(response.data.fullName);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setName("User"); // Error aane par default name
      } finally {
        setLoading(false);
      }
    };

    fetchUserName();
  }, []);

  return (
    <div>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="flex flex-col gap-10">
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome Back, {name}
          </h1>
          <JobOverviewSection />
          <JobCarousel />
          <ResourceCard path="/freelancer/dashboard/resourceshelp" />

        </div>

      </main>
    </div>
  )
}

export default MainBody
