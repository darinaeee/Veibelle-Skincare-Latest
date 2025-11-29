import React from "react";
import { useNavigate } from "react-router-dom";
import heroImage from "../assets/quiz-hero.png";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen">

      {/* Left Image */}
      <div className="hidden md:block md:w-1/2 h-screen">
        <img
          src={heroImage}
          alt="Hero"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right Content */}
      <div className="flex flex-col justify-center md:w-1/2 px-12 bg-[#f5efee]">

        {/* MATCHES YOUR EXAMPLE */}
        <h1 className="font-['Playfair_Display'] text-4xl md:text-5xl mb-4 text-[#2c2c2c] leading-tight">
          Glow with Confidence – Backed
          <br /> by Smart Recommendations
        </h1>

        <p className="font-['Inter'] text-base md:text-lg mb-8 text-gray-700 max-w-md leading-relaxed">
          Just take this quick and easy quiz to find the products that will work
          magic on your skin.
        </p>

        {/* BUTTON STYLE LIKE YOUR EXAMPLE */}
        <button
          onClick={() => navigate("/quiz")}
          className="bg-[#4a3b27] text-white px-8 py-2.5 rounded-full 
                     font-['Inter'] tracking-wide text-sm shadow-sm
                     hover:bg-[#3a2f20] transition-all w-fit"
        >
          START THE QUIZ
        </button>

      </div>
    </div>
  );
};

export default Home;
