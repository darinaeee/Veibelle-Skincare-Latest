import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import { FaSearch, FaChevronLeft, FaChevronRight } from "react-icons/fa";

const Ingredients = () => {
  const [allIngredients, setAllIngredients] = useState([]);
  const [filteredIngredients, setFilteredIngredients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    Papa.parse("/ingredients_cleaned_preprocessed.csv", {
      header: true,
      download: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rawData = results.data
          .filter((item) => item.name && item.name.trim() !== "")
          .map((item) => ({
            name: item.name.trim(),
            what_is_it: item.what_is_it || "No description available.",
          }));

        rawData.sort((a, b) => a.name.localeCompare(b.name));

        setAllIngredients(rawData);
        setFilteredIngredients(rawData);
        setLoading(false);
      },
    });
  }, []);

  useEffect(() => {
    const results = allIngredients.filter((ing) =>
      ing.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredIngredients(results);
    setCurrentPage(1);
  }, [searchTerm, allIngredients]);

  const totalPages = Math.ceil(filteredIngredients.length / ITEMS_PER_PAGE);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentItems = filteredIngredients.slice(indexOfFirstItem, indexOfLastItem);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen pb-20 pt-10">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center mb-12">
          <h1 className="font-['Cinzel'] text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-6">
            Ingredient Dictionary
          </h1>
          <p className="font-['Poppins'] text-gray-500 max-w-2xl mx-auto text-sm md:text-base">
            Decode your skincare labels. Understand exactly what you are putting on your skin.
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-16 relative">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search for an ingredient (e.g. Niacinamide)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 rounded-full bg-white border border-gray-200 shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black font-['Poppins'] text-sm transition-all"
          />
        </div>

        {loading && (
          <div className="text-center py-20">
            <p className="font-['Cinzel'] text-xl text-gray-400 animate-pulse">Loading Library...</p>
          </div>
        )}

        {!loading && (
          <>
            {currentItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentItems.map((ingredient, index) => (
                  <div
                    key={index}
                    className="group bg-white rounded-[1.5rem] p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
                  >
                    <h2 className="font-['Cinzel'] font-bold text-lg text-[#1a1a1a] mb-3 pb-3 border-b border-gray-100 group-hover:border-black transition-colors break-words hyphens-auto leading-tight">
                      {ingredient.name}
                    </h2>
                    <p className="text-gray-600 font-['Poppins'] text-sm leading-relaxed flex-grow">
                      {ingredient.what_is_it}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-gray-200">
                <p className="font-['Poppins'] text-gray-400">No ingredients found matching "{searchTerm}"</p>
              </div>
            )}
          </>
        )}

        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-6 mt-16">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-6 py-3 rounded-full border border-gray-300 text-sm font-['Poppins'] font-bold hover:bg-black hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-300 transition-all"
            >
              <FaChevronLeft size={10} /> Prev
            </button>

            <span className="font-['Cinzel'] text-[#1a1a1a] font-bold">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-6 py-3 rounded-full border border-gray-300 text-sm font-['Poppins'] font-bold hover:bg-black hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-300 transition-all"
            >
              Next <FaChevronRight size={10} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Ingredients;