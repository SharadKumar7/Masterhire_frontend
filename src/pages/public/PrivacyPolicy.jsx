import React from 'react';
import { Eye, Lock, Database, UserCheck, Mail, Bell } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="bg-[#fcfcfc] min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            <Lock size={14} />
            Your Privacy Matters
          </div>
          <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight mb-4">Privacy Policy</h1>
          <p className="text-slate-500 text-lg">Last Updated: April 7, 2026 • 8 min read</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Sticky Sidebar Navigation */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-10 h-fit">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Policy Sections</h3>
            <nav className="space-y-4 border-l-2 border-slate-100 pl-6">
              {[
                { name: 'Data Collection', id: 'collection' },
                { name: 'How We Use Data', id: 'usage' },
                { name: 'Security Measures', id: 'security' },
                { name: 'Your Controls', id: 'controls' }
              ].map((item) => (
                <a key={item.id} href={`#${item.id}`} 
                   className="block text-sm font-medium text-slate-500 hover:text-teal-600 transition-colors">
                  {item.name}
                </a>
              ))}
            </nav>
          </aside>

          {/* Main Content Card */}
          <main className="lg:col-span-9 bg-white shadow-xl shadow-slate-200/50 border border-slate-100 rounded-[2rem] p-8 md:p-14">
            
            {/* Commitment Box */}
            <section id="collection" className="mb-14">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-teal-100 rounded-xl text-teal-700"><Database size={22}/></div>
                <h2 className="text-2xl font-bold text-slate-800">1. Information We Collect</h2>
              </div>
              <p className="text-slate-600 leading-relaxed mb-6">
                To provide a secure freelancing environment, we collect data that identifies you and your professional capabilities:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 border border-slate-50 rounded-2xl bg-slate-50/50">
                  <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <UserCheck size={16} className="text-teal-600"/> Personal Identity
                  </h4>
                  <p className="text-sm text-slate-500">Legal name, tax ID (W-9/W-8BEN), and government-issued ID for verification.</p>
                </div>
                <div className="p-5 border border-slate-50 rounded-2xl bg-slate-50/50">
                  <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <Eye size={16} className="text-teal-600"/> Professional Data
                  </h4>
                  <p className="text-sm text-slate-500">Portfolio links, work history, skill tests, and hourly rate preferences.</p>
                </div>
              </div>
            </section>

            <section id="usage" className="mb-14">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-indigo-100 rounded-xl text-indigo-700"><Bell size={22}/></div>
                <h2 className="text-2xl font-bold text-slate-800">2. How We Use Data</h2>
              </div>
              <div className="space-y-4">
                <div className="flex gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-colors">
                  <div className="h-2 w-2 rounded-full bg-teal-500 mt-2 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-slate-800">AI-Powered Matching</h4>
                    <p className="text-slate-600 text-sm">We process your skills and project history to suggest the most relevant jobs or candidates.</p>
                  </div>
                </div>
                <div className="flex gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-colors">
                  <div className="h-2 w-2 rounded-full bg-teal-500 mt-2 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-slate-800">Financial Security</h4>
                    <p className="text-slate-600 text-sm">Using data to monitor escrow transactions and prevent unauthorized account access.</p>
                  </div>
                </div>
              </div>
            </section>

            <section id="security" className="mb-14">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-amber-100 rounded-xl text-amber-700"><Lock size={22}/></div>
                <h2 className="text-2xl font-bold text-slate-800">3. Security Standards</h2>
              </div>
              <div className="bg-slate-900 text-slate-300 p-8 rounded-3xl relative overflow-hidden">
                <div className="relative z-10">
                  <p className="mb-4 italic font-light text-lg">"We protect your data like it's our own."</p>
                  <p className="text-sm leading-relaxed">
                    MasterHire utilizes <strong>AES-256 bank-level encryption</strong>. Sensitive information like tax IDs and payment tokens are stored in isolated vaults that even our core developers cannot access.
                  </p>
                </div>
                <Lock className="absolute -right-4 -bottom-4 text-white/5" size={120} />
              </div>
            </section>

            <section id="controls" className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-purple-100 rounded-xl text-purple-700"><Mail size={22}/></div>
                <h2 className="text-2xl font-bold text-slate-800">4. Your Data Rights</h2>
              </div>
              <p className="text-slate-600 leading-relaxed mb-6">
                Under GDPR and CCPA, you have the right to access, export, or delete your data at any time. Simply visit your <strong>Account Settings &gt; Data Privacy</strong> to manage your information.
              </p>
            </section>

            {/* Support CTA */}
            <div className="mt-12 p-8 bg-teal-50 rounded-3xl text-center">
              <h3 className="font-bold text-teal-900 mb-2">Privacy Questions?</h3>
              <p className="text-teal-700 text-sm mb-6">Our Data Protection Officer (DPO) is here to help.</p>
              <button className="bg-teal-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-200">
                Email Privacy Team
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
