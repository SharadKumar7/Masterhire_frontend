import React from "react";
import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import {
  User,
  MessageSquareDot,
  Headset,
  CircleUserRound,
  LayoutDashboard,
  Settings,
  LogOut,
} from "lucide-react";
import NotificationBell from "../NotificatioBell";

const Dropdown = ({ label, options, icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-3 py-2 text-gray-800 hover:text-teal-500  focus:outline-none"
      >
        {/* Agar icon hai toh icon dikhao, nahi toh label */}
        {icon ? (
          <div className="h-8 w-8 rounded-lg border-2 border-gray-500 flex items-center justify-center hover:border-teal-500">
            {icon}
          </div>
        ) : (
          <span className="flex">
            {label}

            <svg
              className={`w-5 h-4 mt-1 ml-1 transition-transform ${isOpen ? "rotate-180" : "0"}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className={`absolute  mt-2 w-48 rounded-xl shadow-xl bg-white ring-1 ring-black/5 z-50 overflow-hidden ${icon ? "right-0" : "left-0"}`}
        >
          <div className="py-1">
            {options.map((opt, idx) =>
              opt.action ? (
                <button
                  key={idx}
                  onClick={() => {
                    opt.action();
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-800 hover:text-teal-500 transition-colors"
                >
                  {icon && opt.icon && (
                    <span className="mr-2 inline-block align-middle">
                      {opt.icon}
                    </span>
                  )}
                  {opt.name}
                </button>
              ) : (
                <Link
                  key={idx}
                  to={opt.path}
                  className="block px-4 py-2.5 text-sm text-gray-800 hover:text-teal-500 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {icon && opt.icon && (
                    <span className="mr-2 inline-block align-middle">
                      {opt.icon}
                    </span>
                  )}
                  {opt.name}
                </Link>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const Header = () => {
  const menuData = [
    {
      label: "Find work",
      options: [
        { name: "Find work", path: "filter" },
        { name: "Saved jobs", path: "saved-jobs" },
        { name: "Applied jobs", path: "applied-jobs" },
        { name: "Proposals & offers", path: "proposals-offers" },
      ],
    },
    {
      label: "Deliver work",
      options: [
        { name: "Active contracts", path: "contracts" },
        { name: "Contract history", path: "contract-history" },
      ],
    },
    {
      label: "Reports",
      options: [
        { name: "Transaction summary", path: "transaction-summary" },
        { name: "Project history", path: "project-history" },
      ],
    },
  ];

  const profileOptions = [
    {
      name: "Dashboard",
      path: "",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "Your profile",
      path: "profile",
      icon: <CircleUserRound className="h-5 w-5" />,
    },
    {
      name: "Account settings",
      path: "settings",
      icon: <Settings className="h-5 w-5" />,
    },
    {
      name: "Log out",
      action: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/";
      },
      icon: <LogOut className="h-5 w-5" />,
    },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 ">
            <h1 className="text-3xl font-jaro text-gray-800">MasterHire</h1>
          </div>

          <nav className="hidden md:flex items-center space-x-2 mr-auto ml-6">
            {menuData.map((menu, i) => (
              <Dropdown key={i} label={menu.label} options={menu.options} />
            ))}
          </nav>

          <div className="flex items-center space-x-3">
            <Link
                          to="/help-support"
                          className="relative group p-2 text-gray-500 hover:text-teal-600"
                        >
                          <Headset className="h-6 w-6" />
            
                          <span
                            className="
                  absolute
                  top-full
                  left-1/2
                  -translate-x-1/2
                  mt-1
                  text-xs
                  text-gray-700
                  whitespace-nowrap
                  opacity-0
                  group-hover:opacity-100
                  transition-opacity
                  duration-200
                "
                          >
                            Client Support
                          </span>
                        </Link>
            < NotificationBell />

            {/* Fix: Directly pass profileOptions instead of profileData[0] */}
            <Dropdown
              icon={<User className="h-5 w-5 " />}
              options={profileOptions}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
