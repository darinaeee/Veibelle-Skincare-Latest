// src/pages/AuthCallback.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      // 1. Make sure we have a session after magic link
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        console.error("No session after callback:", error);
        navigate("/auth/login");
        return;
      }

      // 2. Check existing MFA factors (TOTP)
      const { data: factors, error: fErr } =
        await supabase.auth.mfa.listFactors();

      if (fErr) {
        console.error("Error listing MFA factors:", fErr);
        navigate("/auth/login");
        return;
      }

      const hasTOTP = factors.totp && factors.totp.length > 0;

      if (!hasTOTP) {
        // First time: user must enroll TOTP
        navigate("/mfa/setup");
      } else {
        // Already enrolled: user must verify TOTP
        navigate("/mfa/verify");
      }
    };

    handleAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-[#f0e7e0] px-8 py-10 text-center">
        <h1 className="font-['Cinzel'] text-2xl text-[#212121] mb-3">
          Verifying your session…
        </h1>
        <p className="font-['Poppins'] text-xs text-gray-500">
          Please wait while we confirm your login and check your MFA status.
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;
