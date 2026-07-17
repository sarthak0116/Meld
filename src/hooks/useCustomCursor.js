import { useEffect, useRef } from "react";

const INTERACTIVE = "a, button, [role='button'], select, label[for], input, textarea, [tabindex]:not([tabindex='-1'])";

/**
 * Drives the global custom cursor.
 *
 * Default state  — dashed ring (4 segments), 4px dot
 * Hover state    — ring fills solid white, grows to 44px, dot disappears
 * Click state    — ring shrinks to 20px (pulse feedback)
 *
 * Uses mix-blend-mode: exclusion so it inverts on both light & dark bgs.
 */
export default function useCustomCursor() {
  const ringRef  = useRef(null);
  const dotRef   = useRef(null);
  const labelRef = useRef(null);

  useEffect(() => {
    const ring  = ringRef.current;
    const dot   = dotRef.current;
    const label = labelRef.current;
    if (!ring || !dot) return;

    if (!window.matchMedia("(pointer: fine)").matches) return;

    let mouseX = 0, mouseY = 0;
    let ringX  = 0, ringY  = 0;
    let rafId;
    let hovering = false;

    // ── apply a state to the ring ──────────────────────────────────────────
    const applyState = (state) => {
      if (state === "hover") {
        ring.style.width      = "44px";
        ring.style.height     = "44px";
        ring.style.marginLeft = "-22px";
        ring.style.marginTop  = "-22px";
        // swap to solid filled circle — hide the SVG dashes, show solid bg
        ring.dataset.state = "hover";
        dot.style.opacity  = "0";
      } else if (state === "click") {
        ring.style.width      = "20px";
        ring.style.height     = "20px";
        ring.style.marginLeft = "-10px";
        ring.style.marginTop  = "-10px";
        ring.dataset.state = "click";
        dot.style.opacity  = "0";
      } else {
        ring.style.width      = "36px";
        ring.style.height     = "36px";
        ring.style.marginLeft = "-18px";
        ring.style.marginTop  = "-18px";
        ring.dataset.state = "default";
        dot.style.opacity  = "1";
      }
    };

    const onMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = `${mouseX}px`;
      dot.style.top  = `${mouseY}px`;
    };

    const lerp = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.left = `${ringX}px`;
      ring.style.top  = `${ringY}px`;
      rafId = requestAnimationFrame(lerp);
    };
    rafId = requestAnimationFrame(lerp);

    const onOver = (e) => {
      if (e.target.closest(INTERACTIVE)) {
        hovering = true;
        applyState("hover");
      }
    };
    const onOut = (e) => {
      if (e.target.closest(INTERACTIVE)) {
        hovering = false;
        applyState("default");
      }
    };
    const onDown = () => applyState("click");
    const onUp   = () => applyState(hovering ? "hover" : "default");

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout",  onOut);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("mouseup",   onUp);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout",  onOut);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("mouseup",   onUp);
    };
  }, []);

  return { ringRef, dotRef, labelRef };
}
