// ===== js/main.js =====
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

  // --- TARGETED SERVERS ---
  let servers = [];

  function loadServers() {
    const stored = localStorage.getItem('teamrogue_servers');
    if (stored) {
      servers = JSON.parse(stored);
    } else {
      servers = CONFIG.DEFAULT_SERVERS.map(s => ({ ...s }));
      localStorage.setItem('teamrogue_servers', JSON.stringify(servers));
    }
    renderServers();
  }

  function renderServers() {
    const container = document.getElementById('servers-list');
    if (servers.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: #94a3b8; background: var(--glass-bg); border-radius: 24px; border: 1px solid var(--glass-border);">
          <i class="fas fa-server" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
          <p>No servers targeted yet. Add your first one!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = '';
    servers.forEach((server, index) => {
      const div = document.createElement('div');
      div.className = 'server-item';
      div.innerHTML = `
        <div class="server-info">
          <span class="server-name">${server.name}</span>
          <span class="server-ip">${server.ip}</span>
          <div class="server-status">
            <button class="status-toggle ${server.destroyed ? 'active' : ''}" data-index="${index}" title="Toggle destroyed status"></button>
            <span class="status-label ${server.destroyed ? 'destroyed' : 'not-destroyed'}">${server.destroyed ? '✅ Destroyed' : '❌ Active'}</span>
          </div>
        </div>
        <div class="server-actions">
          <button class="edit-btn" data-index="${index}"><i class="fas fa-edit"></i></button>
          <button class="delete-btn" data-index="${index}"><i class="fas fa-trash"></i></button>
        </div>
      `;
      container.appendChild(div);
    });

    // Event listeners
    document.querySelectorAll('.status-toggle').forEach(btn => {
      btn.addEventListener('click', function() {
        const index = parseInt(this.dataset.index);
        servers[index].destroyed = !servers[index].destroyed;
        localStorage.setItem('teamrogue_servers', JSON.stringify(servers));
        renderServers();
      });
    });

    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const index = parseInt(this.dataset.index);
        showServerModal(index);
      });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const index = parseInt(this.dataset.index);
        if (confirm(`Delete server "${servers[index].name}"?`)) {
          servers.splice(index, 1);
          localStorage.setItem('teamrogue_servers', JSON.stringify(servers));
          renderServers();
        }
      });
    });
  }

  // Server Modal
  function showServerModal(index = -1) {
    const isEdit = index >= 0;
    const server = isEdit ? servers[index] : { name: '', ip: '', destroyed: false };

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-box">
        <h3>${isEdit ? 'Edit Server' : 'Add New Server'}</h3>
        <input type="text" id="modal-server-name" placeholder="Server Name" value="${server.name}" />
        <input type="text" id="modal-server-ip" placeholder="IP Address" value="${server.ip}" />
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
          <label style="color: #94a3b8; cursor: pointer;">
            <input type="checkbox" id="modal-server-status" ${server.destroyed ? 'checked' : ''} />
            Mark as Destroyed
          </label>
        </div>
        <div class="modal-actions">
          <button class="modal-save" id="modal-save-btn">${isEdit ? 'Update' : 'Add'}</button>
          <button class="modal-cancel" id="modal-cancel-btn">Cancel</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById('modal-cancel-btn').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    document.getElementById('modal-save-btn').addEventListener('click', () => {
      const name = document.getElementById('modal-server-name').value.trim();
      const ip = document.getElementById('modal-server-ip').value.trim();
      const destroyed = document.getElementById('modal-server-status').checked;

      if (!name || !ip) {
        alert('Please fill in both fields.');
        return;
      }

      if (isEdit) {
        servers[index] = { name, ip, destroyed };
      } else {
        servers.push({ name, ip, destroyed });
      }

      localStorage.setItem('teamrogue_servers', JSON.stringify(servers));
      renderServers();
      overlay.remove();
    });
  }

  document.getElementById('add-server-btn').addEventListener('click', () => showServerModal(-1));

  // Initialize servers
  loadServers();

  // --- GALLERY with UPLOAD & DELETE ---
  const galleryContainer = document.getElementById('gallery-container');
  const uploadBtn = document.getElementById('upload-btn');
  const fileInput = document.getElementById('file-input');

  let galleryImages = [];

  function loadGallery() {
    const stored = localStorage.getItem('teamrogue_gallery');
    if (stored) {
      galleryImages = JSON.parse(stored);
    } else {
      galleryImages = [
        'assets/gallery/screenshot1.png',
        'assets/gallery/screenshot2.png',
        'assets/gallery/screenshot3.png',
        'assets/gallery/screenshot4.png',
        'assets/gallery/screenshot5.png',
        'assets/gallery/screenshot6.png'
      ];
      localStorage.setItem('teamrogue_gallery', JSON.stringify(galleryImages));
    }
    renderGallery();
  }

  function renderGallery() {
    galleryContainer.innerHTML = '';
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
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        galleryImages.splice(index, 1);
        localStorage.setItem('teamrogue_gallery', JSON.stringify(galleryImages));
        renderGallery();
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

  fileInput.addEventListener('change', function(e) {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(event) {
          const dataUrl = event.target.result;
          galleryImages.push(dataUrl);
          localStorage.setItem('teamrogue_gallery', JSON.stringify(galleryImages));
          renderGallery();
        };
        reader.readAsDataURL(file);
      }
    });
    fileInput.value = '';
  });

  loadGallery();

})();