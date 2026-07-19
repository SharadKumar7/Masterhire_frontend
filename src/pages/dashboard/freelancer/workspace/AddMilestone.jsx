// ─── AddMilestoneModal.jsx ───────────────────────────────────────────────────
// Reusable form modal. Used by the freelancer side to CREATE new milestones
// and EDIT existing ones (only while status === "pending_approval").
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

// ✅ NEW — editingMilestone: pass an existing milestone object to edit it.
// null/undefined = "create" mode.
const AddMilestoneModal = ({ isOpen, onClose, onSubmit, remainingBudget = 0, editingMilestone = null }) => {
  const [formData, setFormData] = useState(EMPTY_FORM);

  const isEditMode = Boolean(editingMilestone);

  // Reset (or prefill, in edit mode) the form every time the modal opens.
  useEffect(() => {
    if (!isOpen) return;
    if (editingMilestone) {
      setFormData({
        title:        editingMilestone.title || "",
        description:  editingMilestone.description || "",
        budget:       editingMilestone.budget ?? "",
        duration:     editingMilestone.duration || "",
        dueDate:      editingMilestone.dueDate
          ? new Date(editingMilestone.dueDate).toISOString().split("T")[0]
          : "",
        deliverables: editingMilestone.deliverables || "",
      });
    } else {
      setFormData(EMPTY_FORM);
    }
  }, [isOpen, editingMilestone]);

  if (!isOpen) return null;

  const enteredBudget = Number(formData.budget) || 0;
  // ✅ In edit mode, remainingBudget passed in from parent should already
  // exclude this milestone's own current amount from the calculation.
  const exceedsLimit = enteredBudget > remainingBudget;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (exceedsLimit) return; // ✅ block submit client-side too
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs bg-black/40 animate-fade-in">

      {/* Modal Container */}
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-gray-100 flex flex-col overflow-hidden max-h-[90vh]">

        {/* Header Section */}
        <div className="p-6 pb-4 border-b border-gray-100 relative">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {isEditMode ? "Edit milestone" : "Add milestone"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-lg hover:bg-gray-50"
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {isEditMode
              ? "You can edit this milestone until the client approves it."
              : "Break down your work into milestones so the client can track progress and pay you as you go."}
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
                className={`w-full text-sm px-4 py-2.5 rounded-xl border outline-hidden transition-all focus:ring-2 placeholder:text-gray-300 ${
                  exceedsLimit
                    ? "border-red-400 focus:border-red-500 focus:ring-red-50"
                    : "border-gray-200 focus:border-teal-500 focus:ring-teal-50/50"
                }`}
              />
              <p className="text-xs text-gray-400 mt-1.5">
                Remaining budget: ₹{remainingBudget.toLocaleString("en-IN")}
              </p>
              {/* ✅ NEW — red alert when the entered amount exceeds what's left of the contract */}
              {exceedsLimit && (
                <div className="mt-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-xs text-red-600 font-medium">
                  ⚠️ This exceeds the remaining contract budget by ₹
                  {(enteredBudget - remainingBudget).toLocaleString("en-IN")}. Reduce the amount or adjust other milestones.
                </div>
              )}
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
              disabled={exceedsLimit}
              className="px-6 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 disabled:bg-gray-300 disabled:cursor-not-allowed font-bold text-white transition-colors shadow-2xs text-sm"
            >
              {isEditMode ? "Save changes" : "Create milestone"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddMilestoneModal;