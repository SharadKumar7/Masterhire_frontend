import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-black text-white max-w-6xl mx-auto py-12 px-6 md:px-16 rounded-t-[30px]">
      {/* Changed gap-8 to gap-4 for tighter columns */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Brand */}
        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-bold font-jaro">MasterHire</h2>
          <ul className="space-y-1 text-sm text-gray-400">
            <li><Link to='/terms-of-service' className="hover:text-white transition">Terms Of Services</Link></li>
            <li><Link to='/privacy-policy' className="hover:text-white transition">Privacy Policy</Link></li>
          </ul>
        </div>

        {/* About */}
        <div className="flex flex-col gap-3">
          <h3 className="font-semibold text-lg">About</h3>
          <ul className="space-y-1 text-sm text-gray-400">
            <li><Link to='/about' className="hover:text-white transition">About Us</Link></li>
            <li><Link to='/how-it-works' className="hover:text-white transition">How It Works</Link></li>
            <li><Link to='/our-impact' className="hover:text-white transition">Our Impact</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div className="flex flex-col gap-3">
          <h3 className="font-semibold text-lg">Support</h3>
          <ul className="space-y-1 text-sm text-gray-400">
            <li><Link to='/help-support' className="hover:text-white transition">Help & Support</Link></li>
            <li><Link to='/safety-security' className="hover:text-white transition">Safety & Security</Link></li>
            <li><Link to='/feedback' className="hover:text-white transition">Feedback</Link></li>
          </ul>
        </div>

        {/* Newsletter - No extra margin/padding to keep it close */}
        <div className="flex flex-col gap-5">
          <div>
            <h3 className="font-semibold text-lg mb-2">Join Our Newsletter</h3>
            <div className="flex">
              <input 
                type="email" 
                placeholder="Email" 
                className="bg-[#1a1a1a] text-xs border-none rounded-l-lg px-3 py-2 w-full focus:ring-1 focus:ring-teal-500 outline-none"
              />
              <button className="bg-teal-600 hover:bg-teal-500 text-white px-3 py-2 rounded-r-lg text-xs font-medium transition">
                Submit
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Follow us:</span>
            <div className="flex gap-2">
              <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-[10px] cursor-pointer hover:scale-110 transition">in</div>
              <div className="w-7 h-7 bg-gray-800 rounded-full flex items-center justify-center text-[10px] cursor-pointer hover:scale-110 transition">X</div>
              <div className="w-7 h-7 bg-gradient-to-tr from-yellow-400 to-purple-600 rounded-full flex items-center justify-center text-[10px] cursor-pointer hover:scale-110 transition">ig</div>
              <div className="w-7 h-7 bg-blue-700 rounded-full flex items-center justify-center text-[10px] cursor-pointer hover:scale-110 transition">f</div>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
