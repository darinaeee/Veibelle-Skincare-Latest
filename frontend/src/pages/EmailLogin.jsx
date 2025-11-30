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
      // 👇 Use whatever domain the app is currently running on
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

      // Save email for later (History page)
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
    <div className="flex items-center justify-center min-h-screen bg-[#fff5f8]">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center mb-4">
          Sign in to VeiBelle
        </h2>

        <form onSubmit={sendMagicLink} className="space-y-4">
          <input
            type="email"
            required
            placeholder="you@example.com"
            className="w-full border rounded-lg p-2 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            type="submit"
            disabled={isSending || !email}
            className="w-full bg-black text-white rounded-lg py-2 hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? "Sending..." : "Send Magic Link"}
          </button>
        </form>

        {status === "sent" && (
          <p className="mt-3 text-center text-sm text-green-600">
            ✨ Magic link sent! Check your email and open the link on this
            device/browser.
          </p>
        )}

        {status === "error" && (
          <p className="mt-3 text-center text-sm text-red-500">
            {errorMsg}
          </p>
        )}
      </div>
    </div>
  );
};

export default EmailLogin;
