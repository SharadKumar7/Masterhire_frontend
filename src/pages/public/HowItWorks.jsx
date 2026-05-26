import React, { useState } from 'react';
import { Search, FileText, ShieldCheck, CheckCircle2 } from 'lucide-react';

const HowItWorks = () => {
  const [role, setRole] = useState('client');

  const steps = {
    client: [
      { icon: <Search />, title: "Post a Job", desc: "Tell us about your project. We'll match you with top talent instantly." },
      { icon: <FileText />, title: "Hire the Best", desc: "Compare proposals, reviews, and portfolios to find your perfect fit." },
      { icon: <ShieldCheck />, title: "Pay with Peace of Mind", desc: "Only pay for work you approve through our secure escrow system." }
    ],
    freelancer: [
      { icon: <Search />, title: "Find Opportunities", desc: "Browse thousands of jobs that match your specific skill set." },
      { icon: <FileText />, title: "Apply & Win", desc: "Send professional proposals and set your own hourly or fixed rates." },
      { icon: <ShieldCheck />, title: "Get Paid Securely", desc: "Withdraw earnings easily once milestones are approved." }
    ]
  };

  return (
    <div className="bg-[#f9fafb] min-h-screen py-20 px-6">
      <div className="max-w-5xl mx-auto text-center mb-16">
        <h2 className="text-4xl font-extrabold mb-6">How MasterHire Works</h2>
        <div className="inline-flex p-1 bg-gray-200 rounded-full">
          <button 
            onClick={() => setRole('client')}
            className={`px-8 py-2 rounded-full font-bold transition-all ${role === 'client' ? 'bg-white shadow-md' : 'text-gray-500'}`}
          >
            For Clients
          </button>
          <button 
            onClick={() => setRole('freelancer')}
            className={`px-8 py-2 rounded-full font-bold transition-all ${role === 'freelancer' ? 'bg-white shadow-md' : 'text-gray-500'}`}
          >
            For Freelancers
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
        {steps[role].map((step, i) => (
          <div key={i} className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-2 h-full bg-teal-500 transition-all group-hover:w-4"></div>
            <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 mb-6">
              {React.cloneElement(step.icon, { size: 32 })}
            </div>
            <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
            <p className="text-gray-600 leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HowItWorks;
