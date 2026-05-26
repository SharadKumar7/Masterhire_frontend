import React, { useState } from "react";

const SectionContainer = ({
  title,
  children,
  initiallyOpen = false,
  required = false, // 🔥 NEW PROP
}) => {
  const [isOpen, setIsOpen] = useState(initiallyOpen);

  return (
    <div className="overflow-hidden">
      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isOpen ? "max-h-screen" : "max-h-14"
        }`}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-teal-400/40 p-4 rounded-3xl text-gray-800 hover:text-teal-700 flex justify-between items-center border-b border-gray-200 w-full"
        >
          <h3 className="font-semibold">
            {title}{" "}
            {required && <span className="text-red-500">*</span>} {/* 🔥 STAR */}
          </h3>

          <svg
            className={`w-4 h-4 transition-transform duration-300 ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 8.25l-7.5 7.5-7.5-7.5"
            />
          </svg>
        </button>

        <div id={`section-content-${title}`} className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default SectionContainer;