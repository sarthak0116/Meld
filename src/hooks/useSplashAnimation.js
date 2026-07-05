import { useState, useRef, useEffect, useCallback } from "react";

const ANIM_DURATION = 600;
const SPLASH_HOLD = 2000;

export default function useSplashAnimation() {
  const [phase, setPhase] = useState("splash"); // "splash" → "animating" → "done"
  const splashLogoRef = useRef(null);
  const navLogoRef = useRef(null);
  const [navLogoVisible, setNavLogoVisible] = useState(false);

  const computeTransform = useCallback(() => {
    if (!splashLogoRef.current || !navLogoRef.current) {
      return { translateX: 0, translateY: 0, scale: 1 };
    }
    const from = splashLogoRef.current.getBoundingClientRect();
    const to = navLogoRef.current.getBoundingClientRect();
    return {
      translateX: to.left + to.width / 2 - (from.left + from.width / 2),
      translateY: to.top + to.height / 2 - (from.top + from.height / 2),
      scale: to.height / from.height,
    };
  }, []);

  useEffect(() => {
    if (phase !== "splash") return;
    const t = setTimeout(() => {
      setPhase("animating");
      setTimeout(() => {
        setPhase("done");
        setNavLogoVisible(true);
      }, ANIM_DURATION);
    }, SPLASH_HOLD);
    return () => clearTimeout(t);
  }, [phase]);

  return {
    phase,
    splashLogoRef,
    navLogoRef,
    navLogoVisible,
    computeTransform,
    animDuration: ANIM_DURATION,
  };
}
