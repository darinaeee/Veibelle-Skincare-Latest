// src/pages/Skincare101.jsx
import React, { useState } from "react";

const Skincare101 = () => {
  const [activeSection, setActiveSection] = useState("essentials");
  const [openMythIndex, setOpenMythIndex] = useState(null);

  const toggleMyth = (index) => {
    setOpenMythIndex(openMythIndex === index ? null : index);
  };

  // --- Components ---

  // 1. Navigation Tab (Minimalist Pill)
  const TabButton = ({ id, label }) => (
    <button
      onClick={() => setActiveSection(id)}
      className={`px-8 py-3 rounded-pill text-xs md:text-sm font-['Poppins'] font-bold uppercase tracking-[0.15em] transition-all duration-300 border border-transparent
        ${
          activeSection === id
            ? "bg-[#1a1a1a] text-white shadow-lg"
            : "bg-white text-gray-400 border-gray-200 hover:border-black hover:text-black"
        }`}
    >
      {label}
    </button>
  );

  // 2. Info Card (Typography Based - No Icons)
  const InfoCard = ({ title, desc, benefit, index }) => (
    <div className="group bg-white rounded-[1.5rem] p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col relative overflow-hidden">
      
      {/* Decorative Number Background */}
      <span className="absolute top-[-10px] right-[-10px] text-[8rem] font-['Cinzel'] font-bold text-gray-50 opacity-50 group-hover:text-gray-100 transition-colors pointer-events-none select-none">
        {String(index + 1).padStart(2, '0')}
      </span>

      <div className="relative z-10 flex flex-col h-full">
        <h3 className="font-['Cinzel'] font-bold text-xl text-[#1a1a1a] mb-4 border-b border-black pb-4 inline-block w-fit">
          {title}
        </h3>
        
        <p className="text-gray-600 font-['Poppins'] text-sm leading-relaxed mb-6 flex-grow">
          {desc}
        </p>
        
        <div className="bg-[#faf9f6] p-4 rounded-xl border-l-2 border-[#1a1a1a]">
          <p className="text-[10px] font-['Poppins'] font-bold text-gray-400 uppercase tracking-widest mb-1">
            Benefit
          </p>
          <p className="text-sm font-['Poppins'] text-[#1a1a1a] font-medium italic">
            "{benefit}"
          </p>
        </div>
      </div>
    </div>
  );

  // 3. Minimalist Accordion (Text based indicators)
  const MythAccordion = ({ item, index, isOpen, onClick }) => (
    <div className="border-b border-gray-200 last:border-none">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between py-6 text-left focus:outline-none group"
      >
        <div className="flex items-center gap-6">
           <span className="text-gray-300 font-['Cinzel'] text-xl font-bold group-hover:text-black transition-colors">
             {String(index + 1).padStart(2, '0')}
           </span>
           <span className={`font-['Cinzel'] font-bold text-lg transition-colors ${isOpen ? "text-[#1a1a1a]" : "text-gray-600 group-hover:text-black"}`}>
             {item.title}
           </span>
        </div>
        <span className="text-2xl font-light text-[#1a1a1a]">
          {isOpen ? "−" : "+"}
        </span>
      </button>
      
      <div 
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isOpen ? "max-h-40 opacity-100 pb-8" : "max-h-0 opacity-0"
        }`}
      >
        <div className="pl-12 md:pl-16 pr-4 text-gray-600 font-['Poppins'] text-sm leading-relaxed max-w-2xl">
          {item.content}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-20 pt-10">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="font-['Cinzel'] text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-6 tracking-wide">
            Skincare Education
          </h1>
          <div className="w-24 h-1 bg-[#1a1a1a] mx-auto mb-6"></div>
          <p className="font-['Poppins'] text-gray-500 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            Master the basics, identify your unique skin profile, and learn the truth behind common skincare myths.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-20">
          <TabButton id="essentials" label="The Essentials" />
          <TabButton id="personality" label="Skin Types" />
          <TabButton id="myths" label="Myth Busting" />
        </div>

        {/* --- SECTION 1: ESSENTIALS --- */}
        {activeSection === "essentials" && (
          <div className="animate-fade-in-up grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Cleanser", desc: "The foundation of any routine. Removes dirt, makeup, and impurities without stripping natural oils.", benefit: "Prevents clogged pores & acne." },
              { title: "Moisturizer", desc: "Locks in hydration and strengthens your skin barrier against environmental damage.", benefit: "Keeps skin soft & youthful." },
              { title: "Serum", desc: "Concentrated actives that target specific concerns like dark spots, dullness, or wrinkles.", benefit: "Delivers high-impact results." },
              { title: "Sunscreen", desc: "The most non-negotiable step. Shields skin from harmful UV rays that cause aging.", benefit: "Prevents premature aging & cancer." },
              { title: "Face Mask", desc: "An occasional treatment to boost hydration, detoxify pores, or soothe irritation.", benefit: "Provides instant glow & radiance." },
              { title: "Eye Cream", desc: "Formulated specifically for the thin, delicate skin around your eyes.", benefit: "Reduces puffiness & fine lines." },
            ].map((item, i) => (
              <InfoCard key={i} index={i} {...item} />
            ))}
          </div>
        )}

        {/* --- SECTION 2: SKIN TYPES --- */}
        {activeSection === "personality" && (
          <div className="animate-fade-in-up grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              { title: "Normal Skin", desc: "Well-balanced sebum and moisture. Neither too oily nor too dry. Few imperfections.", benefit: "Focus on maintenance & protection." },
              { title: "Dry Skin", desc: "Feels tight, rough, or flaky. Prone to fine lines and dullness.", benefit: "Needs deep hydration & rich oils." },
              { title: "Oily Skin", desc: "Shiny T-zone, enlarged pores, and prone to blackheads or acne.", benefit: "Needs oil-control & gel textures." },
              { title: "Combination", desc: "Oily in the T-zone (forehead/nose) but dry or normal on the cheeks.", benefit: "Needs balancing products." },
              { title: "Sensitive", desc: "Reddens easily, reacts to fragrance, weather, or harsh chemicals.", benefit: "Needs calming, gentle ingredients." },
            ].map((item, i) => (
              <InfoCard key={i} index={i} {...item} />
            ))}
          </div>
        )}

        {/* --- SECTION 3: MYTHS --- */}
        {activeSection === "myths" && (
          <div className="animate-fade-in-up max-w-4xl mx-auto bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-gray-100">
            {[
              { title: "Natural Ingredients Are Always Better", content: "False. Poison ivy is natural, but you wouldn't put it on your face. Synthetic ingredients are often more stable, effective, and rigorously tested for safety." },
              { title: "You Don't Need Sunscreen on Cloudy Days", content: "False. Up to 80% of UV rays can penetrate clouds. Sun damage is cumulative, so wear SPF every single day, regardless of weather." },
              { title: "Oily Skin Doesn’t Need Moisturizer", content: "False. If you dry out oily skin, it compensates by producing even MORE oil. Use a lightweight, oil-free moisturizer instead." },
              { title: "Pores Can Open and Close", content: "False. Pores do not have muscles. You cannot 'close' them, but you can minimize their appearance by keeping them clean and clear." },
              { title: "The More Expensive, The Better", content: "False. Price doesn't guarantee quality. Many affordable brands contain the exact same active ingredients as luxury ones, just without the fancy packaging." },
            ].map((myth, i) => (
              <MythAccordion 
                key={i} 
                item={myth} 
                index={i} 
                isOpen={openMythIndex === i} 
                onClick={() => toggleMyth(i)} 
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Skincare101;