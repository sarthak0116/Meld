/**
 * Button — app-wide reusable button component.
 *
 * variants:
 *   "primary"  — solid dark fill, cyan glow on hover  (default)
 *   "ghost"    — transparent, border only
 *   "hud"      — the corner-bracket HUD style from the arena page
 *
 * sizes:
 *   "sm" | "md" (default) | "lg"
 */
export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  onClick,
  type = "button",
  disabled = false,
  ...props
}) {
  const base =
    "relative inline-flex items-center justify-center font-bold tracking-widest uppercase transition-all duration-300 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none";

  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-7 py-3.5 text-xs",
    lg: "px-10 py-4 text-sm",
  };

  const variants = {
    primary:
      "bg-[#0b0c0b] text-[#cbd4cc] border border-transparent hover:bg-[#e53e3e] hover:text-black hover:shadow-[0_0_30px_rgba(229,62,62,0.5)] active:scale-95",

    ghost:
      "bg-transparent text-[#0b0c0b] border border-[#0b0c0b]/30 hover:border-[#0b0c0b] hover:bg-[#0b0c0b]/5 active:scale-95",

    hud: "bg-[#0b0c0b] text-[#cbd4cc] border-none hover:bg-[#e53e3e] hover:text-black hover:shadow-[0_15px_40px_rgba(229,62,62,0.4)] active:scale-[0.97]",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {/* HUD corner brackets — only rendered for the "hud" variant */}
      {variant === "hud" && (
        <span className="pointer-events-none absolute -inset-1 border border-[#0b0c0b]/20 transition-all duration-300 group-hover:border-[#e53e3e] group-hover:-inset-1.5">
          <span className="absolute -left-px -top-px h-2 w-2 border-l-2 border-t-2 border-[#0b0c0b] transition-colors duration-300" />
          <span className="absolute -right-px -top-px h-2 w-2 border-r-2 border-t-2 border-[#0b0c0b] transition-colors duration-300" />
          <span className="absolute -bottom-px -left-px h-2 w-2 border-b-2 border-l-2 border-[#0b0c0b] transition-colors duration-300" />
          <span className="absolute -bottom-px -right-px h-2 w-2 border-b-2 border-r-2 border-[#0b0c0b] transition-colors duration-300" />
        </span>
      )}
      {children}
    </button>
  );
}
