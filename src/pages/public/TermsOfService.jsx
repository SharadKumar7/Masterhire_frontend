import React from 'react';
import { ShieldCheck, Scale, CreditCard, HelpCircle, FileText } from 'lucide-react';

const TermsOfService = () => {
  return (
    <div className="bg-[#fcfcfc] min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight mb-4">Terms of Service</h1>
          <p className="text-slate-500 text-lg">Last Updated: October 2023 • 10 min read</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Sidebar Navigation (Hidden on Mobile) */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-10 h-fit">
            <nav className="space-y-4 border-l-2 border-slate-100 pl-6">
              {['Overview', 'User Accounts', 'Payments', 'Disputes', 'Conduct'].map((item) => (
                <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} 
                   className="block text-sm font-medium text-slate-500 hover:text-teal-600 transition-colors">
                  {item}
                </a>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-9 bg-white shadow-sm border border-slate-100 rounded-3xl p-8 md:p-12">
            
            {/* TL;DR Executive Summary Card */}
            <div className="bg-teal-50 border border-teal-100 rounded-2xl p-6 mb-12 flex gap-4">
              <ShieldCheck className="text-teal-600 shrink-0" size={24} />
              <div>
                <h4 className="font-bold text-teal-900 mb-1">The Quick Version</h4>
                <p className="text-teal-800 text-sm leading-relaxed">
                  MasterHire is a bridge between talent and opportunity. Clients fund projects, Freelancers deliver excellence. We secure the transaction, take a small fee to maintain the platform, and protect both parties from fraud. 
                </p>
              </div>
            </div>

            {/* Content Sections */}
            <section id="overview" className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-slate-100 rounded-lg"><FileText size={20} className="text-slate-600"/></div>
                <h2 className="text-2xl font-bold text-slate-800">1. Marketplace Ecosystem</h2>
              </div>
              <p className="text-slate-600 leading-relaxed">
                MasterHire operates a digital marketplace connecting independent professionals ("Freelancers") and businesses ("Clients"). While we provide the platform, escrow services, and communication tools, the actual "Service Contract" is a direct agreement between the Freelancer and the Client. MasterHire is not an employer or a general agent for any User.
              </p>
            </section>

            <section id="user-accounts" className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-slate-100 rounded-lg"><Scale size={20} className="text-slate-600"/></div>
                <h2 className="text-2xl font-bold text-slate-800">2. User Responsibilities</h2>
              </div>
              <ul className="list-disc pl-5 space-y-3 text-slate-600">
                <li><strong>Identity Verification:</strong> Users must provide accurate, current information. Misrepresentation of skills or location is grounds for immediate suspension.</li>
                <li><strong>Exclusivity:</strong> For 24 months from the start of a relationship on MasterHire, you agree to use our platform for all payments to that user.</li>
              </ul>
            </section>

            <section id="payments" className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-slate-100 rounded-lg"><CreditCard size={20} className="text-slate-600"/></div>
                <h2 className="text-2xl font-bold text-slate-800">3. Financial Terms</h2>
              </div>
              <p className="text-slate-600 mb-4">
                We use a secure Escrow system. Clients fund the milestone, and funds are released only when the work is approved or the auto-release period expires.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-slate-100 rounded-xl bg-slate-50">
                  <span className="text-xs font-bold text-teal-600 uppercase">For Clients</span>
                  <p className="text-sm text-slate-500 mt-1">A 3% processing fee applies to all payments to cover merchant costs.</p>
                </div>
                <div className="p-4 border border-slate-100 rounded-xl bg-slate-50">
                  <span className="text-xs font-bold text-teal-600 uppercase">For Freelancers</span>
                  <p className="text-sm text-slate-500 mt-1">A 10% service fee is deducted from the total contract value.</p>
                </div>
              </div>
            </section>

            <section id="disputes" className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-slate-100 rounded-lg"><HelpCircle size={20} className="text-slate-600"/></div>
                <h2 className="text-2xl font-bold text-slate-800">4. Dispute Resolution</h2>
              </div>
              <p className="text-slate-600 leading-relaxed">
                If a project stalls, our <strong>Neutral Arbitration Team</strong> reviews the work logs, chat history, and deliverables. Our decision is final and aims to protect the integrity of the marketplace while ensuring fair pay for work completed.
              </p>
            </section>

            {/* Footer Contact */}
            <div className="mt-20 pt-10 border-t border-slate-100 text-center">
              <p className="text-slate-400 mb-4">Have questions about these terms?</p>
              <button className="bg-slate-900 text-white px-8 py-3 rounded-full font-medium hover:bg-teal-600 transition-all shadow-lg shadow-slate-200">
                Contact Legal Support
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
