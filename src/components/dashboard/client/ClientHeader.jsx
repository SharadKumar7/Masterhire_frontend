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
  Menu,
  X,
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
        className="flex items-center gap-1 px-3 py-2 text-gray-800 hover:text-teal-500 focus:outline-none"
      >
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
          className={`absolute mt-2 w-48 rounded-xl shadow-xl bg-white ring-1 ring-black/5 z-50 overflow-hidden ${icon ? "right-0" : "left-0"}`}
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
                    <span className="mr-2 inline-block align-middle">{opt.icon}</span>
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
                    <span className="mr-2 inline-block align-middle">{opt.icon}</span>
                  )}
                  {opt.name}
                </Link>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const Header = () => {
  // ✅ SIRF YEH ADD HUA — mobile menu open/close state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuData = [
    {
      label: "Hire freelancers",
      options: [
        { name: "Post a job", path: "post-job" },
        { name: "Search freelancers", path: "filter" },
        { name: "Talents you've hired", path: "hired-talents" },
        { name: "Saved profiles", path: "saved-profiles" },
      ],
    },
    {
      label: "Manage work",
      options: [
        { name: "Your contracts", path: "contracts" },
        { name: "Proposals & bids", path: "proposals-bids" },
      ],
    },
    {
      label: "Reports",
      options: [
        { name: "Transaction summary", path: "transactions" },
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
          <div className="flex-shrink-0">
            <h1 className="text-3xl font-jaro text-gray-800">MasterHire</h1>
          </div>

          {/* Desktop Nav — hidden on mobile */}
          <nav className="hidden md:flex items-center space-x-2 mr-auto ml-6">
            {menuData.map((menu, i) => (
              <Dropdown key={i} label={menu.label} options={menu.options} />
            ))}
          </nav>

          {/* Right icons */}
          <div className="flex items-center space-x-3">
            {/* Help — desktop only */}
            <Link
              to="/help-support"
              className="relative group p-2 text-gray-500 hover:text-teal-600 hidden md:block"
            >
              <Headset className="h-6 w-6" />
              <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-xs text-gray-700 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                Client Support
              </span>
            </Link>

            <NotificationBell />

            {/* Profile dropdown */}
            <Dropdown
              icon={<User className="h-5 w-5" />}
              options={profileOptions}
            />

            {/* ✅ Hamburger — mobile only */}
            <button
              className="md:hidden p-2 text-gray-600 hover:text-teal-500 focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Mobile Menu — sirf mobile pe dikhega */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pb-4">
          {/* Nav dropdowns */}
          <div className="flex flex-col pt-2 space-y-1">
            {menuData.map((menu, i) => (
              <Dropdown key={i} label={menu.label} options={menu.options} />
            ))}
          </div>

          {/* Help link */}
          <div className="border-t border-gray-100 mt-3 pt-3">
            <Link
              to="/help-support"
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-teal-500"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Headset className="h-5 w-5" />
              Client Support
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;