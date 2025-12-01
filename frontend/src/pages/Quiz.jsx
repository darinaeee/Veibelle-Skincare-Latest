import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const QUIZ_OPTIONS = {
  skinTypes: [
    { label: "Normal Skin", desc: "Balanced, clear, and generally problem-free." },
    { label: "Dry Skin", desc: "Feels tight, flaky, or rough. Craves hydration." },
    { label: "Oily Skin", desc: "Shiny T-zone, enlarged pores, prone to breakouts." },
    { label: "Combination Skin", desc: "Oily in some areas (T-zone), dry in others." },
    { label: "Sensitive Skin", desc: "Reacts easily to products, prone to redness." },
  ],
  concerns: [
    "Acne / Blackheads", "Wrinkles / Fine Lines", "Dryness / Dehydration",
    "Uneven Texture", "Redness / Irritation", "Dark Spots",
    "Impaired Barrier", "Loss of Elasticity", "Dullness",
    "Dark Circles", "UV Protection", "Pregnancy-Safe",
  ],
  productTypes: [
    "Moisturizer",
    "Cleanser",
    "Treatment / Serum",
    "Face Mask",
    "Eye Cream",
    "Sun Protection",
  ],
  allergens: [
    "Fragrance",
    "Alcohol",
    "Parabens",
    "Sulfates",
    "Essential Oils",
    "Silicones",
  ],
  eyeConcerns: [
    "Dark Circles",
    "Fine Lines / Wrinkles",
    "Puffiness",
    "No Eye Concern",
  ],
  pregnancy: ["Yes", "No"],
};

const INITIAL_QUIZ_STATE = {
  skinType: "",
  concerns: [],
  productType: "",
  allergens: [],
  eyeConcerns: [],
  pregnancy: "",
};

