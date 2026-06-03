import React, { useState } from "react";
import { Heart, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL;  

const ProfileCard = ({ profile, type = "topFreelancer" }) => {
  const navigate = useNavigate();

  const [saved, setSaved] = useState(profile?.isSaved || false);
  const [loading, setLoading] = useState(false);

  // =========================
  // Save / Unsave Profile
  // =========================
  const handleSaveProfile = async (e) => {
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    const method = saved ? "DELETE" : "POST";
    try {
      const res = await fetch(`${apiUrl}/api/saved-profiles/${profile._id}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.ok) setSaved((prev) => !prev);
    } catch (err) {
      console.error("Save toggle failed", err);
    } finally {
      setLoading(false);
    }
  };
  // =========================
  // Button Navigation
  // =========================
  const handleAction = (e) => {
    e.stopPropagation();

    navigate(`/client/dashboard/freelancer-profile/${profile._id}`);
  };

  // =========================
  // Default Rating
  // =========================
  const rating = profile?.rating || 5;

  return (
    <div
      className="
        relative
        w-[340px]
        min-h-[380px]
        bg-white
        rounded-2xl
        border
        border-gray-200
        shadow-sm
        hover:shadow-md
        transition-all
        duration-300
        p-5
        flex
        flex-col
        justify-between
      "
    >
      {/* =========================
          Heart Save Button
      ========================= */}
     <button
  onClick={handleSaveProfile}
  className="
    absolute
    top-4
    right-4
    bg-transparent
    border-none
    p-0
  "
>
  <Heart
    size={24}
    className={
      saved
        ? "text-teal-500 fill-teal-500"
        : "text-teal-500 fill-transparent"
    }
  />
</button>

      {/* =========================
          Top Profile
      ========================= */}
      <div>
        <div className="flex items-center mb-5">
          <img
            src={profile.image}
            alt={profile.name}
            className="
              w-16
              h-16
              rounded-full
              object-cover
              mr-4
              border-2
              border-teal-100
            "
          />

          <div>
            <h3 className="font-bold text-lg text-gray-800">{profile.name}</h3>

            {/* =========================
                Star Rating
            ========================= */}
            <div className="flex items-center gap-1 mt-1">
              {[...Array(5)].map((_, index) => (
                <Star
                  key={index}
                  size={14}
                  className={
                    index < rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }
                />
              ))}

              <span className="text-xs text-gray-500 ml-1">({rating}.0)</span>
            </div>
          </div>
        </div>

        {/* =========================
            Stats
        ========================= */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-teal-600 font-semibold text-sm">
            {profile.successRate || "100% Success"}
          </span>

          <span className="text-gray-500 text-sm">
            {profile.jobsDone || 0} jobs
          </span>
        </div>

        {/* =========================
            Expertise
        ========================= */}
        <div className="mb-1">
          <p className="text-sm font-semibold text-gray-700 mb-1">Expertise</p>

          <p className="text-sm text-gray-600 line-clamp-2 min-h-[40px]">
            {profile.expertise}
          </p>
        </div>

        {/* =========================
            Description
            ONLY for Top Freelancer
        ========================= */}

          <div className="mb-1">
            <p className="text-sm font-semibold text-gray-700 mb-1">
              Description
            </p>

            <p
              className="
                text-sm
                text-gray-500
                line-clamp-3
                min-h-[65px]
              "
            >
              {profile.description}
            </p>
          </div>
      </div>

      {/* =========================Ï
          Bottom Button
      ========================= */}
      <button
        onClick={handleAction}
        className="
          w-full
          border
          border-teal-600
          text-teal-600
          hover:bg-teal-50
          py-2.5
          rounded-xl
          text-sm
          font-semibold
          transition-all
          duration-200
        "
      >
        {type === "top" ? "Book Consultation" : "View Profile"}
      </button>
    </div>
  );
};

export default ProfileCard;
