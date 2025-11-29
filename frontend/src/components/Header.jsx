// src/components/Header.jsx
import { Link, NavLink, useLocation } from "react-router-dom";

const Header = () => {
  const location = useLocation();

  return (
    <>
      <header className="fixed top-0 left-0 w-full bg-[#e9d4d4]/95 backdrop-blur-md text-[#1a1a1a] shadow-sm z-50 rounded-b-2xl transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center relative">
          
          {/* Left Navigation */}
          <nav className="flex gap-8 font-[Poppins] text-[17px] font-medium tracking-wide">
            <NavLink
              to="/ingredients"
              className={({ isActive }) =>
                `no-underline transition-all duration-300 ${
                  isActive
                    ? "text-black font-semibold border-b-2 border-black"
                    : "text-gray-700 hover:text-black hover:scale-105"
                }`
              }
            >
              Ingredients
            </NavLink>

            <NavLink
              to="/skincare101"
              className={({ isActive }) =>
                `no-underline transition-all duration-300 ${
                  isActive
                    ? "text-black font-semibold border-b-2 border-black"
                    : "text-gray-700 hover:text-black hover:scale-105"
                }`
              }
            >
              Skincare 101
            </NavLink>
          </nav>

          {/* Center Brand - now same as footer (Pinyon Script) */}
          <Link
            to="/"
            className="absolute left-1/2 transform -translate-x-1/2 pinyon-script-regular text-[34px] md:text-[42px] text-black tracking-widest no-underline hover:opacity-80 transition-opacity"
          >
            VeiBelle
          </Link>

          {/* Right Section */}
          <div className="flex items-center gap-6">
            <Link
              to="/history"
              className="text-[17px] font-[Poppins] font-medium text-gray-800 no-underline hover:text-black transition-colors relative group"
            >
              History
              <span className="absolute left-0 bottom-[-2px] w-0 h-[1px] bg-black transition-all duration-300 group-hover:w-full"></span>
            </Link>

            <Link
              to="/quiz"
              className="bg-[#1a1a1a] text-white px-6 py-2.5 rounded-full text-[17px] font-[Poppins] font-medium tracking-wide shadow-lg hover:bg-[#333] hover:shadow-xl active:scale-95 transition-all duration-300 no-underline"
            >
              Take the Quiz
            </Link>
          </div>
        </div>
      </header>

      {/* Spacer so content does not hide behind fixed header */}
      <div className="h-[82px]"></div>
    </>
  );
};

export default Header;
