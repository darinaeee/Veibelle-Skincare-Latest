import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

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
    return (
      <div className="flex items-center justify-center h-screen bg-[#faf9f6]">
        <p className="font-['Cinzel'] text-xl text-gray-400 animate-pulse">Loading details...</p>
      </div>
    );

  const RecommendedProductCard = ({ p, allergens }) => (
    <div className="group bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full">
      <div className="flex flex-col flex-grow">
        {p.brand && (
          <p className="text-xs font-['Poppins'] font-bold text-gray-400 uppercase tracking-widest mb-2">
            {p.brand}
          </p>
        )}
        <h4 className="font-['Cinzel'] font-bold text-lg text-[#1a1a1a] mb-4 leading-tight min-h-[4.5rem] break-words hyphens-auto">
          {p.name}
        </h4>
        {allergens?.length > 0 && (
          <div className="mt-auto">
            <div className="inline-block bg-green-50 text-green-800 text-[10px] font-['Poppins'] font-bold uppercase tracking-wide px-3 py-1 rounded-full border border-green-100">
              Allergen Safe
            </div>
          </div>
        )}
      </div>
      <button className="w-full mt-6 border border-[#1a1a1a] text-[#1a1a1a] py-3 rounded-full text-xs font-['Poppins'] font-bold uppercase tracking-widest group-hover:bg-[#1a1a1a] group-hover:text-white transition-all duration-300">
        View Details
      </button>
    </div>
  );

  return (
    <div className="min-h-screen pb-20 pt-10">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="mb-10 flex items-center justify-between">
           <button 
             onClick={() => navigate("/history")}
             className="flex items-center gap-2 text-gray-500 hover:text-black font-['Poppins'] text-sm font-bold uppercase tracking-wide transition-colors"
           >
             <FaArrowLeft /> Back to History
           </button>
           <span className="text-gray-400 font-['Poppins'] text-xs uppercase tracking-widest">
             {new Date(data.timestamp).toLocaleDateString()}
           </span>
        </div>

        <div className="text-center mb-12">
          <h2 className="font-['Cinzel'] text-3xl md:text-4xl font-bold text-[#1a1a1a]">
            Snapshot Details
          </h2>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-lg relative overflow-hidden mb-16 max-w-6xl mx-auto">
          <div className="absolute top-0 left-0 w-full h-4 bg-[#1a1a1a]"></div>
          <div className="p-8 pt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-8">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase font-['Poppins'] mb-2">Skin Type</span>
              <span className="font-['Cinzel'] text-3xl font-bold text-[#1a1a1a]">{data.profile.skinType}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase font-['Poppins'] mb-2">Main Concerns</span>
              <div className="flex flex-wrap gap-2">
                {data.profile.concerns.map((c, i) => (
                  <span key={i} className="bg-gray-100 text-gray-700 px-4 py-1.5 rounded-full text-sm font-['Poppins'] font-medium">{c}</span>
                ))}
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase font-['Poppins'] mb-2">Product Type</span>
              <span className="font-['Cinzel'] text-2xl font-bold text-[#1a1a1a]">{data.profile.productType}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase font-['Poppins'] mb-2">Allergens Avoided</span>
              <span className={`font-['Poppins'] text-lg font-semibold ${data.profile.allergens?.length ? "text-red-700" : "text-gray-400"}`}>
                {data.profile.allergens?.length ? data.profile.allergens.join(", ") : "None"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase font-['Poppins'] mb-2">Eye Area Concerns</span>
              <div className="flex flex-wrap gap-2">
                {data.profile.eyeConcerns?.length > 0 ? (
                   data.profile.eyeConcerns.map((e, i) => (
                    <span key={i} className="text-[#1a1a1a] font-['Cinzel'] text-lg font-bold">{e}{i < data.profile.eyeConcerns.length - 1 ? ", " : ""}</span>
                   ))
                ) : (
                  <span className="text-gray-400 font-['Poppins']">No Eye Concern</span>
                )}
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase font-['Poppins'] mb-2">Pregnancy / Nursing</span>
              <span className="font-['Cinzel'] text-xl font-bold text-[#1a1a1a]">{data.profile.pregnancySafe === "Yes" ? "Yes (Safe Mode On)" : "No"}</span>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto space-y-8">
           <div className="flex items-center justify-between border-b border-gray-200 pb-4">
             <h3 className="font-['Cinzel'] text-2xl text-[#1a1a1a] font-bold">Past Recommendations</h3>
             <span className="text-xs font-['Poppins'] text-gray-500 uppercase tracking-wide hidden md:block">Generated Result</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.results && data.results.length > 0 ? (
              data.results.map((p, index) => (
                <RecommendedProductCard key={index} p={p} allergens={data.profile.allergens} />
              ))
            ) : (
              <div className="col-span-full py-10 text-center text-gray-400 font-['Poppins']">No products were recommended in this session.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryDetails;