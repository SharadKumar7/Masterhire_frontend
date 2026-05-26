import React, { useState } from 'react';
import { Send, Star, Smile, Frown, Meh } from 'lucide-react';

const Feedback = () => {
  const [rating, setRating] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-2xl w-full bg-white rounded-[32px] shadow-2xl overflow-hidden border border-gray-100">
        <div className="bg-teal-600 p-12 text-white text-center">
          <h2 className="text-4xl font-black mb-4">Help us improve.</h2>
          <p className="text-teal-50 opacity-90 text-lg">Your feedback helps shape the future of MasterHire.</p>
        </div>

        <form className="p-12 space-y-8">
          {/* Sentiment Selection */}
          <div className="space-y-4 text-center">
            <label className="text-sm font-bold uppercase tracking-widest text-gray-400">How is your experience?</label>
            <div className="flex justify-center gap-8">
              {[
                { icon: <Frown />, label: "Poor", val: 1 },
                { icon: <Meh />, label: "Okay", val: 2 },
                { icon: <Smile />, label: "Great", val: 3 }
              ].map((item) => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => setRating(item.val)}
                  className={`flex flex-col items-center gap-2 transition-all ${rating === item.val ? 'text-teal-600 scale-125' : 'text-gray-300 hover:text-gray-500'}`}
                >
                  {React.cloneElement(item.icon, { size: 48, strokeWidth: 1.5 })}
                  <span className="text-xs font-bold">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Area */}
          <div className="space-y-4">
            <label className="block text-sm font-bold text-gray-700">Tell us more</label>
            <select className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 appearance-none">
              <option>General Platform</option>
              <option>Payment Issue</option>
              <option>Search & Matching</option>
              <option>Profile Settings</option>
              <option>Other</option>
            </select>
            <textarea 
              rows="5"
              className="w-full p-6 bg-gray-50 border border-gray-200 rounded-3xl outline-none focus:ring-2 focus:ring-teal-500 placeholder-gray-400"
              placeholder="What specifically can we do better? Be as detailed as you like..."
            ></textarea>
          </div>

          <button 
            type="submit" 
            className="w-full bg-[#001e00] text-white py-5 rounded-full font-black text-lg flex items-center justify-center gap-3 hover:bg-gray-800 transition-all shadow-lg"
          >
            Submit Feedback <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Feedback;
