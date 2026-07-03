document.addEventListener('DOMContentLoaded', () => {
  
  // ==========================================
  // 1. Custom Cursor Interactions
  // ==========================================
  const cursor = document.querySelector('.custom-cursor');
  const cursorDot = document.querySelector('.custom-cursor-dot');
  
  let mouseX = 0;
  let mouseY = 0;
  let cursorX = 0;
  let cursorY = 0;
  
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Immediate response for dot
    cursorDot.style.left = `${mouseX}px`;
    cursorDot.style.top = `${mouseY}px`;
  });
  
  // Smooth lerp animation for the outer cursor circle
  function animateCursor() {
    const dx = mouseX - cursorX;
    const dy = mouseY - cursorY;
    
    cursorX += dx * 0.15;
    cursorY += dy * 0.15;
    
    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;
    
    requestAnimationFrame(animateCursor);
  }
  animateCursor();
  
  // Cursor Hover Effects
  const hoverables = document.querySelectorAll('a, button, .lang-option, .video-preview-thumbnail, .qr-block');
  hoverables.forEach(item => {
    item.addEventListener('mouseenter', () => {
      cursor.classList.add('hovered');
    });
    item.addEventListener('mouseleave', () => {
      cursor.classList.remove('hovered');
    });
  });

  // ==========================================
  // 1.5 Real-time Color-Keying (Solid Black -> Transparent)
  // ==========================================
  function processTransparentLayer(imageUrl, canvasElement) {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      const ctx = canvasElement.getContext('2d');
      // Set canvas dimensions to match the source image for high DPI crispness
      canvasElement.width = img.naturalWidth;
      canvasElement.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, canvasElement.width, canvasElement.height);
      const data = imgData.data;

      // Color keying: strip out solid magenta (#ff00ff) background pixels smoothly
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];

        // Magenta metric: (R + B) - 2 * G
        // Saturated magenta gives high positive values, greys/skins/whites give near 0 or negative
        const magentaScore = (r + b) - 2 * g;
        const threshold = 110; // Cutoff score for background magenta
        const feather = 40;    // Smooth blending range

        if (magentaScore > threshold + feather) {
          data[i+3] = 0; // Fully transparent
        } else if (magentaScore > threshold) {
          const factor = 1 - (magentaScore - threshold) / feather;
          data[i+3] = Math.round(data[i+3] * factor); // Fade transition
        }
      }
      ctx.putImageData(imgData, 0, 0);
    };
  }

  const canvasJett = document.getElementById('canvas-jett');
  if (canvasJett) processTransparentLayer('jett.png', canvasJett);

  const canvasShadow = document.getElementById('canvas-shadow');
  if (canvasShadow) processTransparentLayer('jett.png', canvasShadow);

  // ==========================================
  // 2. Character Slide Transition & Parallax
  // ==========================================
  const layerJett = document.querySelector('.layer-jett');
  const layerShadow = document.querySelector('.layer-shadow');
  const parallaxContainer = document.querySelector('.character-card-parallax');

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let introFinished = false;

  // Immediately start slide-in animation from center
  if (layerJett) layerJett.classList.add('sliding');
  if (layerShadow) layerShadow.classList.add('sliding');

  // Wait for the slide-in animation to complete (2.2s), then enable breathing and mouse parallax
  setTimeout(() => {
    if (layerJett) {
      layerJett.classList.remove('sliding');
      layerJett.classList.add('active-breathing');
    }
    if (layerShadow) {
      layerShadow.classList.remove('sliding');
      layerShadow.classList.add('active-breathing');
    }
    introFinished = true; // Enable mouse parallax
  }, 2200);

  window.addEventListener('mousemove', (e) => {
    if (!introFinished) return; // Prevent parallax moving while intro is playing
    const normX = (e.clientX / window.innerWidth) * 2 - 1;
    const normY = (e.clientY / window.innerHeight) * 2 - 1;

    // Base drift coordinates
    targetX = normX * 22;
    targetY = normY * 12;
  });

  function animateParallax() {
    currentX += (targetX - currentX) * 0.04; // Slightly slower, smoother movement
    currentY += (targetY - currentY) * 0.04;

    // Apply main parallax shift to the card container only when intro finishes
    if (parallaxContainer && introFinished) {
      parallaxContainer.style.transform = `rotateY(${currentX * 0.05}deg) rotateX(${-currentY * 0.05}deg)`;
    }

    if (layerJett && introFinished) {
      // Translate Jett dynamically centered relative to her 20% CSS offset
      layerJett.style.transform = `translate3d(${currentX * 0.9}px, ${currentY * 0.6}px, 0)`;
    }

    requestAnimationFrame(animateParallax);
  }
  animateParallax();

  // ==========================================
  // 3. Jett's Wind Storm & Kunai Ability Canvas
  // ==========================================
  const canvas = document.getElementById('smoke-particles-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let windTrails = [];
    let updraftParticles = [];
    let kunais = [];
    
    function resizeCanvas() {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Wind swirl particles
    class WindTrail {
      constructor(w, h) {
        this.reset(w, h);
      }
      reset(w, h) {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.length = Math.random() * 80 + 40;
        this.speed = Math.random() * 1.5 + 0.8;
        this.angle = Math.random() * Math.PI * 2;
        this.opacity = 0;
        this.maxOpacity = Math.random() * 0.22 + 0.04;
        this.fadeSpeed = 0.005;
        this.radius = Math.random() * 140 + 60;
        this.curveDirection = Math.random() > 0.5 ? 1 : -1;
      }
      update(w, h) {
        this.angle += 0.004 * this.curveDirection;
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        
        if (this.opacity < this.maxOpacity) {
          this.opacity += this.fadeSpeed;
        }
        if (this.x < -150 || this.x > w + 150 || this.y < -150 || this.y > h + 150) {
          this.reset(w, h);
        }
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, this.angle, this.angle + 0.25);
        ctx.strokeStyle = `rgba(0, 229, 255, ${this.opacity})`;
        ctx.lineWidth = Math.random() * 1.5 + 0.6;
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(0, 229, 255, 0.4)';
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }

    // Updraft floating sparks
    class WindParticle {
      constructor(w, h) {
        this.reset(w, h);
        this.y = Math.random() * h;
      }
      reset(w, h) {
        this.x = Math.random() * w;
        this.y = h + 10;
        this.size = Math.random() * 3.5 + 1;
        this.speedX = Math.random() * 0.6 - 0.3;
        this.speedY = -(Math.random() * 1.4 + 0.6);
        this.opacity = 0;
        this.maxOpacity = Math.random() * 0.55 + 0.15;
        this.fadeSpeed = 0.006;
      }
      update(w, h) {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.opacity < this.maxOpacity) this.opacity += this.fadeSpeed;
        if (this.y < -10) this.reset(w, h);
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 229, 255, ${this.opacity})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(0, 229, 255, 0.7)';
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    // Jett's Blade Storm Floating Daggers
    class Kunai {
      constructor(w, h) {
        this.reset(w, h);
        this.x = Math.random() * w;
        this.y = Math.random() * h;
      }
      reset(w, h) {
        this.x = Math.random() * w;
        this.y = Math.random() * (h * 0.8) + (h * 0.1);
        this.size = Math.random() * 10 + 20;
        this.bobSpeed = Math.random() * 0.02 + 0.01;
        this.bobOffset = Math.random() * Math.PI * 2;
        this.driftSpeedX = Math.random() * 0.15 - 0.075;
        this.baseY = this.y;
        this.angle = 0;
        this.opacity = 0;
        this.maxOpacity = Math.random() * 0.5 + 0.3;
      }
      update(w, h, mX, mY) {
        this.x += this.driftSpeedX;
        this.bobOffset += this.bobSpeed;
        this.y = this.baseY + Math.sin(this.bobOffset) * 8;

        if (this.opacity < this.maxOpacity) this.opacity += 0.01;

        const dx = mX - this.x;
        const dy = mY - this.y;
        this.angle = Math.atan2(dy, dx) + Math.PI / 2;

        if (this.x < -40 || this.x > w + 40) {
          this.reset(w, h);
        }
      }
      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.globalAlpha = this.opacity;

        ctx.beginPath();
        ctx.moveTo(0, -this.size);
        ctx.lineTo(this.size * 0.28, -this.size * 0.35);
        ctx.lineTo(this.size * 0.12, 0);
        ctx.lineTo(this.size * 0.12, this.size * 0.45);
        ctx.lineTo(-this.size * 0.12, this.size * 0.45);
        ctx.lineTo(-this.size * 0.12, 0);
        ctx.lineTo(-this.size * 0.28, -this.size * 0.35);
        ctx.closePath();
        
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(0, 229, 255, 0.7)';
        ctx.fillStyle = 'rgba(235, 252, 255, 0.85)';
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(0, -this.size);
        ctx.lineTo(0, this.size * 0.35);
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.9)';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        ctx.restore();
      }
    }

    const w = canvas.width / window.devicePixelRatio;
    const h = canvas.height / window.devicePixelRatio;

    for (let i = 0; i < 12; i++) {
      windTrails.push(new WindTrail(w, h));
    }
    for (let i = 0; i < 20; i++) {
      updraftParticles.push(new WindParticle(w, h));
    }
    for (let i = 0; i < 5; i++) {
      kunais.push(new Kunai(w, h));
    }
    
    function animateParticles() {
      const wCur = canvas.width / window.devicePixelRatio;
      const hCur = canvas.height / window.devicePixelRatio;
      ctx.clearRect(0, 0, wCur, hCur);
      
      windTrails.forEach(t => {
        t.update(wCur, hCur);
        t.draw();
      });

      updraftParticles.forEach(p => {
        p.update(wCur, hCur);
        p.draw();
      });

      const canvasRect = canvas.getBoundingClientRect();
      const relativeMouseX = mouseX - canvasRect.left;
      const relativeMouseY = mouseY - canvasRect.top;

      kunais.forEach(k => {
        k.update(wCur, hCur, relativeMouseX, relativeMouseY);
        k.draw();
      });
      
      requestAnimationFrame(animateParticles);
    }
    animateParticles();
  }

  // ==========================================
  // 4. Glitch Effect & Trailer Play Modal
  // ==========================================
  const startPlayingBtn = document.getElementById('start-playing-btn');
  
  if (startPlayingBtn) {
    startPlayingBtn.addEventListener('click', () => {
      // Simulate high-tech UI feedback (glitch & ripple)
      startPlayingBtn.style.transform = 'scale(0.97)';
      setTimeout(() => {
        startPlayingBtn.style.transform = '';
      }, 100);
      
      // Trigger a beautiful tech alert notification
      createTechAlert('SEARCHING FOR OPPONENTS...', 'ESTABLISHING SECURE MATCHMAKING LOBBY');
    });
  }
  
  function createTechAlert(headerMsg, subMsg) {
    const alertBox = document.createElement('div');
    alertBox.style.cssText = `
      position: fixed;
      bottom: 40px;
      right: 40px;
      background: var(--text-color);
      color: var(--bg-color);
      padding: 15px 25px;
      font-family: var(--font-tech);
      border-left: 4px solid var(--accent-color);
      z-index: 9999;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
      transform: translateY(100px);
      opacity: 0;
      transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    `;
    
    alertBox.innerHTML = `
      <div style="font-size: 11px; font-weight:900; letter-spacing:2px; margin-bottom: 4px;">${headerMsg}</div>
      <div style="font-family: var(--font-mono); font-size: 9px; opacity: 0.6; letter-spacing: 1px;">${subMsg}</div>
    `;
    
    document.body.appendChild(alertBox);
    
    // Trigger transition
    requestAnimationFrame(() => {
      alertBox.style.transform = 'translateY(0)';
      alertBox.style.opacity = '1';
    });
    
    // Auto remove
    setTimeout(() => {
      alertBox.style.transform = 'translateY(30px)';
      alertBox.style.opacity = '0';
      setTimeout(() => alertBox.remove(), 500);
    }, 3500);
  }

  // ==========================================
  // 5. Active States & Nav Highlight Sequencer
  // ==========================================
  const navNumbers = document.querySelectorAll('.nav-num');
  navNumbers.forEach(num => {
    num.addEventListener('click', () => {
      navNumbers.forEach(n => n.classList.remove('active'));
      num.classList.add('active');
      createTechAlert(`NAVIGATING TO SECTOR ${num.textContent}`, `INDEX NODE REGISTERED`);
    });
  });
  
  const languageOptions = document.querySelectorAll('.lang-option');
  languageOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      languageOptions.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
    });
  });

});
