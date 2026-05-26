import React from 'react';
import { Search, BookOpen, MessageCircle, ShieldCheck, CreditCard, UserCheck, LifeBuoy } from 'lucide-react';

const HelpSupport = () => {
  const categories = [
    { icon: <UserCheck />, title: "Getting Started", desc: "Setting up your profile and finding your first job." },
    { icon: <CreditCard />, title: "Payments", desc: "How to withdraw earnings and set up your billing methods." },
    { icon: <ShieldCheck />, title: "Safety & Trust", desc: "Report a scam and learn about our protection programs." },
    { icon: <BookOpen />, title: "Work Resources", desc: "Guides on how to write winning proposals." },
  ];

  return (
    <div className="min-h-screen bg-[#f9fafb] font-sans text-[#001e00]">
      {/* Search Header */}
      <div className="bg-[#001e00] py-24 px-6 text-center text-white">
        <h1 className="text-5xl font-black mb-8">How can we help?</h1>
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-6 top-5 text-gray-400" size={24} />
          <input 
            type="text" 
            placeholder="Search for articles (e.g., 'How to withdraw')" 
            className="w-full pl-16 pr-6 py-5 rounded-full text-black text-lg shadow-2xl focus:ring-4 focus:ring-teal-500 outline-none"
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-12">
        {/* Category Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group">
              <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                {React.cloneElement(cat.icon, { size: 28 })}
              </div>
              <h3 className="text-xl font-bold mb-3">{cat.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{cat.desc}</p>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="my-24 bg-white rounded-[40px] p-12 flex flex-col md:flex-row items-center gap-12 border border-gray-100">
          <div className="flex-1">
            <h2 className="text-3xl font-black mb-4">Still need help?</h2>
            <p className="text-gray-600 text-lg mb-8">Our 24/7 support team is here to assist you with any platform issues or account questions.</p>
            <div className="flex gap-4">
              <button className="bg-teal-600 text-white px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:bg-teal-700">
                <MessageCircle size={20}/> Start Live Chat
              </button>
              <button className="border-2 border-[#001e00] px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:bg-gray-50">
                <LifeBuoy size={20}/> Submit a Ticket
              </button>
            </div>
          </div>
          <div className="hidden md:block w-72 h-72 bg-teal-50 rounded-full relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center text-teal-200">
               <LifeBuoy size={180} strokeWidth={1} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpSupport;
