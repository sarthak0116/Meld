import { useEffect, useRef } from "react";

/**
 * Drives the global custom cursor.
 * - Outer ring: lerp-follows mouse (smooth lag), expands on hover, pulses on click
 * - Inner dot: snaps to mouse immediately
 */
export default function useCustomCursor(hoverSelector = "a, button, [role='button'], select, label[for]") {
  const ringRef = useRef(null);
  const dotRef = useRef(null);

  useEffect(() => {
    const ring = ringRef.current;
    const dot = dotRef.current;
    if (!ring || !dot) return;

    // Only run on fine-pointer devices
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;
    let rafId;
    let isHovered = false;

    const setRingSize = (hovered, clicking = false) => {
      const size = clicking ? 24 : hovered ? 48 : 36;
      const margin = size / 2;
      ring.style.width = `${size}px`;
      ring.style.height = `${size}px`;
      ring.style.marginLeft = `-${margin}px`;
      ring.style.marginTop = `-${margin}px`;
    };

    const onMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = `${mouseX}px`;
      dot.style.top = `${mouseY}px`;
    };

    const lerp = () => {
      ringX += (mouseX - ringX) * 0.2;
      ringY += (mouseY - ringY) * 0.2;
      ring.style.left = `${ringX}px`;
      ring.style.top = `${ringY}px`;
      rafId = requestAnimationFrame(lerp);
    };
    rafId = requestAnimationFrame(lerp);

    const onOver = (e) => {
      if (e.target.closest(hoverSelector)) {
        isHovered = true;
        setRingSize(true);
      }
    };
    const onOut = (e) => {
      if (e.target.closest(hoverSelector)) {
        isHovered = false;
        setRingSize(false);
      }
    };
    const onDown = () => setRingSize(isHovered, true);
    const onUp   = () => setRingSize(isHovered, false);

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("mouseup", onUp);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("mouseup", onUp);
    };
  }, [hoverSelector]);

  return { ringRef, dotRef };
}
