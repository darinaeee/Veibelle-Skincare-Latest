// src/pages/HistoryDetails.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const HistoryDetails = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("historyView");
    if (!stored) {
      navigate("/history");
      return;
    }
    setData(JSON.parse(stored));
  }, [navigate]);

  if (!data)
    return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 mt-10">
      <h2 className="text-3xl font-extrabold">Recommendation Details</h2>

      <div className="bg-white p-6 rounded-xl shadow space-y-3">
        <p><strong>Skin Type:</strong> {data.profile.skinType}</p>
        <p><strong>Product Type:</strong> {data.profile.productType}</p>
        <p><strong>Concerns:</strong> {data.profile.concerns.join(", ")}</p>
        <p><strong>Allergens:</strong> {data.profile.allergens.join(", ") || "None"}</p>
      </div>

      <h3 className="text-2xl font-bold">Recommended Products</h3>

      <div className="grid md:grid-cols-3 gap-6">
        {data.results.map((p, index) => (
          <div
            key={index}
            className="bg-white border rounded-xl p-5 shadow"
          >
            <h4 className="font-bold text-lg">{p.name}</h4>
            {p.brand && <p className="text-gray-500">{p.brand}</p>}
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate("/history")}
        className="mt-6 px-4 py-2 border rounded-lg"
      >
        Back to History
      </button>
    </div>
  );
};

export default HistoryDetails;
