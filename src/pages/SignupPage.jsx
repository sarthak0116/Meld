import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import HudBackground from "../components/arena/HudBackground";

// ── Shared form primitives ────────────────────────────────────────────────────

const EyeOpen = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const EyeClosed = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
);

function HudInput({ id, label, type = "text", value, onChange, placeholder, error, autoComplete, suffix }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block font-['Orbitron'] text-[10px] font-black tracking-[2px] text-[#0b0c0b]/50 uppercase"
      >
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute -top-px -left-px h-2 w-2 border-l border-t border-[#0b0c0b]/30 z-10" />
        <span className="pointer-events-none absolute -bottom-px -right-px h-2 w-2 border-r border-b border-[#0b0c0b]/30 z-10" />
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full bg-[#0b0c0b]/5 border px-4 py-3 font-['Share_Tech_Mono'] text-sm text-[#0b0c0b] placeholder-[#0b0c0b]/30 outline-none transition-all focus:bg-[#0b0c0b]/8 ${
            suffix ? "pr-11" : ""
          } ${
            error
              ? "border-red-500/50 focus:border-red-500/80"
              : "border-[#0b0c0b]/20 focus:border-[#e53e3e]/60"
          }`}
          style={{ borderRadius: 0 }}
        />
        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0b0c0b]/40 hover:text-[#0b0c0b] transition-colors cursor-pointer">
            {suffix}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1.5 font-['Share_Tech_Mono'] text-[11px] text-red-500/80">// {error}</p>
      )}
    </div>
  );
}

// ── Password strength ─────────────────────────────────────────────────────────

function getStrength(pw) {
  if (!pw) return { level: 0, label: "", color: "" };
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (s <= 2) return { level: 1, label: "WEAK",   color: "bg-red-500" };
  if (s <= 3) return { level: 2, label: "MEDIUM",  color: "bg-yellow-500" };
  return        { level: 3, label: "STRONG", color: "bg-green-600" };
}

// ── Validation ────────────────────────────────────────────────────────────────

function validate({ username, email, password, confirmPassword, terms }) {
  const e = {};
  if (!username.trim()) e.username = "username required";
  else if (username.length < 3 || username.length > 20) e.username = "3–20 characters";
  else if (!/^[a-zA-Z0-9_]+$/.test(username)) e.username = "letters, numbers & underscores only";
  if (!email.trim()) e.email = "email required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "invalid email format";
  if (!password) e.password = "password required";
  else if (password.length < 8) e.password = "minimum 8 characters";
  if (!confirmPassword) e.confirmPassword = "please confirm password";
  else if (confirmPassword !== password) e.confirmPassword = "passwords do not match";
  if (!terms) e.terms = "you must agree to continue";
  return e;
}

// ─────────────────────────────────────────────────────────────────────────────

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const strength = getStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate({ username, email, password, confirmPassword, terms });
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setIsLoading(true);
    setError("");
    try {
      await signup(username, email, password);
      navigate("/arena");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center py-12"
      style={{ background: "#cbd4cc", color: "#0b0c0b", fontFamily: "'Share Tech Mono', monospace" }}
    >
      <HudBackground light={true} />

      {/* Back to home */}
      <div className="absolute top-6 left-4 sm:left-[60px] z-20">
        <Link
          to="/"
          className="font-['Rajdhani'] text-[11px] font-bold tracking-[3px] text-[#0b0c0b]/40 uppercase no-underline hover:text-[#0b0c0b] transition-colors"
        >
          ← MELD
        </Link>
      </div>

      {/* Page label */}
      <div className="absolute top-6 right-4 sm:right-[60px] z-20 font-['Orbitron'] text-[10px] font-black tracking-[3px] text-[#0b0c0b]/25 uppercase">
        NEW PLAYER <span className="text-[#e53e3e]">+</span>
      </div>

      {/* Form panel */}
      <div className="relative z-10 w-full max-w-sm px-4">
        <div className="relative bg-[#cbd4cc] border border-[#0b0c0b]/15 px-8 py-10">
          {/* Corner brackets */}
          <span className="absolute top-0 left-0 h-4 w-4 border-l-2 border-t-2 border-[#0b0c0b]/50" />
          <span className="absolute top-0 right-0 h-4 w-4 border-r-2 border-t-2 border-[#0b0c0b]/50" />
          <span className="absolute bottom-0 left-0 h-4 w-4 border-l-2 border-b-2 border-[#0b0c0b]/50" />
          <span className="absolute bottom-0 right-0 h-4 w-4 border-r-2 border-b-2 border-[#0b0c0b]/50" />

          {/* Header */}
          <div className="mb-8">
            <p className="font-['Orbitron'] text-[10px] font-black tracking-[3px] text-[#0b0c0b]/40 uppercase mb-2">
              01 // REGISTRATION
            </p>
            <h1 className="font-['Orbitron'] text-2xl font-black tracking-[1px] text-[#0b0c0b] uppercase">
              JOIN MELD
            </h1>
            <div className="mt-2 h-px w-12 bg-[#e53e3e]" style={{ boxShadow: "0 0 8px rgba(229,62,62,0.5)" }} />
            <p className="mt-3 font-['Share_Tech_Mono'] text-[12px] text-[#0b0c0b]/40">
              Create your account and start competing
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <HudInput
              id="su-username"
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="CoolGamer_99"
              autoComplete="username"
              error={errors.username}
            />

            <HudInput
              id="su-email"
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email}
            />

            <div>
              <HudInput
                id="su-password"
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                error={errors.password}
                suffix={
                  <button type="button" onClick={() => setShowPassword(v => !v)} aria-label="Toggle password" className="bg-transparent border-none text-[#cbd4cc]/40 hover:text-white cursor-pointer">
                    {showPassword ? <EyeOpen /> : <EyeClosed />}
                  </button>
                }
              />
              {/* Strength bar */}
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[1, 2, 3].map((n) => (
                      <div
                        key={n}
                        className={`h-0.5 flex-1 transition-colors duration-300 ${strength.level >= n ? strength.color : "bg-[#0b0c0b]/15"}`}
                      />
                    ))}
                  </div>
                  <p className={`mt-1 font-['Orbitron'] text-[9px] font-black tracking-[2px] ${
                    strength.level === 1 ? "text-red-500" : strength.level === 2 ? "text-yellow-500" : "text-green-600"
                  }`}>
                    {strength.label}
                  </p>
                </div>
              )}
            </div>

            <HudInput
              id="su-confirm"
              label="Confirm Password"
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              error={errors.confirmPassword}
              suffix={
                <button type="button" onClick={() => setShowConfirm(v => !v)} aria-label="Toggle confirm password" className="bg-transparent border-none text-[#cbd4cc]/40 hover:text-white cursor-pointer">
                  {showConfirm ? <EyeOpen /> : <EyeClosed />}
                </button>
              }
            />

            {/* Terms */}
            <div>
              <label className="flex cursor-pointer items-start gap-2.5 font-['Share_Tech_Mono'] text-[11px] text-[#0b0c0b]/50">
                <input
                  type="checkbox"
                  checked={terms}
                  onChange={(e) => setTerms(e.target.checked)}
                  className="mt-0.5 h-3 w-3 flex-shrink-0"
                  style={{ accentColor: "#e53e3e" }}
                />
                <span>
                  I agree to the{" "}
                  <a href="#" className="text-[#0b0c0b] underline hover:text-[#e53e3e] transition-colors">Terms</a>
                  {" "}and{" "}
                  <a href="#" className="text-[#0b0c0b] underline hover:text-[#e53e3e] transition-colors">Privacy Policy</a>
                </span>
              </label>
              {errors.terms && (
                <p className="mt-1.5 font-['Share_Tech_Mono'] text-[11px] text-red-500/80">// {errors.terms}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="relative w-full bg-[#0b0c0b] py-3.5 font-['Orbitron'] text-[12px] font-black tracking-[3px] text-[#cbd4cc] uppercase transition-all duration-200 hover:bg-[#e53e3e] hover:text-[#0b0c0b] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-1"
              style={{ borderRadius: 0 }}
            >
              {isLoading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
            </button>
            {error && (
              <p className="font-['Share_Tech_Mono'] text-[11px] text-red-500/80">// {error}</p>
            )}
          </form>

          {/* Scanning bar */}
          <div className="mt-8 relative h-px w-full overflow-hidden bg-[#0b0c0b]/10">
            <div className="absolute top-0 h-full w-full bg-[#e53e3e]" style={{ animation: "searchScan 2.5s infinite linear", left: "-100%" }} />
          </div>

          {/* Footer link */}
          <p className="mt-5 text-center font-['Share_Tech_Mono'] text-[11px] text-[#0b0c0b]/40">
            Already have an account?{" "}
            <Link to="/login" className="text-[#0b0c0b] font-bold underline hover:text-[#e53e3e] transition-colors">
              SIGN IN
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
