// src/pages/MfaVerify.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const MfaVerify = () => {
  const [factorId, setFactorId] = useState(null);
  const [challengeId, setChallengeId] = useState(null);
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("loading"); // loading | ready | verifying | error
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const prepareChallenge = async () => {
      setStatus("loading");
      setErrorMsg("");

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        navigate("/auth/login");
        return;
      }

      try {
        // 1. Get existing TOTP factor
        const { data: factors, error } = await supabase.auth.mfa.listFactors();
        if (error) {
          console.error("List factors error:", error);
          setStatus("error");
          setErrorMsg(error.message || "Could not load MFA settings.");
          return;
        }

        const totpFactor = factors.totp?.[0];
        if (!totpFactor) {
          navigate("/mfa/setup");
          return;
        }

        setFactorId(totpFactor.id);

        // 2. Create a challenge
        const { data: challenge, error: cErr } =
          await supabase.auth.mfa.challenge({ factorId: totpFactor.id });

        if (cErr) {
          console.error("Challenge error:", cErr);
          setStatus("error");
          setErrorMsg(
            cErr.message || "Could not start MFA verification."
          );
          return;
        }

        setChallengeId(challenge.id);
        setStatus("ready");
      } catch (err) {
        console.error(err);
        setStatus("error");
        setErrorMsg("Unexpected error. Please try again.");
      }
    };

    prepareChallenge();
  }, [navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!factorId || !challengeId) return;

    setStatus("verifying");
    setErrorMsg("");

    try {
      const { error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId,
        code: code.trim(),
      });

      if (error) {
        console.error("Verify error:", error);
        setStatus("ready");
        setErrorMsg(error.message || "Invalid code. Please try again.");
        return;
      }

      navigate("/"); // ✅ go to homepage
    } catch (err) {
      console.error(err);
      setStatus("ready");
      setErrorMsg("Unexpected error. Please try again.");
    }
  };

  const isVerifying = status === "verifying";

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-[#f0e7e0] px-8 py-10">
        <div className="mb-6 text-center">
          <h1 className="font-['Cinzel'] text-2xl text-[#212121] mb-2">
            Verify your MFA
          </h1>
          <p className="font-['Poppins'] text-xs text-gray-500 max-w-sm mx-auto">
            Open your authenticator app and enter the 6-digit MFA code for your
            VeiBelle account to continue securely.
          </p>
        </div>

        {status === "loading" && (
          <p className="text-center font-['Poppins'] text-xs text-gray-500">
            Preparing your MFA challenge…
          </p>
        )}

        {status !== "loading" && (
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="code"
                className="block font-['Poppins'] text-xs font-medium text-gray-600 uppercase tracking-[0.16em]"
              >
                6-digit code
              </label>
              <input
                id="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                required
                placeholder="123456"
                className="w-full rounded-pill border border-gray-200 px-4 py-2.5 text-sm font-['Poppins'] text-gray-800 outline-none focus:ring-1 focus:ring-black focus:border-black transition"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={isVerifying || code.length < 6}
              className="w-full rounded-pill bg-[#1a1a1a] text-white py-2.5 text-sm font-['Poppins'] font-semibold tracking-wide hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isVerifying ? "Verifying…" : "Verify & Continue"}
            </button>
          </form>
        )}

        <div className="mt-4 min-h-[40px]">
          {status === "error" && (
            <p className="text-center text-xs font-['Poppins'] text-red-600 bg-red-50 border border-red-100 rounded-2xl px-3 py-2">
              {errorMsg}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MfaVerify;
