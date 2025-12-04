// src/pages/EmailLogin.jsx
import { useState } from "react";
import { supabase } from "../supabaseClient";

const EmailLogin = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [errorMsg, setErrorMsg] = useState("");

  const sendMagicLink = async (e) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    try {
      const redirectTo = `${window.location.origin}/auth/callback`;

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
        },
      });

      if (error) {
        console.error(error);
        setStatus("error");
        setErrorMsg(error.message || "Failed to send magic link.");
        return;
      }

      // Save email so Quiz & History can still read it if needed
      localStorage.setItem("veibelle_email", email);

      setStatus("sent");
    } catch (err) {
      console.error(err);
      setStatus("error");
      setErrorMsg("Unexpected error. Please try again.");
    }
  };

  const isSending = status === "sending";

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-[#f0e7e0] px-8 py-10">
        {/* Heading */}
        <div className="mb-6 text-center">
          <h1 className="font-['Cinzel'] text-2xl text-[#212121] mb-2">
            Sign in to VeiBelle
          </h1>
          <p className="font-['Poppins'] text-xs text-gray-500 max-w-sm mx-auto">
            Please enter your email address to receive a secure login link. Once
            you access the link from your inbox, you will complete Multi-Factor
            Authentication (MFA) before starting the skincare quiz.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={sendMagicLink} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block font-['Poppins'] text-xs font-medium text-gray-600 uppercase tracking-[0.16em]"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="you@example.com"
              className="w-full rounded-pill border border-gray-200 px-4 py-2.5 text-sm font-['Poppins'] text-gray-800 outline-none focus:ring-1 focus:ring-black focus:border-black transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isSending || !email}
            className="w-full rounded-pill bg-[#1a1a1a] text-white py-2.5 text-sm font-['Poppins'] font-semibold tracking-wide hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isSending ? "Sending magic link..." : "Send magic link"}
          </button>
        </form>

        {/* Status messages */}
        <div className="mt-4 min-h-[40px]">
          {status === "sent" && (
            <p className="text-center text-xs font-['Poppins'] text-green-700 bg-green-50 border border-green-100 rounded-2xl px-3 py-2">
              ✨ A secure login link has been sent. Open your email, follow the
              link, and you&apos;ll be redirected back to VeiBelle to complete
              your MFA verification.
            </p>
          )}

          {status === "error" && (
            <p className="text-center text-xs font-['Poppins'] text-red-600 bg-red-50 border border-red-100 rounded-pill px-3 py-2">
              {errorMsg}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailLogin;
