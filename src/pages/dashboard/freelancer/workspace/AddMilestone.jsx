// ─── AddMilestoneModal.jsx ───────────────────────────────────────────────────
// Reusable form modal. Now used ONLY by the freelancer side
// (FreelancerMilestonesSection.jsx) since freelancer proposes milestones.
import React, { useState, useEffect } from "react";
import { X, Calendar } from "lucide-react";

const EMPTY_FORM = {
  title: "",
  description: "",
  budget: "",
  duration: "",
  dueDate: "",
  deliverables: "",
};

const AddMilestoneModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState(EMPTY_FORM);

  // ✅ FIX: reset the form every time the modal is opened, so old values from a
  // previously created milestone don't linger the next time it's opened.
  useEffect(() => {
    if (isOpen) setFormData(EMPTY_FORM);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs bg-black/40 animate-fade-in">
      
      {/* Modal Container: Set to Half-Screen Max Width */}
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-gray-100 flex flex-col overflow-hidden max-h-[90vh]">
        
        {/* Header Section */}
        <div className="p-6 pb-4 border-b border-gray-100 relative">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Add milestone</h2>
            <button 
              type="button" 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-lg hover:bg-gray-50"
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Break down your work into milestones so the client can track progress and pay you as you go.
          </p>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleFormSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          
          {/* Milestone Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Milestone title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. UI/UX designing"
              className="w-full text-sm px-4 py-2.5 rounded-xl border border-gray-200 outline-hidden transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-50/50 placeholder:text-gray-300"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-0.5">
              Description
            </label>
            <p className="text-xs text-gray-400 mb-1.5">Describe what needs to be done in this milestone.</p>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter milestone description, tasks, and expected work..."
              className="w-full text-sm px-4 py-2.5 rounded-xl border border-gray-200 outline-hidden transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-50/50 placeholder:text-gray-300 resize-none"
            />
          </div>

          {/* Budget & Duration Stacked Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Budget */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Budget (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="budget"
                required
                value={formData.budget}
                onChange={handleChange}
                placeholder="e.g. 2000"
                className="w-full text-sm px-4 py-2.5 rounded-xl border border-gray-200 outline-hidden transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-50/50 placeholder:text-gray-300"
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Duration <span className="text-red-500">*</span>
              </label>
              <select
                name="duration"
                required
                value={formData.duration}
                onChange={handleChange}
                className="w-full text-sm px-4 py-2.5 rounded-xl border border-gray-200 outline-hidden transition-all bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-50/50 text-gray-700"
              >
                <option value="" disabled>Select duration</option>
                <option value="1_week">1 Week</option>
                <option value="2_weeks">2 Weeks</option>
                <option value="3_weeks">3 Weeks</option>
                <option value="4_weeks">4 Weeks</option>
              </select>
            </div>
          </div>

          {/* Due date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Due date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                name="dueDate"
                required
                min={today}
                value={formData.dueDate}
                onChange={handleChange}
                className="w-full text-sm pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 outline-hidden transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-50/50 text-gray-700"
              />
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
                <Calendar size={16} />
              </div>
            </div>
          </div>

          {/* Deliverables */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-0.5">
              Deliverables / What will you submit? <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-1.5">Mention what files, documents, or outputs the client should expect.</p>
            <textarea
              name="deliverables"
              required
              rows={3}
              value={formData.deliverables}
              onChange={handleChange}
              placeholder="e.g. Figma file, Source code, Documentation, Report, etc."
              className="w-full text-sm px-4 py-2.5 rounded-xl border border-gray-200 outline-hidden transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-50/50 placeholder:text-gray-300 resize-none"
            />
          </div>

          {/* Sticky Actions Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-6 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-200 font-bold text-gray-700 hover:bg-gray-50 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 font-bold text-white transition-colors shadow-2xs text-sm"
            >
              Create milestone
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddMilestoneModal;