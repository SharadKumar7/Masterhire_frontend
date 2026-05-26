import React from 'react';
import { ShieldCheck, Lock, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

const SafetySecurity = () => {
  const securityFeatures = [
    {
      icon: <ShieldCheck size={24} className="text-teal-600" />,
      title: "Payment Protection",
      desc: "All payments are securely processed through MasterHire, ensuring your funds are protected until work is completed."
    },
    {
      icon: <Lock size={24} className="text-teal-600" />,
      title: "Data Encryption",
      desc: "We use industry-standard encryption to safeguard your personal and financial information from unauthorized access."
    },
    {
      icon: <EyeOff size={24} className="text-teal-600" />,
      title: "Privacy Controls",
      desc: "You have full control over your profile visibility and can choose what information to share with potential clients or freelancers."
    }
  ];

  return (
    <div className="min-h-screen bg-white text-[#001e00]">
      {/* Banner */}
      <div className="bg-[#001e00] text-white py-20 px-6 text-center">
        <h1 className="text-5xl font-black mb-6">Trust & Safety at MasterHire</h1>
        <p className="text-gray-300 max-w-2xl mx-auto text-xl">We build the tools so you can work with total peace of mind.</p>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {securityFeatures.map((feature, i) => (
            <div key={i} className="p-8 rounded-2xl border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-teal-50 rounded-full flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Warning Section */}
        <div className="bg-orange-50 border border-orange-100 rounded-3xl p-10 flex flex-col md:flex-row items-center gap-8">
          <div className="bg-orange-100 p-4 rounded-full">
            <AlertCircle size={48} className="text-orange-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">Keep your business on MasterHire</h2>
            <p className="text-gray-700">To protect your payments and personal information, always communicate and pay through the MasterHire platform. Taking work off-platform is a violation of our Terms and removes your payment protection.</p>
          </div>
          <button className="bg-[#001e00] text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition-colors">
            Report a Scam
          </button>
        </div>

        {/* Badges Section */}
        <div className="mt-20 text-center">
          <h3 className="text-gray-500 font-bold uppercase tracking-widest text-sm mb-8">Verified Standards</h3>
          <div className="flex flex-wrap justify-center gap-12 opacity-60">
            <div className="flex items-center gap-2 font-bold"><CheckCircle size={20}/> SOC2 COMPLIANT</div>
            <div className="flex items-center gap-2 font-bold"><CheckCircle size={20}/> PCI-DSS LEVEL 1</div>
            <div className="flex items-center gap-2 font-bold"><CheckCircle size={20}/> GDPR READY</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafetySecurity;
