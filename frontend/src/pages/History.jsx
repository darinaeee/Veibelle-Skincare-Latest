// src/pages/History.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaChevronRight } from "react-icons/fa";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const email = localStorage.getItem("veibelle_email");

    if (!email) {
      // Not logged in → show error + button to login
      setLoading(false);
      setErr("Please sign in first to see your history.");
      return;
    }

    if (!API_BASE_URL) {
      setLoading(false);
      setErr("API URL is not configured. Please try again later.");
      return;
    }

    const fetchHistory = async () => {
      try {
        setLoading(true);
        setErr(null);

        const res = await fetch(
          `${API_BASE_URL}/history?email=${encodeURIComponent(email)}`
        );
        const json = await res.json();

        if (!res.ok || json.status !== "success") {
          throw new Error(json.detail || "Failed to load history");
        }

        const rows = json.data || [];

        // Transform backend rows → UI-friendly history items
        const transformed = rows
          .map((row) => {
            const qa = row.quiz_answers || {};

            const profile = {
              skinType: qa.skin_type || "",
              concerns: Array.isArray(qa.concerns) ? qa.concerns : [],
              productType: qa.product_type || "",
              allergens: Array.isArray(qa.allergens) ? qa.allergens : [],
              eyeConcerns: Array.isArray(qa.eye_concerns)
                ? qa.eye_concerns
                : [],
              pregnancy: qa.pregnancy || "",
              id: row.id,
              timestamp: row.created_at,
            };

            return {
              profile,
              results: row.recommendations || [],
              timestamp: row.created_at,
            };
          })
          // newest first, just in case
          .sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );

        setHistory(transformed);
      } catch (e) {
        console.error("❌ Failed to load history:", e);
        setErr("Failed to load your history. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleViewDetails = (item) => {
    // Pass whole item via router state (no localStorage)
    navigate("/history-details", { state: item });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-['Cinzel'] text-xl text-gray-400 animate-pulse">
          Loading your past consultations...
        </p>
      </div>
    );
  }

  if (err) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <p className="font-['Poppins'] text-sm text-red-500 mb-4 text-center">
          {err}
        </p>
        <button
          onClick={() => navigate("/auth/login")}
          className="px-8 py-3 rounded-full bg-[#1a1a1a] text-white text-sm font-['Poppins'] font-bold tracking-wide hover:bg-[#333] transition"
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 pt-10">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="font-['Cinzel'] text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-4">
            Consultation History
          </h1>
          <p className="font-['Poppins'] text-gray-500 text-sm md:text-base">
            Review your past skin analysis and product recommendations.
          </p>
        </div>

        {history.length === 0 && (
          <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-gray-200">
            <p className="font-['Cinzel'] text-xl text-gray-400 mb-4">
              No history found yet.
            </p>
            <button
              onClick={() => navigate("/quiz")}
              className="px-8 py-3 rounded-full bg-[#1a1a1a] text-white text-sm font-['Poppins'] font-bold tracking-wide hover:bg-[#333] transition"
            >
              Take Your First Quiz
            </button>
          </div>
        )}

        <div className="space-y-6">
          {history.map((item, index) => (
            <div
              key={index}
              onClick={() => handleViewDetails(item)}
              className="group bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
            >
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2 text-gray-400 text-xs font-['Poppins'] font-bold uppercase tracking-widest">
                  <FaCalendarAlt />
                  {new Date(item.timestamp).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <h3 className="font-['Cinzel'] text-2xl font-bold text-[#1a1a1a]">
                  {item.profile.skinType}{" "}
                  <span className="text-gray-300">|</span>{" "}
                  {item.profile.productType}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {item.profile.concerns?.map((c, i) => (
                    <span
                      key={i}
                      className="bg-gray-50 text-gray-600 px-3 py-1 rounded-full text-xs font-['Poppins'] font-medium border border-gray-100"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 text-[#1a1a1a] font-['Poppins'] font-bold text-sm uppercase tracking-widest group-hover:underline underline-offset-4">
                View Results <FaChevronRight className="text-xs" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default History;
