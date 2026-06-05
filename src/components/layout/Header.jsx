import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const FIND_TALENT_OPTIONS = [
  {
    icon: "🧑‍💻",
    title: "Browse Freelancers",
    desc: "Explore 10,000+ verified profiles",
  },
  {
    icon: "🏆",
    title: "Top Rated Talent",
    desc: "Handpicked experts in every field",
  },
  {
    icon: "⚡",
    title: "Available Now",
    desc: "Freelancers ready to start today",
  },
  {
    icon: "🎯",
    title: "By Category",
    desc: "Design, Dev, Writing & more",
  },
];

const FIND_WORK_OPTIONS = [
  {
    icon: "💼",
    title: "Browse Jobs",
    desc: "Thousands of live projects",
  },
  {
    icon: "🔥",
    title: "Latest Projects",
    desc: "Freshly posted opportunities",
  },
  {
    icon: "💰",
    title: "High Budget Jobs",
    desc: "Premium projects worth your skill",
  },
  {
    icon: "🌐",
    title: "Remote Work",
    desc: "Work from anywhere in India",
  },
];

// ─── Dropdown ─────────────────────────────────────────────────────────────────
const NavDropdown = ({ label, options, onItemClick }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg transition-all duration-200 whitespace-nowrap ${
          open
            ? 'text-teal-400 bg-teal-500/10'
            : 'text-gray-300 hover:text-white hover:bg-white/5'
        }`}
      >
        {label}
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180 text-teal-400' : ''}`}
          fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-64 rounded-2xl border border-white/10 shadow-2xl overflow-hidden z-50"
          style={{ background: 'linear-gradient(135deg, #0f1e3a 0%, #1a2c4e 100%)' }}>

          {/* Top accent line */}
          <div className="h-[2px] w-full"
            style={{ background: 'linear-gradient(90deg, #00d4ff, #00ffaa)' }} />

          <div className="p-2">
            {options.map((opt, i) => (
              <button
                key={i}
                onClick={() => { onItemClick(); setOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all group text-left"
              >
                <div className="w-9 h-9 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 group-hover:border-teal-500/30 group-hover:bg-teal-500/10 transition-all">
                  {opt.icon}
                </div>
                <div>
                  <p className="text-white text-xs font-bold group-hover:text-teal-300 transition-colors">
                    {opt.title}
                  </p>
                  <p className="text-gray-500 text-[11px] mt-0.5">{opt.desc}</p>
                </div>
                <svg className="w-3.5 h-3.5 text-gray-600 group-hover:text-teal-400 ml-auto flex-shrink-0 transition-colors"
                  fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="px-3 pb-3">
            <button
              onClick={() => { onItemClick(); setOpen(false); }}
              className="w-full py-2 rounded-xl text-xs font-bold text-[#0a1628] transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #00d4ff, #00ffaa)' }}
            >
              View All →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main Nav ─────────────────────────────────────────────────────────────────
const MasterHireNav = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const goToLogin = () => navigate('/login');

  return (
    <>
      <nav
        className="sticky top-0 z-50 border-b border-white/5"
        style={{
          background: 'rgba(10, 22, 40, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link
              to="/"
              className="text-5xl font-jaro  whitespace-nowrap tracking-tight flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #00d4ff, #00ffaa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              MasterHire
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
              <NavDropdown
                label="Find Talent"
                options={FIND_TALENT_OPTIONS}
                onItemClick={goToLogin}
              />
              <NavDropdown
                label="Find Work"
                options={FIND_WORK_OPTIONS}
                onItemClick={goToLogin}
              />
              <Link
                to="/about"
                className="text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 px-3 py-2 rounded-lg transition-all whitespace-nowrap"
              >
                About Us
              </Link>

              {/* Divider */}
              <div className="w-px h-4 bg-white/10 mx-2" />

              <div className="flex items-center gap-1.5 bg-teal-500/10 border border-teal-500/20 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
                <span className="text-teal-400 text-[11px] font-bold">India's Talent Hub</span>
              </div>
            </div>

            {/* Right buttons */}
            <div className="hidden md:flex items-center gap-2 flex-shrink-0">
              <Link
                to="/login"
                className="text-sm font-semibold text-gray-300 hover:text-white px-4 py-2 rounded-lg hover:bg-white/5 transition-all whitespace-nowrap"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="text-sm font-black text-[#0a1628] px-5 py-2 rounded-xl transition-all hover:-translate-y-0.5 whitespace-nowrap"
                style={{
                  background: 'linear-gradient(135deg, #00d4ff, #00ffaa)',
                  boxShadow: '0 4px 15px rgba(0, 255, 170, 0.25)',
                }}
              >
                Sign Up Free
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-all"
            >
              {mobileOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          className="md:hidden fixed top-16 left-0 right-0 z-40 border-b border-white/10 shadow-2xl"
          style={{ background: 'linear-gradient(135deg, #0a1628 0%, #1a2744 100%)' }}
        >
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">

            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 pt-1 pb-2">Find Talent</p>
            {FIND_TALENT_OPTIONS.map((opt, i) => (
              <button key={i} onClick={() => { goToLogin(); setMobileOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all text-left">
                <span className="text-lg">{opt.icon}</span>
                <div>
                  <p className="text-white text-xs font-bold">{opt.title}</p>
                  <p className="text-gray-500 text-[11px]">{opt.desc}</p>
                </div>
              </button>
            ))}

            <div className="h-px bg-white/5 my-2" />

            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 pt-1 pb-2">Find Work</p>
            {FIND_WORK_OPTIONS.map((opt, i) => (
              <button key={i} onClick={() => { goToLogin(); setMobileOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all text-left">
                <span className="text-lg">{opt.icon}</span>
                <div>
                  <p className="text-white text-xs font-bold">{opt.title}</p>
                  <p className="text-gray-500 text-[11px]">{opt.desc}</p>
                </div>
              </button>
            ))}

            <div className="h-px bg-white/5 my-2" />

            <Link to="/about" onClick={() => setMobileOpen(false)}
              className="block px-3 py-2.5 text-sm font-medium text-gray-300 hover:text-white rounded-xl hover:bg-white/5 transition-all">
              About Us
            </Link>

            <div className="flex gap-2 pt-2 pb-1">
              <Link to="/login" onClick={() => setMobileOpen(false)}
                className="flex-1 text-center py-2.5 text-sm font-semibold text-gray-300 border border-white/10 rounded-xl hover:bg-white/5 transition-all">
                Log In
              </Link>
              <Link to="/signup" onClick={() => setMobileOpen(false)}
                className="flex-1 text-center py-2.5 text-sm font-black text-[#0a1628] rounded-xl"
                style={{ background: 'linear-gradient(135deg, #00d4ff, #00ffaa)' }}>
                Sign Up Free
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MasterHireNav;