export default function Quiz() {
  const [step, setStep] = useState(1);
  const [quiz, setQuiz] = useState(INITIAL_QUIZ_STATE);
  const [customAllergen, setCustomAllergen] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    localStorage.setItem("quizStep", step.toString());
  }, [step]);

  const handleCheckboxChange = (name, value) => {
    setQuiz((prev) => {
      const currentArray = prev[name];
      const exists = currentArray.includes(value);
      return {
        ...prev,
        [name]: exists
          ? currentArray.filter((v) => v !== value)
          : [...currentArray, value],
      };
    });
  };

  const handleAddCustomAllergen = () => {
    const newAllergen = customAllergen.trim();
    if (newAllergen && !quiz.allergens.includes(newAllergen)) {
      setQuiz((prev) => ({
        ...prev,
        allergens: [...prev.allergens, newAllergen],
      }));
    }
    setCustomAllergen("");
  };

  // 🔥 Main submit: call backend recommend + save history + keep localStorage
  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    const email = localStorage.getItem("veibelle_email");
    const userId = localStorage.getItem("veibelle_user_id");

    if (!email) {
      setError("Your session expired. Please log in again.");
      setIsSaving(false);
      navigate("/auth/login");
      return;
    }

    try {
      // 1️⃣ Map quiz concerns to backend keywords
      const concernKeywords = quiz.concerns.map((c) => {
        if (c.includes("Acne")) return "acne";
        if (c.includes("Wrinkles")) return "wrinkle";
        if (c.includes("Dryness")) return "dry";
        if (c.includes("Dark Spots")) return "pigmentation";
        if (c.includes("Redness") || c.includes("Irritation")) return "sensitive";
        if (c.includes("Dullness")) return "dullness";
        if (c.includes("UV Protection")) return "uv protection";
        return c.toLowerCase();
      });

      const concernsParam = concernKeywords.join(",");
      const allergensParam = quiz.allergens.join(",");
      const pregnancySafeParam = quiz.pregnancy === "Yes" ? "yes" : "no";

      // 2️⃣ Call FastAPI /recommend
      const params = new URLSearchParams({
        skin_type: quiz.skinType,
        product_type: quiz.productType,
        concerns: concernsParam,
        allergens_list: allergensParam,
        pregnancy_safe: pregnancySafeParam,
        top_n: "5",
      });

      const recRes = await fetch(`${API_BASE_URL}/recommend?${params.toString()}`);
      const recJson = await recRes.json();

      if (!recRes.ok) {
        throw new Error(recJson.message || "Failed to get recommendations");
      }

      const recommendations = recJson.results || [];

      // 3️⃣ Save to Supabase via backend /history
      const quizAnswersForHistory = {
        skin_type: quiz.skinType,
        concerns: quiz.concerns,
        product_type: quiz.productType,
        allergens: quiz.allergens,
        eye_concerns: quiz.eyeConcerns,
        pregnancy: quiz.pregnancy,
      };

      await fetch(`${API_BASE_URL}/history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          user_id: userId,
          quiz_answers: quizAnswersForHistory,
          recommendations,
        }),
      });

      // 4️⃣ Keep local copy for your existing Dashboard page
      const submissionData = {
        ...quiz,
        id: Date.now(),
        timestamp: new Date().toISOString(),
        recommendations,
      };

      localStorage.setItem("quizData", JSON.stringify(submissionData));

      // 5️⃣ Navigate to Dashboard / results
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- Components ---
  const SectionTitle = ({ children }) => (
    <h2 className="font-['Cinzel'] text-2xl md:text-3xl text-[#1a1a1a] mb-2 text-center leading-tight">
      {children}
    </h2>
  );

  const SubTitle = ({ children }) => (
    <p className="text-gray-500 font-['Poppins'] text-sm text-center mb-6 max-w-lg mx-auto">
      {children}
    </p>
  );

  const SelectionCard = ({ selected, onClick, label, desc }) => (
    <button
      onClick={onClick}
      className={`group relative p-4 rounded-pill border text-left transition-all duration-300 flex flex-col justify-center h-full
        ${
          selected
            ? "bg-[#1a1a1a] text-white border-[#1a1a1a] shadow-xl scale-[1.02]"
            : "bg-white text-gray-700 border-gray-200 hover:border-black hover:shadow-md"
        }`}
    >
      <span
        className={`block font-['Cinzel'] font-bold text-base mb-1 ${
          selected ? "text-white" : "text-[#1a1a1a]"
        }`}
      >
        {label}
      </span>
      {desc && (
        <span
          className={`text-xs font-['Poppins'] leading-relaxed ${
            selected ? "text-gray-300" : "text-gray-500"
          }`}
        >
          {desc}
        </span>
      )}
    </button>
  );

  const PillOption = ({ selected, onClick, label }) => (
    <button
      onClick={onClick}
      className={`px-5 py-2 rounded-pill border text-sm font-['Poppins'] font-medium transition-all duration-300
        ${
          selected
            ? "bg-[#1a1a1a] text-white border-[#1a1a1a] shadow-lg transform scale-105"
            : "bg-white text-gray-700 border-gray-300 hover:border-black hover:bg-gray-50"
        }`}
    >
      {label}
    </button>
  );

  const NextButton = ({ onClick, disabled, label }) => (
    <div className="flex justify-center mt-8 pb-8">
      <button
        onClick={onClick}
        disabled={disabled}
        className="bg-[#3E3328] text-white px-12 py-3 rounded-pill text-sm font-['Poppins'] font-bold tracking-widest hover:bg-[#2c241b] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-1"
      >
        {label || "NEXT"}
      </button>
    </div>
  );

  // --- Main Logic ---
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="animate-fade-in-up">
            <SectionTitle>What is your skin type?</SectionTitle>
            <SubTitle>Select the one that describes your skin best.</SubTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {QUIZ_OPTIONS.skinTypes.map(({ label, desc }) => (
                <SelectionCard
                  key={label}
                  label={label}
                  desc={desc}
                  selected={quiz.skinType === label}
                  onClick={() =>
                    setQuiz((p) => ({ ...p, skinType: label }))
                  }
                />
              ))}
            </div>
            <NextButton onClick={() => setStep(2)} disabled={!quiz.skinType} />
          </div>
        );

      case 2:
        return (
          <div className="animate-fade-in-up">
            <SectionTitle>What are your main concerns?</SectionTitle>
            <SubTitle>Select all that apply so we can target them.</SubTitle>
            <div className="flex flex-wrap justify-center gap-3">
              {QUIZ_OPTIONS.concerns.map((concern) => (
                <PillOption
                  key={concern}
                  label={concern}
                  selected={quiz.concerns.includes(concern)}
                  onClick={() => handleCheckboxChange("concerns", concern)}
                />
              ))}
            </div>
            <div className="flex items-center justify-between w-full max-w-lg mx-auto mt-8 pb-8">
              <button
                onClick={() => setStep(1)}
                className="text-gray-400 font-['Poppins'] hover:text-black underline-offset-4 hover:underline text-sm"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={quiz.concerns.length === 0}
                className="bg-[#3E3328] text-white px-10 py-3 rounded-pill font-bold tracking-wide hover:bg-[#2c241b] disabled:opacity-50 transition-all shadow-md"
              >
                NEXT
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="animate-fade-in-up">
            <SectionTitle>What are you looking for?</SectionTitle>
            <SubTitle>Choose the product category you need today.</SubTitle>
            <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
              {QUIZ_OPTIONS.productTypes.map((type) => (
                <PillOption
                  key={type}
                  label={type}
                  selected={quiz.productType === type}
                  onClick={() =>
                    setQuiz((p) => ({ ...p, productType: type }))
                  }
                />
              ))}
            </div>
            <div className="flex items-center justify-between w-full max-w-lg mx-auto mt-8 pb-8">
              <button
                onClick={() => setStep(2)}
                className="text-gray-400 font-['Poppins'] hover:text-black underline-offset-4 hover:underline text-sm"
              >
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                disabled={!quiz.productType}
                className="bg-[#3E3328] text-white px-10 py-3 rounded-pill font-bold tracking-wide hover:bg-[#2c241b] disabled:opacity-50 transition-all shadow-md"
              >
                NEXT
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="animate-fade-in-up">
            <SectionTitle>Any ingredients to avoid?</SectionTitle>
            <SubTitle>We will exclude products containing these ingredients.</SubTitle>
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {QUIZ_OPTIONS.allergens.map((allergen) => (
                <PillOption
                  key={allergen}
                  label={allergen}
                  selected={quiz.allergens.includes(allergen)}
                  onClick={() =>
                    handleCheckboxChange("allergens", allergen)
                  }
                />
              ))}
            </div>
            <div className="max-w-md mx-auto bg-white p-2 rounded-pill border border-gray-300 flex items-center shadow-sm focus-within:ring-1 focus-within:ring-black focus-within:border-black">
              <input
                type="text"
                value={customAllergen}
                onChange={(e) => setCustomAllergen(e.target.value)}
                placeholder="Type other ingredient (e.g. Retinol)"
                className="flex-1 bg-transparent border-none focus:ring-0 px-4 text-gray-700 placeholder-gray-400 font-['Poppins'] text-sm"
              />
              <button
                onClick={handleAddCustomAllergen}
                className="bg-black text-white px-5 py-2 rounded-pill text-xs font-bold uppercase tracking-wide hover:bg-gray-800 transition"
              >
                Add
              </button>
            </div>
            {quiz.allergens.filter((a) => !QUIZ_OPTIONS.allergens.includes(a))
              .length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {quiz.allergens
                  .filter((a) => !QUIZ_OPTIONS.allergens.includes(a))
                  .map((a) => (
                    <span
                      key={a}
                      className="bg-gray-100 text-gray-600 px-3 py-1 rounded-pill text-xs font-['Poppins'] flex items-center gap-2"
                    >
                      {a}
                      <button
                        onClick={() => handleCheckboxChange("allergens", a)}
                        className="hover:text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
              </div>
            )}
            <div className="flex items-center justify-between w-full max-w-lg mx-auto mt-8 pb-8">
              <button
                onClick={() => setStep(3)}
                className="text-gray-400 font-['Poppins'] hover:text-black underline-offset-4 hover:underline text-sm"
              >
                Back
              </button>
              <button
                onClick={() => setStep(5)}
                className="bg-[#3E3328] text-white px-10 py-3 rounded-pill font-bold tracking-wide hover:bg-[#2c241b] transition-all shadow-md"
              >
                NEXT
              </button>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="animate-fade-in-up">
            <SectionTitle>Eye area concerns?</SectionTitle>
            <SubTitle>Specific needs for the delicate eye area.</SubTitle>
            <div className="flex flex-wrap justify-center gap-3">
              {QUIZ_OPTIONS.eyeConcerns.map((opt) => (
                <PillOption
                  key={opt}
                  label={opt}
                  selected={quiz.eyeConcerns.includes(opt)}
                  onClick={() =>
                    handleCheckboxChange("eyeConcerns", opt)
                  }
                />
              ))}
            </div>
            <div className="flex items-center justify-between w-full max-w-lg mx-auto mt-8 pb-8">
              <button
                onClick={() => setStep(4)}
                className="text-gray-400 font-['Poppins'] hover:text-black underline-offset-4 hover:underline text-sm"
              >
                Back
              </button>
              <button
                onClick={() => setStep(6)}
                className="bg-[#3E3328] text-white px-10 py-3 rounded-pill font-bold tracking-wide hover:bg-[#2c241b] transition-all shadow-md"
              >
                NEXT
              </button>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="animate-fade-in-up">
            <SectionTitle>Pregnancy & Nursing</SectionTitle>
            <SubTitle>We ensure recommendations are safe for you and baby.</SubTitle>
            <div className="flex justify-center gap-4">
              {QUIZ_OPTIONS.pregnancy.map((opt) => (
                <button
                  key={opt}
                  onClick={() =>
                    setQuiz((p) => ({ ...p, pregnancy: opt }))
                  }
                  className={`w-32 py-3 rounded-pill border text-lg font-['Cinzel'] font-bold transition-all duration-300
                    ${
                      quiz.pregnancy === opt
                        ? "bg-[#1a1a1a] text-white border-[#1a1a1a] shadow-lg scale-105"
                        : "bg-white text-gray-700 border-gray-200 hover:border-black"
                    }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between w-full max-w-lg mx-auto mt-8 pb-8">
              <button
                onClick={() => setStep(5)}
                className="text-gray-400 font-['Poppins'] hover:text-black underline-offset-4 hover:underline text-sm"
              >
                Back
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !quiz.pregnancy}
                className="bg-[#3E3328] text-white px-12 py-3 rounded-pill font-bold tracking-wide hover:bg-[#2c241b] disabled:opacity-50 transition-all shadow-md"
              >
                {isSaving ? "ANALYZING..." : "SEE RESULTS"}
              </button>
            </div>
            {error && (
              <p className="text-red-500 mt-4 text-center font-['Poppins'] text-sm">
                {error}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const progress = Math.round(((step - 1) / 6) * 100);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full max-w-4xl flex items-center justify-between mb-6 px-4 md:px-0">
        <div className="h-1.5 w-full mr-4 bg-gray-200 rounded-pill overflow-hidden">
          <div
            style={{ width: `${progress}%` }}
            className="h-full bg-black transition-all duration-500 ease-out"
          ></div>
        </div>
        <span className="font-['Poppins'] font-medium text-sm text-gray-400 whitespace-nowrap">
          {progress}% Completed
        </span>
      </div>
      <div className="w-full max-w-4xl px-6">{renderStep()}</div>
    </div>
  );
}
