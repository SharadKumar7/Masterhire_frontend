import React from 'react';
import { Link } from 'react-router-dom';

const LandingFooter = () => {
  return (
    <footer className="border-t border-white/5" style={{ background: 'linear-gradient(135deg, #060e1e 0%, #0a1628 100%)' }}>
      
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand column */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            <div>
              <h2
                className="text-2xl font-black mb-2"
                style={{ background: 'linear-gradient(135deg, #00d4ff, #00ffaa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
              >
                MasterHire
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                India's own zero-fee freelance marketplace. Real work, real talent, zero platform charges.
              </p>
            </div>

            {/* Social icons */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Follow us</span>
              <div className="flex gap-2">
                {[
                  { label: 'in', bg: 'bg-blue-600' },
                  { label: 'X', bg: 'bg-gray-800 border border-white/10' },
                  { label: 'ig', bg: 'bg-gradient-to-tr from-yellow-400 to-purple-600' },
                  { label: 'f', bg: 'bg-blue-700' },
                ].map((s, i) => (
                  <button key={i}
                    className={`w-8 h-8 ${s.bg} rounded-full flex items-center justify-center text-[11px] font-bold text-white cursor-pointer hover:scale-110 transition-transform`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold px-3 py-2 rounded-xl w-fit">
              🇮🇳 Proudly Made in India
            </div>
          </div>

          {/* About */}
          <div className="flex flex-col gap-4">
            <h3 className="text-white font-bold text-sm uppercase tracking-widest">About</h3>
            <ul className="space-y-3">
              {[
                { label: 'About Us', to: '/about' },
                { label: 'How It Works', to: '/how-it-works' },
                { label: 'Our Impact', to: '/our-impact' },
              ].map((item) => (
                <li key={item.to}>
                  <Link to={item.to}
                    className="text-gray-400 text-sm hover:text-teal-400 transition-colors flex items-center gap-1.5 group">
                    <span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-teal-400 transition-colors" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="flex flex-col gap-4">
            <h3 className="text-white font-bold text-sm uppercase tracking-widest">Support</h3>
            <ul className="space-y-3">
              {[
                { label: 'Help & Support', to: '/help-support' },
                { label: 'Safety & Security', to: '/safety-security' },
                { label: 'Feedback', to: '/feedback' },
                { label: 'Terms of Service', to: '/terms-of-service' },
                { label: 'Privacy Policy', to: '/privacy-policy' },
              ].map((item) => (
                <li key={item.to}>
                  <Link to={item.to}
                    className="text-gray-400 text-sm hover:text-teal-400 transition-colors flex items-center gap-1.5 group">
                    <span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-teal-400 transition-colors" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="flex flex-col gap-4">
            <h3 className="text-white font-bold text-sm uppercase tracking-widest">Newsletter</h3>
            <p className="text-gray-500 text-xs leading-relaxed">
              Get the latest jobs and freelancer updates straight to your inbox.
            </p>
            <div className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-teal-500/50 focus:bg-white/8 transition-all"
              />
              <button
                className="w-full py-2.5 rounded-xl text-xs font-black text-[#0a1628] transition-all hover:opacity-90 hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg, #00d4ff, #00ffaa)', boxShadow: '0 4px 15px rgba(0, 255, 170, 0.2)' }}
              >
                Subscribe →
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-600 text-xs">
            © {new Date().getFullYear()} MasterHire. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
            <span className="text-gray-500 text-xs">Zero platform fees — always</span>
          </div>
        </div>
      </div>

    </footer>
  );
};

export default LandingFooter;