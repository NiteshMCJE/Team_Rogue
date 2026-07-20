(function() {
  'use strict';

  // --- LOADING ---
  window.addEventListener('load', () => {
    setTimeout(() => document.getElementById('loading-screen').classList.add('hidden'), 2200);
  });

  // --- PARTICLES ---
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');
  let w, h, particles = [];
  function resizeCanvas() { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.size = Math.random() * 2.2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.speedY = (Math.random() - 0.5) * 0.4;
      this.opacity = Math.random() * 0.5 + 0.1;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0 || this.x > w) this.speedX *= -1;
      if (this.y < 0 || this.y > h) this.speedY *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 191, 255, ${this.opacity})`;
      ctx.fill();
    }
  }
  for (let i = 0; i < 100; i++) particles.push(new Particle());
  function animateParticles() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animateParticles);
  }
  animateParticles();

  // --- MOUSE GLOW ---
  const glow = document.getElementById('mouse-glow');
  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  });

  // --- LOGIN ---
  const loginPage = document.getElementById('login-page');
  const mainSite = document.getElementById('main-site');
  const pwInput = document.getElementById('password-input');
  const loginBtn = document.getElementById('login-btn');
  const loginError = document.getElementById('login-error');
  const togglePw = document.getElementById('toggle-pw');

  loginPage.classList.remove('hidden');
  mainSite.classList.remove('visible');

  function attemptLogin() {
    const val = pwInput.value.trim();
    if (val === CONFIG.PASSWORD) {
      loginError.textContent = '';
      loginPage.classList.add('hidden');
      mainSite.classList.add('visible');
      loadGallery();
    } else {
      loginError.textContent = '⛔ wrong passkey';
      loginPage.querySelector('.login-card').classList.add('shake');
      setTimeout(() => loginPage.querySelector('.login-card').classList.remove('shake'), 500);
      pwInput.value = '';
      pwInput.focus();
    }
  }

  loginBtn.addEventListener('click', attemptLogin);
  pwInput.addEventListener('keydown', e => { if (e.key === 'Enter') attemptLogin(); });
  togglePw.addEventListener('click', () => {
    const type = pwInput.type === 'password' ? 'text' : 'password';
    pwInput.type = type;
    togglePw.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
  });

  // --- LOGOUT ---
  document.getElementById('logout-btn').addEventListener('click', () => {
    mainSite.classList.remove('visible');
    loginPage.classList.remove('hidden');
    pwInput.value = '';
    loginError.textContent = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // --- NAV ---
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('section');
  window.addEventListener('scroll', () => {
    let current = 'hero';
    sections.forEach(sec => {
      const top = sec.offsetTop - 150;
      if (window.scrollY >= top) current = sec.id;
    });
    navLinks.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  });
  document.getElementById('menu-toggle').addEventListener('click', () => {
    document.getElementById('nav-links').classList.toggle('open');
  });
  document.querySelectorAll('.nav-links a').forEach(a => a.addEventListener('click', () => {
    document.getElementById('nav-links').classList.remove('open');
  }));

  // --- SCROLL TOP ---
  const scrollBtn = document.getElementById('scroll-top');
  window.addEventListener('scroll', () => {
    scrollBtn.classList.toggle('show', window.scrollY > 600);
  });
  scrollBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // --- TYPING ---
  const subEl = document.getElementById('typing-sub');
  const text = CONFIG.SUBTITLE;
  let idx = 0;
  function typeEffect() {
    if (idx < text.length) {
      subEl.textContent += text.charAt(idx);
      idx++;
      setTimeout(typeEffect, 120);
    }
  }
  setTimeout(typeEffect, 800);

  // --- MEMBERS ---
  const membersContainer = document.getElementById('members-container');
  CONFIG.MEMBERS.forEach(m => {
    const card = document.createElement('div');
    card.className = 'member-card';
    card.innerHTML = `
      <img src="${m.img}" alt="${m.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect width=%22100%22 height=%22100%22 fill=%22%23111827%22/%3E%3Ctext x=%2230%22 y=%2260%22 fill=%22%236b7b8d%22 font-size=%2240%22%3E?%3C/text%3E%3C/svg%3E'" />
      <div class="member-name">${m.name}</div>
      <div class="member-role">${m.role}</div>
      <div class="member-desc">${m.desc}</div>
    `;
    membersContainer.appendChild(card);
  });

  // --- GALLERY ---
  const galleryContainer = document.getElementById('gallery-container');
  const uploadBtn = document.getElementById('upload-btn');
  const fileInput = document.getElementById('file-input');
  let galleryImages = [];

  async function fetchGallery() {
    try {
      const response = await fetch(CONFIG.API_URL);
      if (!response.ok) throw new Error('Failed to fetch gallery');
      const data = await response.json();
      return data.gallery || [];
    } catch (error) {
      console.error('Error fetching gallery:', error);
      return [];
    }
  }

  async function saveGallery(images) {
    try {
      const response = await fetch(CONFIG.API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gallery: images })
      });
      if (!response.ok) throw new Error('Failed to save gallery');
      const result = await response.json();
      return result.data.gallery || [];
    } catch (error) {
      console.error('Error saving gallery:', error);
      throw error;
    }
  }

  async function loadGallery() {
    galleryImages = await fetchGallery();
    renderGallery();
  }

  function renderGallery() {
    galleryContainer.innerHTML = '';
    if (galleryImages.length === 0) {
      galleryContainer.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: #94a3b8; background: var(--glass-bg); border-radius: 24px; border: 1px solid var(--glass-border); grid-column: 1 / -1;">
          <i class="fas fa-image" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
          <p>No images in gallery yet. Upload your first memory!</p>
        </div>
      `;
      return;
    }

    galleryImages.forEach((src, index) => {
      const div = document.createElement('div');
      div.className = 'gallery-item';
      const img = document.createElement('img');
      img.src = src;
      img.alt = 'screenshot';
      img.onerror = () => {
        img.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect width='200' height='200' fill='%23111827'/%3E%3Ctext x='50' y='110' fill='%234a5a6e' font-size='20'%3E📷%3C/text%3E%3C/svg%3E";
      };
      div.appendChild(img);

      const delBtn = document.createElement('button');
      delBtn.className = 'delete-btn';
      delBtn.innerHTML = '<i class="fas fa-times"></i>';
      delBtn.title = 'Delete image';
      delBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (confirm('Delete this image?')) {
          galleryImages.splice(index, 1);
          await saveGallery(galleryImages);
          renderGallery();
        }
      });
      div.appendChild(delBtn);

      div.addEventListener('click', () => {
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;inset:0;background:#09090be0;z-index:9999;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(10px);cursor:pointer;';
        const big = document.createElement('img');
        big.src = img.src;
        big.style.cssText = 'max-width:90vw;max-height:90vh;border-radius:24px;box-shadow:0 0 60px #00BFFF40;';
        overlay.appendChild(big);
        overlay.addEventListener('click', () => overlay.remove());
        document.body.appendChild(overlay);
      });

      galleryContainer.appendChild(div);
    });
  }

  uploadBtn.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', async function(e) {
    const files = Array.from(e.target.files);
    const loadingMessage = document.createElement('div');
    loadingMessage.style.cssText = 'position:fixed;inset:0;z-index:9998;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;color:white;font-size:1.2rem;backdrop-filter:blur(10px);';
    loadingMessage.innerHTML = '<div style="text-align:center;"><i class="fas fa-spinner fa-spin" style="font-size:3rem;"></i><p style="margin-top:1rem;">Uploading images...</p></div>';
    document.body.appendChild(loadingMessage);

    try {
      for (const file of files) {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          const dataUrl = await new Promise((resolve) => {
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(file);
          });
          galleryImages.push(dataUrl);
        }
      }
      await saveGallery(galleryImages);
      renderGallery();
    } catch (error) {
      alert('Failed to upload images. Please try again.');
      console.error(error);
    } finally {
      loadingMessage.remove();
    }
    fileInput.value = '';
  });

})();