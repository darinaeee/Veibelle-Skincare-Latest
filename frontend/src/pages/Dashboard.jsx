// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRecommendations } from "../api/recommendationAPI"; // ✅ use shared API function

const Dashboard = () => {
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState(null);
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // --- Load saved quiz data ---
  useEffect(() => {
    const savedQuiz = localStorage.getItem("quizData");
    if (savedQuiz) setQuizData(JSON.parse(savedQuiz));
    else navigate("/quiz");
  }, [navigate]);

  // --- Fetch recommendations when quizData is ready ---
  useEffect(() => {
    if (!quizData) return;

    const fetchRecs = async () => {
      setLoading(true);
      setErr(null);

      try {
        const data = await getRecommendations({
          skin_type: quizData.skinType,
          product_type: quizData.productType,
          concerns: quizData.concerns?.join(","),
          allergens_list: quizData.allergens?.join(","),
          pregnancy_safe: quizData.pregnancySafe,
        });

        setRecs(Array.isArray(data.results) ? data.results : []);
      } catch (e) {
        console.error("❌ Failed to fetch recommendations:", e);
        setErr("Failed to fetch recommendations. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecs();
  }, [quizData]);

  if (!quizData) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Loading your personalized dashboard...
      </div>
    );
  }

  // --- Navigation handlers ---
  const handleRetakeQuiz = () => {
    localStorage.removeItem("quizData");
    navigate("/quiz");
  };

  const handleGoHome = () => {
    navigate("/");
  };

  // --- Recommended Product Card Component ---
  const RecommendedProductCard = ({ p, allergens }) => (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md hover:shadow-lg transition duration-300 flex flex-col gap-1">
      <h4 className="font-bold text-lg text-black">{p.name}</h4>
      {p.brand && <p className="text-sm text-gray-500">{p.brand}</p>}

      {allergens?.length > 0 && (
        <p className="text-xs text-green-700 mt-1">
          Allergen-safe for: {allergens.join(", ")}
        </p>
      )}
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 p-6 mt-8">
      {/* Header */}
      <header className="flex justify-between items-center border-b pb-4">
        <h2 className="text-3xl font-extrabold text-black">
          Your Personalized Dashboard
        </h2>
      </header>

      {/* Profile Summary */}
      <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
        <h3 className="text-xl font-bold">Skincare Profile Summary</h3>
        <div className="grid md:grid-cols-3 gap-4 mt-2">
          <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-gray-300">
            <p className="text-sm text-gray-500">Skin Type</p>
            <p className="text-lg font-bold capitalize">{quizData.skinType}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-gray-300">
            <p className="text-sm text-gray-500">Main Concerns</p>
            <p className="text-lg font-bold">
              {quizData.concerns?.join(", ") || "N/A"}
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-gray-300">
            <p className="text-sm text-gray-500">Product Type</p>
            <p className="text-lg font-bold">
              {quizData.productType || "N/A"}
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-black">
            <p className="text-sm text-black">Allergens to Avoid</p>
            <p className="text-lg font-bold">
              {quizData.allergens?.length
                ? quizData.allergens.join(", ")
                : "None"}
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-gray-300">
            <p className="text-sm text-gray-500">Eye Area Concerns</p>
            <p className="text-lg font-bold">
              {quizData.eyeConcerns?.join(", ") || "None"}
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-gray-300">
            <p className="text-sm text-gray-500">Pregnancy / Nursing</p>
            <p className="text-lg font-bold">
              {quizData.pregnancySafe || "No"}
            </p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-black">Top Matches for You</h3>
        <p className="text-gray-600">
          Based on your <strong>{quizData.skinType}</strong> skin type,{" "}
          <strong>{quizData.productType}</strong> preference, and concern(s) like{" "}
          <strong>{quizData.concerns?.join(", ") || "none"}</strong>.
        </p>

        {quizData.allergens?.length > 0 && (
          <p className="text-gray-600 text-sm">
            Products containing your selected allergens (
            <strong>{quizData.allergens.join(", ")}</strong>
            ) have been automatically detected and excluded from these
            recommendations.
          </p>
        )}

        {loading && <div>Loading recommendations...</div>}
        {err && <div className="text-red-500">{err}</div>}

        <div className="grid md:grid-cols-3 gap-6">
          {recs && recs.length ? (
            recs.map((p, i) => (
              <RecommendedProductCard
                key={i}
                p={p}
                allergens={quizData.allergens}
              />
            ))
          ) : (
            !loading && (
              <div className="text-gray-500">
                No matches found for your filters.
              </div>
            )
          )}
        </div>
      </div>

      {/* Bottom actions */}
      <div className="flex flex-col items-center mt-10 space-y-3">
        <p className="text-gray-600 text-sm">
          Not satisfied with these results? You may try again.
        </p>

        <div className="flex gap-4">
          <button
            onClick={handleRetakeQuiz}
            className="px-5 py-2 rounded-full bg-black text-white text-sm font-medium hover:bg-gray-900 transition"
          >
            Retake Quiz
          </button>

          <button
            onClick={handleGoHome}
            className="px-5 py-2 rounded-full border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
          >
            Back to Home
          </button>
        </div>
      </div>

      <footer className="text-xs text-gray-400 mt-8 pt-4 border-t border-gray-100 text-center">
        Generated based on your personalized skincare quiz.
      </footer>
    </div>
  );
};

export default Dashboard;
