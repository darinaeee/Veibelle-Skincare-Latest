// src/pages/MfaSetup.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const MfaSetup = () => {
  const [qrCode, setQrCode] = useState(null);
  const [factorId, setFactorId] = useState(null);
  const [challengeId, setChallengeId] = useState(null);
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("loading"); // loading | ready | verifying | error
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const enrollTotp = async () => {
      setStatus("loading");
      setErrorMsg("");

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        navigate("/auth/login");
        return;
      }

      try {
        // 1. Enroll a new TOTP factor
        const { data, error } = await supabase.auth.mfa.enroll({
          factorType: "totp",
          friendlyName: "veibelle-mfa",
        });

        if (error) {
          console.error("Enroll error:", error);
          setStatus("error");
          setErrorMsg(error.message || "Failed to start MFA setup.");
          return;
        }

        setFactorId(data.id);
        setQrCode(data.totp.qr_code);

        // 2. Create a challenge for this factor
        const { data: challenge, error: cErr } =
          await supabase.auth.mfa.challenge({ factorId: data.id });

        if (cErr) {
          console.error("Challenge error:", cErr);
          setStatus("error");
          setErrorMsg(
            cErr.message || "Failed to create MFA verification challenge."
          );
          return;
        }

        setChallengeId(challenge.id);
        setStatus("ready");
      } catch (err) {
        console.error(err);
        setStatus("error");
        setErrorMsg("Unexpected error happened. Please try again.");
      }
    };

    enrollTotp();
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

      alert("MFA has been enabled for your account ✨");
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
            Enable MFA for VeiBelle
          </h1>
          <p className="font-['Poppins'] text-xs text-gray-500 max-w-sm mx-auto">
            Scan the QR code using Google Authenticator or any TOTP-compatible
            app, then enter the 6-digit code to activate enhanced security for
            your VeiBelle profile.
          </p>
        </div>

        {status === "loading" && (
          <p className="text-center font-['Poppins'] text-xs text-gray-500">
            Preparing your MFA setup…
          </p>
        )}

        {status !== "loading" && qrCode && (
          <div className="flex justify-center mb-5">
            <img
              src={qrCode}
              alt="VeiBelle MFA QR Code"
              className="w-48 h-48 border border-gray-200 rounded-2xl p-2 bg-white"
            />
          </div>
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
              {isVerifying ? "Verifying…" : "Enable MFA"}
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

export default MfaSetup;
