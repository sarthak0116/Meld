import { useEffect, useRef } from "react";

/**
 * Drives the Jett-themed canvas particle system:
 *   - Wind swirl trails (arc strokes)
 *   - Updraft floating sparks
 *   - Floating kunai daggers that rotate toward the cursor
 */
export default function useParticleCanvas(canvasRef) {
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let rafId;

    // ── Resize ──────────────────────────────────────────────────────────────
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    window.addEventListener("mousemove", onMove);

    // ── Wind Trail ───────────────────────────────────────────────────────────
    class WindTrail {
      constructor() { this.reset(); }
      reset() {
        const w = canvas.width / devicePixelRatio;
        const h = canvas.height / devicePixelRatio;
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.speed = Math.random() * 1.5 + 0.8;
        this.angle = Math.random() * Math.PI * 2;
        this.opacity = 0;
        this.maxOpacity = Math.random() * 0.22 + 0.04;
        this.radius = Math.random() * 140 + 60;
        this.dir = Math.random() > 0.5 ? 1 : -1;
      }
      update() {
        const w = canvas.width / devicePixelRatio;
        const h = canvas.height / devicePixelRatio;
        this.angle += 0.004 * this.dir;
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        if (this.opacity < this.maxOpacity) this.opacity += 0.005;
        if (this.x < -150 || this.x > w + 150 || this.y < -150 || this.y > h + 150) this.reset();
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, this.angle, this.angle + 0.25);
        ctx.strokeStyle = `rgba(229,62,62,${this.opacity})`;
        ctx.lineWidth = Math.random() * 1.5 + 0.6;
        ctx.shadowBlur = 10;
        ctx.shadowColor = "rgba(229,62,62,0.4)";
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }

    // ── Updraft Spark ────────────────────────────────────────────────────────
    class Spark {
      constructor() { this.reset(true); }
      reset(init = false) {
        const w = canvas.width / devicePixelRatio;
        const h = canvas.height / devicePixelRatio;
        this.x = Math.random() * w;
        this.y = init ? Math.random() * h : h + 10;
        this.size = Math.random() * 3.5 + 1;
        this.vx = Math.random() * 0.6 - 0.3;
        this.vy = -(Math.random() * 1.4 + 0.6);
        this.opacity = 0;
        this.maxOpacity = Math.random() * 0.55 + 0.15;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.opacity < this.maxOpacity) this.opacity += 0.006;
        if (this.y < -10) this.reset();
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(229,62,62,${this.opacity})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = "rgba(229,62,62,0.7)";
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    // ── Kunai ────────────────────────────────────────────────────────────────
    class Kunai {
      constructor() { this.reset(true); }
      reset(init = false) {
        const w = canvas.width / devicePixelRatio;
        const h = canvas.height / devicePixelRatio;
        this.x = Math.random() * w;
        this.y = init ? Math.random() * h : Math.random() * (h * 0.8) + h * 0.1;
        this.size = Math.random() * 10 + 20;
        this.bobSpeed = Math.random() * 0.02 + 0.01;
        this.bobOffset = Math.random() * Math.PI * 2;
        this.driftX = Math.random() * 0.15 - 0.075;
        this.baseY = this.y;
        this.angle = 0;
        this.opacity = 0;
        this.maxOpacity = Math.random() * 0.5 + 0.3;
      }
      update() {
        const w = canvas.width / devicePixelRatio;
        const h = canvas.height / devicePixelRatio;
        this.x += this.driftX;
        this.bobOffset += this.bobSpeed;
        this.y = this.baseY + Math.sin(this.bobOffset) * 8;
        if (this.opacity < this.maxOpacity) this.opacity += 0.01;
        const dx = mouseRef.current.x - this.x;
        const dy = mouseRef.current.y - this.y;
        this.angle = Math.atan2(dy, dx) + Math.PI / 2;
        if (this.x < -40 || this.x > w + 40) this.reset();
      }
      draw() {
        const s = this.size;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.globalAlpha = this.opacity;

        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.lineTo(s * 0.28, -s * 0.35);
        ctx.lineTo(s * 0.12, 0);
        ctx.lineTo(s * 0.12, s * 0.45);
        ctx.lineTo(-s * 0.12, s * 0.45);
        ctx.lineTo(-s * 0.12, 0);
        ctx.lineTo(-s * 0.28, -s * 0.35);
        ctx.closePath();
        ctx.shadowBlur = 15;
        ctx.shadowColor = "rgba(229,62,62,0.7)";
        ctx.fillStyle = "rgba(235,252,255,0.85)";
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.lineTo(0, s * 0.35);
        ctx.strokeStyle = "rgba(229,62,62,0.9)";
        ctx.lineWidth = 1.8;
        ctx.stroke();

        ctx.restore();
      }
    }

    // ── Init particles ───────────────────────────────────────────────────────
    const trails = Array.from({ length: 12 }, () => new WindTrail());
    const sparks = Array.from({ length: 20 }, () => new Spark());
    const kunais = Array.from({ length: 5 }, () => new Kunai());

    const animate = () => {
      const w = canvas.width / devicePixelRatio;
      const h = canvas.height / devicePixelRatio;
      ctx.clearRect(0, 0, w, h);
      trails.forEach((t) => { t.update(); t.draw(); });
      sparks.forEach((p) => { p.update(); p.draw(); });
      kunais.forEach((k) => { k.update(); k.draw(); });
      rafId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, [canvasRef]);
}
