import React from 'react';
import { Heart, Globe2, Zap, GraduationCap } from 'lucide-react';

const OurImpact = () => {
  const impacts = [
    {
      icon: <Heart />,
      title: "Empowering Communities",
      desc: "We connect freelancers with clients, creating job opportunities and fostering economic growth.",
      color: "bg-teal-100 text-teal-600"
    },
    {
      icon: <Globe2 />,
      title: "Global Reach",
      desc: "Our platform enables businesses to tap into a diverse talent pool from around the world.",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: <Zap />,
      title: "Driving Innovation",
      desc: "By supporting freelancers, we promote creativity and innovation across industries.",
      color: "bg-yellow-100 text-yellow-600"
    },
    {
      icon: <GraduationCap />,
      title: "Skills Development",
      desc: "We provide resources and training to help freelancers enhance their skills and advance their careers.",
      color: "bg-purple-100 text-purple-600"
    }
  ];

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex flex-col md:flex-row gap-20 items-center mb-24">
          <div className="flex-1">
            <h4 className="text-teal-600 font-bold tracking-widest uppercase mb-4 text-sm">Mission First</h4>
            <h2 className="text-5xl font-black mb-8 leading-tight">MasterHire’s impact on the world.</h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              We believe work is more than just a paycheck. It's about dignity, growth, and community. We are building a platform that puts human potential above geographic location.
            </p>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-4">
            <div className="bg-teal-600 h-64 rounded-3xl flex items-end p-6 text-white font-bold text-2xl shadow-lg">90% Remote Adoption</div>
            <div className="bg-gray-900 h-64 mt-12 rounded-3xl flex items-end p-6 text-white font-bold text-2xl shadow-lg">$500M Global Payouts</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {impacts.map((item, i) => (
            <div key={i} className="p-8 border border-gray-100 rounded-3xl hover:bg-gray-50 transition-colors">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${item.color}`}>
                {React.cloneElement(item.icon, { size: 28 })}
              </div>
              <h3 className="text-xl font-bold mb-3">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OurImpact;
