// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState(null);
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // --- Load saved quiz data + recommendations from localStorage ---
  useEffect(() => {
    try {
      const savedQuiz = localStorage.getItem("quizData");
      if (!savedQuiz) {
        navigate("/quiz");
        return;
      }

      const parsed = JSON.parse(savedQuiz);
      setQuizData(parsed);
      setRecs(Array.isArray(parsed.recommendations) ? parsed.recommendations : []);
      setLoading(false);
    } catch (e) {
      console.error("Failed to load quizData from localStorage:", e);
      setErr("Failed to load your latest recommendation session.");
      setLoading(false);
    }
  }, [navigate]);

  // ✅ Save to History (localStorage) – optional UI history
  useEffect(() => {
    if (quizData && recs.length > 0) {
      const history = JSON.parse(localStorage.getItem("history") || "[]");

      // If quizData.id doesn't exist (older data), skip to avoid weird duplicates
      if (!quizData.id) return;

      const isAlreadySaved = history.some(
        (item) => item.profile.id === quizData.id
      );

      if (!isAlreadySaved) {
        const newEntry = {
          profile: quizData,
          results: recs,
          timestamp: quizData.timestamp || new Date().toISOString(),
        };

        const updatedHistory = [...history, newEntry];
        localStorage.setItem("history", JSON.stringify(updatedHistory));
        console.log("✅ Saved to local history:", newEntry);
      }
    }
  }, [recs, quizData]);

  // --- Handlers ---
  const handleRetakeQuiz = () => {
    localStorage.removeItem("quizData");
    navigate("/quiz");
  };

  const handleGoHome = () => {
    navigate("/");
  };

  // --- Reusable Recommended Product Card ---
  const RecommendedProductCard = ({ p, profile }) => {
    const hasAllergens = profile.allergens?.length > 0;
    const isPregnancySafe = profile.pregnancy === "Yes";

    return (
      <div className="group bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full">
        <div>
          {/* Brand */}
          {p.brand && (
            <p className="text-xs font-['Poppins'] font-bold text-gray-400 uppercase tracking-widest mb-2">
              {p.brand}
            </p>
          )}

          {/* Name */}
          <h4 className="font-['Cinzel'] font-bold text-lg text-[#1a1a1a] mb-2 leading-tight">
            {p.name}
          </h4>

          {/* Label tag e.g. Moisturizer, Cleanser */}
          {p.Label && (
            <p className="text-[11px] font-['Poppins'] text-gray-500 mb-3">
              {p.Label}
            </p>
          )}

          {/* Allergen safe badge */}
          {hasAllergens && (
            <div className="inline-block bg-green-50 text-green-800 text-[10px] font-['Poppins'] font-bold uppercase tracking-wide px-3 py-1 rounded-full mb-3">
              ✓ Allergen Safe
            </div>
          )}

          {/* 🧠 Explanation block */}
          <div className="mt-1 text-[11px] font-['Poppins'] text-gray-600 leading-relaxed">
            <p className="font-semibold text-gray-800 mb-1">
              Why this matches you:
            </p>
            <ul className="space-y-1 list-disc list-inside">
              {profile.skinType && (
                <li>
                  Tailored for{" "}
                  <span className="font-semibold">{profile.skinType}</span> skin.
                </li>
              )}
              {profile.concerns?.length > 0 && (
                <li>
                  Focused on concern(s):{" "}
                  <span className="font-semibold">
                    {profile.concerns.join(", ")}
                  </span>
                  .
                </li>
              )}
              {hasAllergens && (
                <li>
                  Excludes your allergen(s):{" "}
                  <span className="font-semibold">
                    {profile.allergens.join(", ")}
                  </span>
                  .
                </li>
              )}
              {isPregnancySafe && (
                <li>
                  Filtered to be{" "}
                  <span className="font-semibold">pregnancy-safe</span>.
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Button */}
        <button className="w-full mt-6 border border-[#1a1a1a] text-[#1a1a1a] py-3 rounded-full text-xs font-['Poppins'] font-bold uppercase tracking-widest group-hover:bg-[#1a1a1a] group-hover:text-white transition-all duration-300">
          View Details
        </button>
      </div>
    );
  };

  // --- Loading / error states (before quizData is ready) ---
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#faf9f6]">
        <p className="font-['Cinzel'] text-xl text-gray-400 animate-pulse">
          Curating your routine...
        </p>
      </div>
    );
  }

  if (!quizData) {
    return null; // we already navigated to /quiz in the effect
  }

  if (err) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#faf9f6]">
        <p className="font-['Poppins'] text-sm text-red-500">{err}</p>
      </div>
    );
  }

  // --- MAIN RENDER ---
  return (
    <div className="min-h-screen pb-20">
      <div className="w-full max-w-7xl mx-auto px-6 pt-12">
        {/* Page Title */}
        <div className="text-center mb-10">
          <h2 className="font-['Cinzel'] text-3xl md:text-5xl font-bold text-[#1a1a1a] mb-2">
            Your Personalized Dashboard
          </h2>
        </div>

        {/* --- SUMMARY CARD --- */}
        <div className="bg-white rounded-[2.5rem] shadow-lg relative overflow-hidden mb-16 max-w-6xl mx-auto">
          {/* Black Top Bar */}
          <div className="absolute top-0 left-0 w-full h-4 bg-[#1a1a1a]"></div>

          <div className="p-8 pt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-8">
            {/* 1. Skin Type */}
            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase font-['Poppins'] mb-2">
                Skin Type
              </span>
              <span className="font-['Cinzel'] text-3xl font-bold text-[#1a1a1a]">
                {quizData.skinType}
              </span>
            </div>

            {/* 2. Main Concerns */}
            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase font-['Poppins'] mb-2">
                Main Concerns
              </span>
              <div className="flex flex-wrap gap-2">
                {quizData.concerns?.map((c, i) => (
                  <span
                    key={i}
                    className="bg-gray-100 text-gray-700 px-4 py-1.5 rounded-full text-sm font-['Poppins'] font-medium"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            {/* 3. Product Type */}
            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase font-['Poppins'] mb-2">
                Product Type
              </span>
              <span className="font-['Cinzel'] text-2xl font-bold text-[#1a1a1a]">
                {quizData.productType}
              </span>
            </div>

            {/* 4. Allergens */}
            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase font-['Poppins'] mb-2">
                Allergens to Avoid
              </span>
              <span
                className={`font-['Poppins'] text-lg font-semibold ${
                  quizData.allergens?.length ? "text-red-700" : "text-gray-400"
                }`}
              >
                {quizData.allergens?.length
                  ? quizData.allergens.join(", ")
                  : "None"}
              </span>
            </div>

            {/* 5. Eye Concerns */}
            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase font-['Poppins'] mb-2">
                Eye Area Concerns
              </span>
              <div className="flex flex-wrap gap-2">
                {quizData.eyeConcerns?.length > 0 ? (
                  quizData.eyeConcerns.map((e, i) => (
                    <span
                      key={i}
                      className="text-[#1a1a1a] font-['Cinzel'] text-lg font-bold"
                    >
                      {e}
                      {i < quizData.eyeConcerns.length - 1 ? ", " : ""}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 font-['Poppins']">
                    No Eye Concern
                  </span>
                )}
              </div>
            </div>

            {/* 6. Pregnancy */}
            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase font-['Poppins'] mb-2">
                Pregnancy / Nursing
              </span>
              <span className="font-['Cinzel'] text-xl font-bold text-[#1a1a1a]">
                {quizData.pregnancy === "Yes"
                  ? "Yes (Safe Mode On)"
                  : "No"}
              </span>
            </div>
          </div>
        </div>

        {/* --- RECOMMENDATIONS SECTION --- */}
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Dynamic Context Header */}
          <div className="text-center space-y-3 mb-8">
            <h3 className="font-['Cinzel'] text-3xl text-[#1a1a1a] font-bold">
              Top Matches for You
            </h3>

            <p className="font-['Poppins'] text-gray-500 text-sm md:text-base max-w-3xl mx-auto leading-relaxed">
              Based on your{" "}
              <span className="text-black font-semibold">
                {quizData.skinType}
              </span>{" "}
              skin type, preference for{" "}
              <span className="text-black font-semibold">
                {quizData.productType}
              </span>
              , and concerns like{" "}
              <span className="text-black font-semibold">
                {quizData.concerns?.join(", ")}
              </span>
              .
            </p>

            {/* Allergen Notice */}
            {quizData.allergens?.length > 0 && (
              <div className="inline-block bg-red-50 border border-red-100 px-4 py-2 rounded-lg mt-2">
                <p className="font-['Poppins'] text-xs text-red-800">
                  <span className="font-bold">Note:</span> Products containing{" "}
                  <strong>{quizData.allergens.join(", ")}</strong> have been
                  automatically detected and excluded.
                </p>
              </div>
            )}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recs && recs.length > 0 ? (
              recs.map((p, i) => (
                <RecommendedProductCard key={i} p={p} profile={quizData} />
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border border-dashed border-gray-200">
                <p className="font-['Cinzel'] text-xl text-gray-400 mb-2">
                  No perfect matches found.
                </p>
                <p className="font-['Poppins'] text-sm text-gray-400">
                  Try adjusting your filters.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* --- BOTTOM ACTIONS --- */}
        <div className="flex flex-col items-center mt-20 pt-10 border-t border-gray-200">
          <p className="text-gray-600 text-sm mb-6 font-['Poppins']">
            Not satisfied with these results? You may try again.
          </p>

          <div className="flex gap-4">
            <button
              onClick={handleRetakeQuiz}
              className="px-8 py-3 rounded-full bg-[#1a1a1a] text-white text-sm font-['Poppins'] font-bold tracking-wide hover:bg-[#333] transition shadow-lg hover:-translate-y-1"
            >
              Retake Quiz
            </button>

            <button
              onClick={handleGoHome}
              className="px-8 py-3 rounded-full border border-gray-300 text-sm font-['Poppins'] font-bold text-gray-700 hover:bg:white hover:border-black hover:text-black transition"
            >
              Back to Home
            </button>
          </div>

          <footer className="text-xs text-gray-400 mt-12 text-center font-['Poppins'] uppercase tracking-widest">
            Generated based on your personalized skincare quiz.
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
