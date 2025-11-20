// src/pages/History.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const History = () => {
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("history") || "[]");
    setHistory(stored.reverse()); // show most recent first
  }, []);

  const handleViewDetails = (item) => {
    localStorage.setItem("historyView", JSON.stringify(item));
    navigate("/history-details");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 mt-10">
      <h2 className="text-3xl font-extrabold">Your Recommendation History</h2>

      {history.length === 0 && (
        <p className="text-gray-500">No history found yet. Try taking the quiz!</p>
      )}

      <div className="space-y-4">
        {history.map((item, index) => (
          <div
            key={index}
            className="bg-white p-5 rounded-xl shadow hover:shadow-md transition"
          >
            <p className="text-gray-500 text-sm">
              {new Date(item.timestamp).toLocaleString()}
            </p>

            <p className="mt-2 text-lg font-semibold">
              {item.profile.skinType} — {item.profile.productType}
            </p>

            <p className="text-gray-600">
              Concerns: {item.profile.concerns.join(", ")}
            </p>

            <button
              onClick={() => handleViewDetails(item)}
              className="mt-3 px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800"
            >
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;
