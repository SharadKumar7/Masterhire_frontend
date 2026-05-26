import React from 'react';
import { MoreVertical } from 'lucide-react'; // Using lucide-react for the ellipsis icon
const apiUrl = import.meta.env.VITE_API_URL;

const hiredTalents = [
  {
    id: 1,
    jobTitle: "Looker Studio Expert for Ad Campaign Dashboard + Reusable Templates",
    name: "Bijoy Pantu",
    expertise: "Laravel Expert | PHP Expert | Shopify Expert | Backend Developer | React.js, Node.js",
    location: "Howrah, West Bengal",
    img: "https://placeholder.com"
  },
  {
    id: 2,
    jobTitle: "Need a data analyst to extract, clean and analyze my business data for decision making",
    name: "Bijoy Pantu",
    expertise: "Laravel Expert | PHP Expert | Shopify Expert | Backend Developer | React.js, Node.js",
    location: "Howrah, West Bengal",
    img: "https://placeholder.com"
  }
];

const HiredTalentsList = () => {
  const handleCardClick = (id) => {
    console.log(`Opening talent details for ID: ${id}`);
  };

  const handleMenuClick = (e, id) => {
    e.stopPropagation(); // Prevents the card click from firing
    console.log(`Opening menu for talent ID: ${id}`);
  };

  return (
    <div className="p-6 bg-white max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Previously hired talents</h1>
      
      <div className="flex flex-col gap-4">
        {hiredTalents.map((talent) => (
          <div 
            key={talent.id}
            onClick={() => handleCardClick(talent.id)}
            className="group relative flex flex-col border border-gray-200 rounded-2xl p-5 hover:border-teal-500 hover:shadow-sm transition-all cursor-pointer bg-white"
          >
            {/* Header: Job Title and Menu */}
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-medium text-gray-800">
                <span className="text-gray-500">Job title:</span> {talent.jobTitle}
              </p>
              <button 
                onClick={(e) => handleMenuClick(e, talent.id)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <MoreVertical size={20} className="text-gray-600" />
              </button>
            </div>

            {/* Profile Section */}
            <div className="flex items-center gap-4">
              <img 
                src={talent.img} 
                alt={talent.name} 
                className="w-16 h-16 rounded-full object-cover border border-gray-100" 
              />
              <div className="flex flex-col">
                <h2 className="text-sm font-semibold text-gray-900">{talent.name}</h2>
                <p className="text-xs font-medium text-gray-800 mt-0.5">
                  {talent.expertise}
                </p>
                <p className="text-[11px] text-gray-400 mt-1">
                  {talent.location}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HiredTalentsList;
