import React, { useState } from 'react';
import { Heart, Star } from 'lucide-react'; // Example icons from lucide-react
const apiUrl = import.meta.env.VITE_API_URL;

const profiles = [
  { id: 1, name: "Roronoa Zoro", role: "Certified SEO content writer", success: "95%", jobs: 41, rating: 5, img: "https://placeholder.com" },
  { id: 2, name: "Shanks Figerland", role: "Laravel Expert | PHP Expert | Shopify Expert", success: "95%", jobs: 41, rating: 5, img: "https://placeholder.com" },
  { id: 3, name: "Tom Cruise", role: "Data analyst, Excel, SQL, PowerBI, Tableau certified", success: "95%", jobs: 41, rating: 5, img: "https://placeholder.com" },
  { id: 4, name: "Kriti Sanon", role: "Certified SEO content writer", success: "95%", jobs: 41, rating: 4, img: "https://placeholder.com" },
  // Duplicate for the second row as seen in the image
];

const SavedProfiles = () => {
  const [saved, setSaved] = useState({});

  const toggleHeart = (e, id) => {
    e.stopPropagation(); // Prevents clicking heart from triggering the card click
    setSaved(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleProfileClick = (id) => {
    console.log(`Navigating to profile ${id}`);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-8 ml-4">Saved profiles</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {profiles.map((profile) => (
          <div 
            key={profile.id}
            onClick={() => handleProfileClick(profile.id)}
            className="relative bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
          >
            {/* Heart Button */}
            <button 
              onClick={(e) => toggleHeart(e, profile.id)}
              className="absolute top-4 right-4 z-10 p-1 rounded-full transition-colors"
            >
              <Heart 
                size={20} 
                className={saved[profile.id] ? "fill-teal-500 stroke-teal-500" : "stroke-teal-500"} 
              />
            </button>

            {/* Profile Info */}
            <div className="flex items-start gap-4 mb-4">
              <img src={profile.img} alt={profile.name} className="w-16 h-16 rounded-full object-cover" />
              <div className="flex flex-col">
                <h2 className="font-semibold text-gray-800">{profile.name}</h2>
                <div className="flex gap-0.5 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} className={i < profile.rating ? "fill-orange-400 stroke-orange-400" : "stroke-gray-300"} />
                  ))}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex justify-between text-center border-t border-gray-100 pt-4 mb-4">
              <div>
                <p className="text-sm font-bold">{profile.success}</p>
                <p className="text-[10px] text-gray-500 uppercase">Job success</p>
              </div>
              <div>
                <p className="text-sm font-bold">{profile.jobs}</p>
                <p className="text-[10px] text-gray-500 uppercase">Total jobs</p>
              </div>
            </div>

            {/* Role */}
            <p className="text-sm text-gray-600 text-center mb-6 line-clamp-2 h-10">
              {profile.role}
            </p>

            {/* View Profile Button */}
            <button 
              className="w-full py-2 border border-teal-600 text-teal-600 rounded-lg font-medium hover:bg-teal-50 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleProfileClick(profile.id);
              }}
            >
              View profile
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedProfiles;
