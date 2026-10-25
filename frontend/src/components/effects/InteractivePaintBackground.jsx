import React, { useRef, useEffect } from 'react';

/**
 * InteractivePaintBackground
 * Renders an organic, dynamic liquid paint-splatter simulation on an HTML5 canvas.
 * - Spawns fluid acrylic paint droplets and colorful splashes on mouse movement
 * - Floating ambient paint diffusion clouds in electric cobalt, magenta, cyan, and violet
 * - Click-to-splat bursting physics
 */
export default function InteractivePaintBackground({ className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    // Color palette for high-end vibrant paint splashes
    const colors = [
      { r: 37, g: 99, b: 235 },   // Royal Blue
      { r: 236, g: 72, b: 153 },  // Hot Magenta
      { r: 6, g: 182, b: 212 },   // Neon Cyan
      { r: 124, g: 58, b: 237 },  // Electric Violet
      { r: 245, g: 158, b: 11 },  // Luminous Gold
    ];

    // Splatter particles
    let particles = [];
    const MAX_PARTICLES = 160;

    class SplatterParticle {
      constructor(x, y, vx, vy, color, size, isBurst = false) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.size = size;
        this.initialSize = size;
        this.alpha = isBurst ? 0.9 : 0.75;
        this.decay = isBurst ? 0.008 : 0.012;
        this.drag = 0.96;
        this.splats = [];
        
        // Spawn small satellite micro-splats
        const splatCount = Math.floor(Math.random() * 4) + 2;
        for (let i = 0; i < splatCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.random() * size * 2.5;
          this.splats.push({
            dx: Math.cos(angle) * dist,
            dy: Math.sin(angle) * dist,
            r: Math.random() * (size * 0.35) + 1.5,
          });
        }
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= this.drag;
        this.vy *= this.drag;
        this.alpha -= this.decay;
        this.size = Math.max(0, this.size - 0.05);
      }

      draw(c) {
        if (this.alpha <= 0) return;
        c.save();
        c.globalAlpha = Math.max(0, this.alpha);
        c.fillStyle = `rgb(${this.color.r}, ${this.color.g}, ${this.color.b})`;

        // Main droplet blob
        c.beginPath();
        c.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        c.fill();

        // Satellite micro-droplets (paint splatter texture)
        for (const s of this.splats) {
          c.beginPath();
          c.arc(this.x + s.dx, this.y + s.dy, s.r, 0, Math.PI * 2);
          c.fill();
        }

        c.restore();
      }
    }

    // Ambient floating colorful paint clouds
    const ambientBlobs = [
      { x: width * 0.2, y: height * 0.3, r: 280, color: 'rgba(37, 99, 235, 0.25)', vx: 0.3, vy: 0.2 },
      { x: width * 0.8, y: height * 0.4, r: 320, color: 'rgba(124, 58, 237, 0.22)', vx: -0.25, vy: 0.35 },
      { x: width * 0.5, y: height * 0.7, r: 260, color: 'rgba(236, 72, 153, 0.18)', vx: 0.2, vy: -0.2 },
      { x: width * 0.1, y: height * 0.8, r: 220, color: 'rgba(6, 182, 212, 0.18)', vx: -0.15, vy: -0.15 },
    ];

    // Seed initial artistic paint splashes across the hero
    for (let i = 0; i < 25; i++) {
      const rx = Math.random() * width;
      const ry = Math.random() * height;
      const col = colors[Math.floor(Math.random() * colors.length)];
      const size = Math.random() * 12 + 6;
      particles.push(new SplatterParticle(rx, ry, (Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.5, col, size));
    }

    // Mouse Interaction: Splatter paint on cursor trail
    let lastX = -100;
    let lastY = -100;
    let throttleCounter = 0;

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      throttleCounter++;
      if (throttleCounter % 2 !== 0) return;

      const dx = x - lastX;
      const dy = y - lastY;
      const speed = Math.sqrt(dx * dx + dy * dy);
      lastX = x;
      lastY = y;

      if (speed > 2) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const spreadCount = Math.min(4, Math.floor(speed / 8) + 1);

        for (let i = 0; i < spreadCount; i++) {
          const vx = (Math.random() - 0.5) * 4 + dx * 0.15;
          const vy = (Math.random() - 0.5) * 4 + dy * 0.15;
          const size = Math.random() * 10 + 5;
          particles.push(new SplatterParticle(x, y, vx, vy, color, size));
        }

        if (particles.length > MAX_PARTICLES) {
          particles.splice(0, particles.length - MAX_PARTICLES);
        }
      }
    };

    // Click: Big artistic paint splash burst
    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      for (let i = 0; i < 22; i++) {
        const angle = Math.random() * Math.PI * 2;
        const vel = Math.random() * 9 + 3;
        const col = colors[Math.floor(Math.random() * colors.length)];
        const size = Math.random() * 14 + 6;
        particles.push(
          new SplatterParticle(
            x,
            y,
            Math.cos(angle) * vel,
            Math.sin(angle) * vel,
            col,
            size,
            true
          )
        );
      }
    };

    const targetEl = canvas.parentElement || canvas;
    targetEl.addEventListener('mousemove', handleMouseMove);
    targetEl.addEventListener('click', handleClick);

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw base fluid ambient paint clouds
      for (const b of ambientBlobs) {
        b.x += b.vx;
        b.y += b.vy;
        if (b.x < -100 || b.x > width + 100) b.vx *= -1;
        if (b.y < -100 || b.y > height + 100) b.vy *= -1;

        const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        grad.addColorStop(0, b.color);
        grad.addColorStop(1, 'rgba(15, 23, 42, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Draw & update interactive paint splatters
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw(ctx);
        if (p.alpha <= 0) {
          particles.splice(i, 1);
        }
      }

      // Continuous subtle ambient paint droplet generation
      if (Math.random() < 0.05 && particles.length < MAX_PARTICLES) {
        const rx = Math.random() * width;
        const ry = Math.random() * height;
        const col = colors[Math.floor(Math.random() * colors.length)];
        particles.push(new SplatterParticle(rx, ry, (Math.random() - 0.5) * 0.8, (Math.random() - 0.5) * 0.8, col, Math.random() * 8 + 4));
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      targetEl.removeEventListener('mousemove', handleMouseMove);
      targetEl.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-auto ${className}`}
      style={{ filter: 'blur(0.5px)' }}
    />
  );
}
