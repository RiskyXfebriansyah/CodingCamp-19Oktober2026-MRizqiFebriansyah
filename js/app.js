/* =================================================================
   Life Dashboard — app.js
   Pure Vanilla JS · No frameworks · localStorage for all data

   ✅ Greeting + Live clock + Date
   ✅ Custom name & avatar initials        [Challenge]
   ✅ Weather widget (Geolocation + Open-Meteo API)
   ✅ Daily motivational quote             (berganti tiap hari)
   ❄️ Snow animation (Canvas)             (bisa toggle on/off)
   ✅ Focus Timer + circular SVG ring
   ✅ Timer mode pills (Focus/Short/Long)
   ✅ Configurable Pomodoro duration       [Challenge]
   ✅ Session counter
   ✅ To-Do List: add/edit/complete/delete
   ✅ Prevent duplicate tasks              [Challenge]
   ✅ Sort tasks                           [Challenge]
   ✅ Task counter + progress bar
   ✅ Clear completed tasks
   📝 Quick Note — auto-save textarea
   🔗 Quick Links with favicons
   ✅ Light / Dark mode                    [Challenge]
   ✅ Toast notifications
   ================================================================= */

/* ─────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────── */
const store = {
  get(key, fallback = null) {
    try { const r = localStorage.getItem(key); return r !== null ? JSON.parse(r) : fallback; }
    catch { return fallback; }
  },
  set(key, value) { localStorage.setItem(key, JSON.stringify(value)); },
};

function pad(n) { return String(n).padStart(2, '0'); }
function uid()  { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

/* ─────────────────────────────────────────────────────
   TOAST
───────────────────────────────────────────────────── */
const TOAST_ICONS = { success:'✅', error:'❌', warning:'⚠️', info:'ℹ️' };

function showToast(msg, type = 'info', ms = 3000) {
  const c = document.getElementById('toastContainer');
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.innerHTML = `<span class="toast-icon">${TOAST_ICONS[type]||'ℹ️'}</span><span>${msg}</span>`;
  c.appendChild(t);
  setTimeout(() => {
    t.classList.add('toast-out');
    t.addEventListener('animationend', () => t.remove(), { once:true });
  }, ms);
}

/* ─────────────────────────────────────────────────────
   ❄️ SNOW  — jelas, full layar, 3 ukuran flake
───────────────────────────────────────────────────── */
const canvas = document.getElementById('snowCanvas');
const ctx    = canvas.getContext('2d');
let snowOn   = store.get('snowOn', true);
let snowFlakes = [];

// Jumlah flake proporsional dengan luas layar, minimal 200
function snowCount() {
  return Math.max(200, Math.round((window.innerWidth * window.innerHeight) / 6000));
}

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  // Reinit supaya flake mengisi ulang area baru
  initSnow();
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function makeFlake() {
  // 3 kelas ukuran: kecil / sedang / besar
  const tier  = Math.random();
  const r     = tier < 0.45 ? 2 + Math.random() * 2      // kecil  2–4
              : tier < 0.80 ? 4 + Math.random() * 3      // sedang 4–7
              :               7 + Math.random() * 5;     // besar  7–12
  const speed = r * 0.22 + Math.random() * 0.6;          // besar = lebih cepat sedikit
  return {
    x:     Math.random() * canvas.width,
    y:     Math.random() * canvas.height,
    r,
    speed,
    wind:  (Math.random() - 0.5) * 0.7,
    wobble:Math.random() * Math.PI * 2,   // fase osilasi
    wobbleSpeed: 0.01 + Math.random() * 0.02,
    alpha: 0.55 + Math.random() * 0.45,  // 0.55 – 1.0 → lebih terang
  };
}

function initSnow() {
  snowFlakes = Array.from({ length: snowCount() }, makeFlake);
}
initSnow();

function drawSnow() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (snowOn) {
    // Deteksi apakah sedang light mode
    const isLight = document.documentElement.getAttribute('data-theme') !== 'dark';

    snowFlakes.forEach(f => {
      ctx.save();

      if (isLight) {
        /* ── Light mode: putih asli + shadow tipis supaya kontras ── */
        // Fill putih
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${f.alpha})`;
        ctx.fill();

        // Drop shadow biru muda tipis supaya salju kelihatan di bg terang
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(100,140,220,${f.alpha * 0.40})`;
        ctx.lineWidth   = f.r > 4 ? 1.2 : 0.7;
        ctx.stroke();
      } else {
        /* ── Dark mode: putih bersinar seperti sebelumnya ── */
        const grd = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r);
        grd.addColorStop(0,   `rgba(255,255,255,${f.alpha})`);
        grd.addColorStop(0.6, `rgba(210,235,255,${f.alpha * 0.8})`);
        grd.addColorStop(1,   `rgba(180,220,255,0)`);

        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
      }

      ctx.restore();

      // Update posisi
      f.wobble += f.wobbleSpeed;
      f.x += f.wind + Math.sin(f.wobble) * 0.4;
      f.y += f.speed;

      // Wrap around
      if (f.y > canvas.height + f.r * 2) { f.y = -f.r * 2; f.x = Math.random() * canvas.width; }
      if (f.x >  canvas.width  + 20)     { f.x = -20; }
      if (f.x < -20)                      { f.x = canvas.width + 20; }
    });
  }

  requestAnimationFrame(drawSnow);
}
drawSnow();

// Toggle button
const snowToggleBtn = document.getElementById('snowToggle');
function applySnowToggle() {
  snowToggleBtn.classList.toggle('snow-active', snowOn);
  snowToggleBtn.title = snowOn ? 'Matikan salju' : 'Nyalakan salju ❄️';
}
applySnowToggle();

snowToggleBtn.addEventListener('click', () => {
  snowOn = !snowOn;
  store.set('snowOn', snowOn);
  applySnowToggle();
  showToast(snowOn ? '❄️ Salju dinyalakan!' : '☀️ Salju dimatikan', 'info', 1800);
});

/* ─────────────────────────────────────────────────────
   1. THEME
───────────────────────────────────────────────────── */
(function() { applyTheme(store.get('theme','light'), false); })();

function applyTheme(theme, notify = true) {
  document.documentElement.setAttribute('data-theme', theme);
  const icon = document.querySelector('#themeToggle .theme-icon');
  icon.textContent = theme === 'dark' ? '☀️' : '🌙';
  store.set('theme', theme);
  if (notify) showToast(theme === 'dark' ? '🌙 Dark mode' : '☀️ Light mode', 'info', 1800);
}
document.getElementById('themeToggle').addEventListener('click', () => {
  applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
});

/* ─────────────────────────────────────────────────────
   2. CLOCK & GREETING
───────────────────────────────────────────────────── */
const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

function getGreetingText(h) {
  if (h >= 5  && h < 12) return 'Good Morning ☀️';
  if (h >= 12 && h < 17) return 'Good Afternoon 🌤️';
  if (h >= 17 && h < 21) return 'Good Evening 🌆';
  return 'Good Night 🌙';
}

function updateClock() {
  const now = new Date();
  const h = now.getHours(), m = now.getMinutes(), s = now.getSeconds();
  document.getElementById('clock').textContent        = `${pad(h)}:${pad(m)}:${pad(s)}`;
  document.getElementById('dateDisplay').textContent  = `${DAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
  document.getElementById('greeting').textContent     = getGreetingText(h);
}
setInterval(updateClock, 1000);
updateClock();

/* ─────────────────────────────────────────────────────
   3. PROFIL — nama + foto
───────────────────────────────────────────────────── */
(function() { renderProfile(); })();

function getInitials(name) {
  if (!name) return '?';
  return name.trim().split(/\s+/).map(w => w[0].toUpperCase()).slice(0, 2).join('');
}

function renderProfile() {
  const name      = store.get('userName', '');
  const photoData = store.get('avatarPhoto', null);
  const avatarEl  = document.getElementById('avatarCircle');
  const nameEl    = document.getElementById('profileName');
  const subEl     = document.getElementById('profileSub');
  // Juga update greeting di tengah
  const greetNameEl = document.getElementById('greetName');
  if (greetNameEl) greetNameEl.textContent = name || '';

  // Nama di profil panel
  nameEl.textContent = name || 'Siapa namamu?';
  subEl.textContent  = name ? `Halo kembali! 👋` : 'Klik ✏️ untuk atur nama';

  // Avatar: foto atau inisial
  if (photoData) {
    avatarEl.style.backgroundImage = `url(${photoData})`;
    avatarEl.classList.add('has-photo');
    avatarEl.textContent = '';
  } else {
    avatarEl.style.backgroundImage = '';
    avatarEl.classList.remove('has-photo');
    avatarEl.textContent = getInitials(name);
  }
}

// Tombol ✏️ → buka modal nama
document.getElementById('editNameBtn').addEventListener('click', openNameModal);

function openNameModal() {
  document.getElementById('nameInput').value = store.get('userName', '');
  document.getElementById('nameModal').showModal();
  setTimeout(() => document.getElementById('nameInput').focus(), 60);
}
document.getElementById('saveNameBtn').addEventListener('click', saveName);
document.getElementById('cancelNameBtn').addEventListener('click', () =>
  document.getElementById('nameModal').close()
);
document.getElementById('nameInput').addEventListener('keydown', e => {
  if (e.key === 'Enter')  saveName();
  if (e.key === 'Escape') document.getElementById('nameModal').close();
});
function saveName() {
  const val = document.getElementById('nameInput').value.trim();
  store.set('userName', val);
  renderProfile();
  document.getElementById('nameModal').close();
  if (val) showToast(`Halo, ${val}! �`, 'success');
}

// Overlay � → buka file picker
document.getElementById('avatarOverlay').addEventListener('click', () => {
  document.getElementById('avatarFileInput').click();
});
document.getElementById('avatarOverlay').addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') document.getElementById('avatarFileInput').click();
});

// Klik avatar sendiri → jika belum ada foto, buka name modal
document.getElementById('avatarCircle').addEventListener('click', () => {
  if (!store.get('avatarPhoto', null)) openNameModal();
});

// Handler file input
document.getElementById('avatarFileInput').addEventListener('change', function () {
  const file = this.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) { showToast('File harus berupa gambar.', 'error'); return; }
  if (file.size > 5 * 1024 * 1024)    { showToast('Ukuran foto maksimal 5 MB.', 'error'); return; }

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      // Crop tengah 120×120 lalu simpan sebagai JPEG
      const SIZE = 120;
      const cvs  = document.createElement('canvas');
      cvs.width  = SIZE; cvs.height = SIZE;
      const c    = cvs.getContext('2d');
      const scale = Math.max(SIZE / img.width, SIZE / img.height);
      const sw = SIZE / scale, sh = SIZE / scale;
      const sx = (img.width - sw) / 2, sy = (img.height - sh) / 2;
      c.drawImage(img, sx, sy, sw, sh, 0, 0, SIZE, SIZE);
      store.set('avatarPhoto', cvs.toDataURL('image/jpeg', 0.85));
      renderProfile();
      showToast('Foto profil diperbarui! 📸', 'success', 2500);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
  this.value = ''; // reset supaya file sama bisa dipilih ulang
});

/* ─────────────────────────────────────────────────────
   4. WEATHER WIDGET
   Uses Open-Meteo (free, no API key) + browser geolocation
───────────────────────────────────────────────────── */
const WMO_CODES = {
  0:'☀️ Clear sky', 1:'🌤️ Mainly clear', 2:'⛅ Partly cloudy', 3:'☁️ Overcast',
  45:'🌫️ Foggy', 48:'🌫️ Freezing fog',
  51:'🌦️ Drizzle', 53:'🌦️ Drizzle', 55:'🌧️ Heavy drizzle',
  61:'🌧️ Rain', 63:'🌧️ Rain', 65:'🌧️ Heavy rain',
  71:'🌨️ Snow', 73:'🌨️ Snow', 75:'❄️ Heavy snow',
  80:'🌦️ Showers', 81:'🌧️ Showers', 82:'⛈️ Violent showers',
  95:'⛈️ Thunderstorm', 96:'⛈️ Thunderstorm', 99:'⛈️ Thunderstorm',
};

function initWeather() {
  if (!navigator.geolocation) {
    // Sembunyikan widget jika geolocation tidak didukung
    document.getElementById('weatherWidget').style.display = 'none';
    return;
  }
  navigator.geolocation.getCurrentPosition(
    pos => fetchWeather(pos.coords.latitude, pos.coords.longitude),
    _   => {
      // Izin ditolak — sembunyikan widget saja, tanpa pesan error
      document.getElementById('weatherWidget').style.display = 'none';
    }
  );
}

async function fetchWeather(lat, lon) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m&timezone=auto`;
    const res  = await fetch(url);
    const data = await res.json();
    const cw   = data.current_weather;
    const desc = WMO_CODES[cw.weathercode] || '🌡️ Unknown';
    setWeatherText(desc.split(' ')[0], `${desc.split(' ').slice(1).join(' ')}  ${Math.round(cw.temperature)}°C  💨 ${cw.windspeed} km/h`);
  } catch {
    setWeatherText('🌡️', 'Cuaca tidak tersedia');
  }
}

function setWeatherText(icon, text) {
  document.getElementById('weatherIcon').textContent = icon;
  document.getElementById('weatherText').textContent = text;
}

initWeather();

/* ─────────────────────────────────────────────────────
   5. DAILY MOTIVATIONAL QUOTES
───────────────────────────────────────────────────── */
const QUOTES = [
  '"Mulai dulu, sempurna nanti." — Anonymous',
  '"Setiap hari adalah kesempatan baru untuk tumbuh." — Anonymous',
  '"Disiplin kecil setiap hari membangun hasil besar." — Anonymous',
  '"Kamu tidak harus sempurna untuk memulai, tapi kamu harus memulai untuk menjadi sempurna." — Anonymous',
  '"Fokus pada prosesnya, bukan hasilnya." — Anonymous',
  '"Satu langkah kecil hari ini lebih baik daripada seribu rencana yang tidak pernah dimulai." — Anonymous',
  '"Jangan bandingkan perjalananmu dengan orang lain." — Anonymous',
  '"Konsistensi mengalahkan intensitas." — Anonymous',
  '"Bukan tentang memiliki waktu, tapi tentang membuat waktu." — Anonymous',
  '"Selesai lebih baik daripada sempurna." — Done is better than perfect',
  '"Kesulitan hari ini adalah kekuatan hari esok." — Anonymous',
  '"Otak yang aktif tidak pernah berhenti belajar." — Anonymous',
  '"Kerjakan yang paling sulit terlebih dahulu." — Mark Twain',
  '"Imajinasi lebih penting dari ilmu pengetahuan." — Albert Einstein',
  '"Sukses bukan kunci kebahagiaan. Kebahagiaanlah yang menjadi kunci sukses." — Albert Schweitzer',
  '"Hidup adalah 10% apa yang terjadi padamu dan 90% bagaimana kamu bereaksi terhadapnya." — Charles R. Swindoll',
  '"Belajarlah seolah kamu akan hidup selamanya." — Mahatma Gandhi',
  '"Investasi terbaik adalah investasi pada dirimu sendiri." — Warren Buffett',
  '"Kegagalan bukan kekalahan, menyerah itulah kekalahan." — Anonymous',
  '"Waktu yang tidak digunakan tidak akan pernah kembali." — Anonymous',
];

function renderQuote() {
  const dayIdx = Math.floor(Date.now() / 86400000) % QUOTES.length; // berubah tiap hari
  document.getElementById('quoteText').textContent = QUOTES[dayIdx];
}
renderQuote();

/* ─────────────────────────────────────────────────────
   6. FOCUS TIMER
───────────────────────────────────────────────────── */
const RING_CIRC = 2 * Math.PI * 52; // ≈ 326.7

let timerDuration  = store.get('timerDuration', 25) * 60;
let timerRemaining = timerDuration;
let timerInterval  = null;
let timerRunning   = false;
let sessionCount   = store.get('sessionCount', 0);

const ringEl        = document.getElementById('ringProgress');
const timerDisp     = document.getElementById('timerDisplay');
const pomodoroInput = document.getElementById('pomodoroMinutes');

pomodoroInput.value = store.get('timerDuration', 25);
updateSessionBadge();
renderTimerDisplay();
updateRing();

/* Mode pills */
document.querySelectorAll('.mode-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    if (timerRunning) { showToast('Pause timer dulu sebelum ganti mode.', 'warning'); return; }
    document.querySelectorAll('.mode-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    const mins = parseInt(pill.dataset.minutes, 10);
    pomodoroInput.value = mins;
    applyTimerDuration(mins);
  });
});

function updateSessionBadge() {
  document.getElementById('sessionCount').textContent = sessionCount;
}
function renderTimerDisplay() {
  const m = Math.floor(timerRemaining / 60), s = timerRemaining % 60;
  timerDisp.textContent = `${pad(m)}:${pad(s)}`;
  document.title = timerRunning ? `${pad(m)}:${pad(s)} — Focus` : 'Life Dashboard';
}
function updateRing() {
  const p = timerDuration > 0 ? timerRemaining / timerDuration : 1;
  ringEl.style.strokeDashoffset = RING_CIRC * (1 - p);
  ringEl.classList.toggle('urgent', p < 0.20 && timerRunning);
}

document.getElementById('applyTimerBtn').addEventListener('click', () => {
  const mins = parseInt(pomodoroInput.value, 10);
  applyTimerDuration(mins);
});
pomodoroInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') { const m = parseInt(pomodoroInput.value, 10); applyTimerDuration(m); }
});

function applyTimerDuration(mins) {
  if (timerRunning) { showToast('Pause timer terlebih dahulu.', 'warning'); return; }
  if (!mins || mins < 1 || mins > 120) {
    showToast('Masukkan durasi antara 1–120 menit.', 'error');
    pomodoroInput.value = store.get('timerDuration', 25);
    return;
  }
  timerDuration  = mins * 60;
  timerRemaining = timerDuration;
  store.set('timerDuration', mins);
  renderTimerDisplay(); updateRing();
  showToast(`Timer diset ke ${mins} menit ⏱`, 'success', 2000);
}

document.getElementById('startBtn').addEventListener('click', () => {
  if (timerRunning) return;
  if (timerRemaining === 0) timerRemaining = timerDuration;
  timerRunning  = true;
  timerInterval = setInterval(timerTick, 1000);
  showToast('Sesi fokus dimulai! 🎯', 'success', 2000);
});
document.getElementById('stopBtn').addEventListener('click', () => {
  if (!timerRunning) return;
  clearInterval(timerInterval); timerRunning = false;
  document.title = 'Life Dashboard';
  showToast('Timer dijeda.', 'info', 2000);
});
document.getElementById('resetBtn').addEventListener('click', () => {
  clearInterval(timerInterval); timerRunning = false;
  timerRemaining = timerDuration;
  document.title = 'Life Dashboard';
  ringEl.classList.remove('urgent');
  renderTimerDisplay(); updateRing();
});

function timerTick() {
  if (timerRemaining <= 0) {
    clearInterval(timerInterval); timerRunning = false; timerRemaining = 0;
    document.title = 'Life Dashboard';
    renderTimerDisplay(); updateRing(); ringEl.classList.remove('urgent');
    sessionCount++;
    store.set('sessionCount', sessionCount);
    updateSessionBadge();
    showToast('🎉 Sesi fokus selesai! Istirahat dulu ya.', 'success', 5000);
    return;
  }
  timerRemaining--;
  renderTimerDisplay(); updateRing();
}

/* ─────────────────────────────────────────────────────
   7. TO-DO LIST
───────────────────────────────────────────────────── */
let tasks = store.get('tasks', []); // [{id, text, done}]

function saveTasks() { store.set('tasks', tasks); }
function getSortedTasks() {
  const s = document.getElementById('sortSelect').value;
  const c = [...tasks];
  if (s === 'az')   return c.sort((a,b) => a.text.localeCompare(b.text));
  if (s === 'za')   return c.sort((a,b) => b.text.localeCompare(a.text));
  if (s === 'done') return c.sort((a,b) => Number(a.done) - Number(b.done));
  return c;
}

function renderTasks() {
  const list   = document.getElementById('taskList');
  const sorted = getSortedTasks();
  list.innerHTML = '';

  const total = tasks.length;
  const done  = tasks.filter(t => t.done).length;
  document.getElementById('taskCounter').textContent = total === 0 ? 'No tasks' : `${done} / ${total} done`;

  // Progress bar (created once, updated each render)
  let bar = document.getElementById('taskProgressBar');
  if (!bar) {
    const wrap = document.createElement('div');
    wrap.className = 'progress-bar-wrap'; wrap.id = 'progressBarWrap';
    bar = document.createElement('div');
    bar.className = 'progress-bar-fill'; bar.id = 'taskProgressBar';
    wrap.appendChild(bar);
    document.querySelector('.todo-card').appendChild(wrap);
  }
  bar.style.width = total === 0 ? '0%' : `${(done / total) * 100}%`;

  if (sorted.length === 0) {
    const li = document.createElement('li');
    li.className = 'task-item';
    li.style.cssText = 'justify-content:center;color:var(--text-muted);font-size:.84rem;cursor:default';
    li.textContent = '✨ Belum ada tugas. Tambahkan di atas!';
    list.appendChild(li); return;
  }

  sorted.forEach(task => {
    const li = document.createElement('li');
    li.className = `task-item${task.done ? ' done' : ''}`;

    const cb = document.createElement('input');
    cb.type = 'checkbox'; cb.checked = task.done;
    cb.setAttribute('aria-label', `Tandai "${task.text}" selesai`);
    cb.addEventListener('change', () => toggleTask(task.id));

    const span = document.createElement('span');
    span.className = 'task-text'; span.textContent = task.text;

    const actions = document.createElement('div');
    actions.className = 'task-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'btn-edit'; editBtn.textContent = 'Edit';
    editBtn.setAttribute('aria-label', `Edit: ${task.text}`);
    editBtn.addEventListener('click', () => openEditModal(task.id));

    const delBtn = document.createElement('button');
    delBtn.className = 'btn btn-danger'; delBtn.textContent = 'Delete';
    delBtn.setAttribute('aria-label', `Hapus: ${task.text}`);
    delBtn.addEventListener('click', () => deleteTask(task.id));

    actions.append(editBtn, delBtn);
    li.append(cb, span, actions);
    list.appendChild(li);
  });
}

function addTask() {
  const input = document.getElementById('taskInput');
  const text  = input.value.trim();
  if (!text) { showToast('Masukkan nama tugas.', 'warning'); return; }
  if (tasks.some(t => t.text.toLowerCase() === text.toLowerCase())) {
    showToast(`"${text}" sudah ada di daftar.`, 'warning'); input.select(); return;
  }
  tasks.push({ id: uid(), text, done: false });
  saveTasks(); renderTasks();
  input.value = ''; input.focus();
  showToast('Tugas ditambahkan ✅', 'success', 2000);
}

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.done = !task.done;
  saveTasks(); renderTasks();
  if (task.done) showToast(`"${task.text}" selesai! 🎉`, 'success', 2000);
}

function deleteTask(id) {
  const task = tasks.find(t => t.id === id);
  tasks = tasks.filter(t => t.id !== id);
  saveTasks(); renderTasks();
  if (task) showToast(`Dihapus: "${task.text}"`, 'info', 2000);
}

document.getElementById('clearDoneBtn').addEventListener('click', () => {
  const n = tasks.filter(t => t.done).length;
  if (!n) { showToast('Tidak ada tugas selesai.', 'info'); return; }
  tasks = tasks.filter(t => !t.done);
  saveTasks(); renderTasks();
  showToast(`${n} tugas selesai dihapus 🧹`, 'success');
});

let editingId = null;
function openEditModal(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  editingId = id;
  document.getElementById('editTaskInput').value = task.text;
  document.getElementById('editModal').showModal();
  setTimeout(() => document.getElementById('editTaskInput').focus(), 60);
}
function saveEdit() {
  const text = document.getElementById('editTaskInput').value.trim();
  if (!text) { showToast('Tugas tidak boleh kosong.', 'warning'); return; }
  if (tasks.some(t => t.id !== editingId && t.text.toLowerCase() === text.toLowerCase())) {
    showToast(`"${text}" sudah ada di daftar.`, 'warning'); return;
  }
  const task = tasks.find(t => t.id === editingId);
  if (task) { task.text = text; saveTasks(); renderTasks(); showToast('Tugas diperbarui ✏️', 'success', 2000); }
  editingId = null; document.getElementById('editModal').close();
}

document.getElementById('addTaskBtn').addEventListener('click', addTask);
document.getElementById('taskInput').addEventListener('keydown', e => { if (e.key === 'Enter') addTask(); });
document.getElementById('saveEditBtn').addEventListener('click', saveEdit);
document.getElementById('editTaskInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') saveEdit();
  if (e.key === 'Escape') document.getElementById('editModal').close();
});
document.getElementById('cancelEditBtn').addEventListener('click', () => document.getElementById('editModal').close());
document.getElementById('sortSelect').addEventListener('change', renderTasks);
renderTasks();

/* ─────────────────────────────────────────────────────
   8. QUICK NOTE — auto-save
───────────────────────────────────────────────────── */
const noteArea      = document.getElementById('quickNote');
const noteCharCount = document.getElementById('noteCharCount');
const noteSavedEl   = document.getElementById('noteSavedIndicator');
let noteSaveTimer   = null;

// Load saved note
noteArea.value = store.get('quickNote', '');
updateNoteCount();

noteArea.addEventListener('input', () => {
  updateNoteCount();
  clearTimeout(noteSaveTimer);
  noteSavedEl.classList.remove('visible');
  noteSaveTimer = setTimeout(() => {
    store.set('quickNote', noteArea.value);
    noteSavedEl.classList.add('visible');
    // fade out after 2s
    setTimeout(() => noteSavedEl.classList.remove('visible'), 2000);
  }, 800); // autosave 800ms after last keystroke
});

document.getElementById('clearNoteBtn').addEventListener('click', () => {
  if (!noteArea.value) return;
  noteArea.value = '';
  store.set('quickNote', '');
  updateNoteCount();
  showToast('Catatan dihapus 🗑', 'info', 2000);
});

function updateNoteCount() {
  noteCharCount.textContent = `${noteArea.value.length} / 2000`;
}

/* ─────────────────────────────────────────────────────
   9. QUICK LINKS
───────────────────────────────────────────────────── */
let links = store.get('quickLinks', []);
function saveLinks() { store.set('quickLinks', links); }

function getFaviconUrl(url) {
  try { return `https://www.google.com/s2/favicons?sz=32&domain_url=${encodeURIComponent(new URL(url).origin)}`; }
  catch { return null; }
}

function renderLinks() {
  const c = document.getElementById('linksList');
  c.innerHTML = '';
  if (!links.length) {
    c.innerHTML = '<span style="font-size:.82rem;color:var(--text-muted);">Belum ada link. Tambahkan favoritmu! 🌐</span>';
    return;
  }
  links.forEach(link => {
    const wrap   = document.createElement('span');
    wrap.className = 'link-chip-wrapper';

    const anchor = document.createElement('a');
    anchor.className = 'link-chip';
    anchor.href = link.url; anchor.target = '_blank'; anchor.rel = 'noopener noreferrer';

    const fsrc = getFaviconUrl(link.url);
    if (fsrc) {
      const img = document.createElement('img');
      img.className = 'link-chip-favicon'; img.src = fsrc; img.alt = ''; img.loading = 'lazy';
      img.onerror = () => img.remove();
      anchor.appendChild(img);
    }
    const ns = document.createElement('span'); ns.textContent = link.name;
    anchor.appendChild(ns);

    const rmBtn = document.createElement('button');
    rmBtn.className = 'link-remove-btn'; rmBtn.textContent = '×';
    rmBtn.setAttribute('aria-label', `Hapus: ${link.name}`);
    rmBtn.addEventListener('click', () => removeLink(link.id));

    wrap.append(anchor, rmBtn);
    c.appendChild(wrap);
  });
}

function addLink() {
  const ni = document.getElementById('linkName');
  const ui = document.getElementById('linkUrl');
  const name = ni.value.trim();
  let   url  = ui.value.trim();
  if (!name || !url) { showToast('Masukkan nama dan URL.', 'warning'); return; }
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  links.push({ id: uid(), name, url });
  saveLinks(); renderLinks();
  ni.value = ''; ui.value = ''; ni.focus();
  showToast(`"${name}" ditambahkan ke Quick Links 🔗`, 'success', 2000);
}
function removeLink(id) {
  const l = links.find(x => x.id === id);
  links = links.filter(x => x.id !== id);
  saveLinks(); renderLinks();
  if (l) showToast(`Dihapus: "${l.name}"`, 'info', 2000);
}

document.getElementById('addLinkBtn').addEventListener('click', addLink);
document.getElementById('linkUrl').addEventListener('keydown', e => { if (e.key === 'Enter') addLink(); });
renderLinks();

/* ─────────────────────────────────────────────────────
   10. 🎵 MUSIC PLAYER
   Mendukung URL YouTube & SoundCloud via iframe embed.
   Data playlist disimpan di localStorage.
───────────────────────────────────────────────────── */
let playlist       = store.get('musicPlaylist', []);  // [{id, name, url}]
let currentTrackIdx = store.get('musicCurrentIdx', -1);
let isPlaying      = false;
let shuffleMode    = false;

function savePlaylist() { store.set('musicPlaylist', playlist); }
function saveMusicIdx() { store.set('musicCurrentIdx', currentTrackIdx); }

/* --- Deteksi tipe URL & buat embed URL --- */
function getEmbedUrl(url) {
  try {
    const u = new URL(url);
    // YouTube watch
    if (u.hostname.includes('youtube.com') && u.searchParams.get('v')) {
      return `https://www.youtube-nocookie.com/embed/${u.searchParams.get('v')}?autoplay=1&controls=1`;
    }
    // YouTube short
    if (u.hostname.includes('youtu.be')) {
      return `https://www.youtube-nocookie.com/embed/${u.pathname.slice(1)}?autoplay=1&controls=1`;
    }
    // YouTube playlist
    if (u.hostname.includes('youtube.com') && u.searchParams.get('list')) {
      return `https://www.youtube-nocookie.com/embed/videoseries?list=${u.searchParams.get('list')}&autoplay=1`;
    }
    // SoundCloud
    if (u.hostname.includes('soundcloud.com')) {
      return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&auto_play=true&color=%236366f1`;
    }
    return null;
  } catch { return null; }
}

function getSourceLabel(url) {
  try {
    const h = new URL(url).hostname;
    if (h.includes('youtube'))    return 'YouTube';
    if (h.includes('soundcloud')) return 'SoundCloud';
    return new URL(url).hostname.replace('www.','');
  } catch { return 'Link'; }
}

function getTrackIcon(url) {
  try {
    const h = new URL(url).hostname;
    if (h.includes('youtube'))    return '▶️';
    if (h.includes('soundcloud')) return '🔊';
    return '🎵';
  } catch { return '🎵'; }
}

/* --- Render playlist --- */
function renderPlaylist() {
  const ul = document.getElementById('musicPlaylist');
  ul.innerHTML = '';

  if (!playlist.length) {
    const li = document.createElement('li');
    li.className = 'music-playlist-item';
    li.style.cssText = 'justify-content:center;color:var(--text-muted);font-size:.83rem;cursor:default';
    li.textContent = '🎵 Belum ada musik. Tambahkan di atas!';
    ul.appendChild(li);
    return;
  }

  playlist.forEach((track, idx) => {
    const li = document.createElement('li');
    li.className = `music-playlist-item${idx === currentTrackIdx ? ' active' : ''}`;

    const icon = document.createElement('span');
    icon.className   = 'music-item-icon';
    icon.textContent = getTrackIcon(track.url);

    const name = document.createElement('span');
    name.className   = 'music-item-name';
    name.textContent = track.name;

    const src = document.createElement('span');
    src.className   = 'music-item-source';
    src.textContent = getSourceLabel(track.url);

    const delBtn = document.createElement('button');
    delBtn.className   = 'btn btn-danger';
    delBtn.textContent = '×';
    delBtn.style.padding = '2px 8px';
    delBtn.setAttribute('aria-label', `Hapus ${track.name}`);
    delBtn.addEventListener('click', (e) => { e.stopPropagation(); removeTrack(track.id); });

    li.append(icon, name, src, delBtn);
    li.addEventListener('click', () => { currentTrackIdx = idx; saveMusicIdx(); playCurrentTrack(); });
    ul.appendChild(li);
  });
}

/* --- Play track --- */
function playCurrentTrack() {
  if (playlist.length === 0 || currentTrackIdx < 0 || currentTrackIdx >= playlist.length) {
    stopMusic(); return;
  }

  const track    = playlist[currentTrackIdx];
  const embedUrl = getEmbedUrl(track.url);

  // Update display
  document.getElementById('musicTrackName').textContent   = track.name;
  document.getElementById('musicTrackSource').textContent = getSourceLabel(track.url);
  document.getElementById('musicDiscIcon').textContent    = getTrackIcon(track.url);
  document.getElementById('musicNowPlaying').textContent  = `▶ ${track.name}`;
  document.getElementById('musicNowPlaying').classList.add('playing');
  document.getElementById('musicPlayBtn').textContent     = '⏸ Pause';
  document.getElementById('musicDisc').classList.add('spinning');

  // Embed iframe
  const wrap = document.getElementById('musicIframeWrap');
  if (embedUrl) {
    wrap.innerHTML = `<iframe src="${embedUrl}" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
    wrap.classList.add('visible');
  } else {
    // Buka di tab baru jika tidak bisa di-embed
    wrap.innerHTML = '';
    wrap.classList.remove('visible');
    window.open(track.url, '_blank', 'noopener');
    showToast('Link dibuka di tab baru (tidak bisa di-embed).', 'info', 3000);
  }

  isPlaying = true;
  renderPlaylist();
  showToast(`▶ Memutar: ${track.name}`, 'success', 2000);
}

function stopMusic() {
  isPlaying = false;
  document.getElementById('musicIframeWrap').innerHTML = '';
  document.getElementById('musicIframeWrap').classList.remove('visible');
  document.getElementById('musicPlayBtn').textContent = '▶ Play';
  document.getElementById('musicDisc').classList.remove('spinning');
  document.getElementById('musicNowPlaying').textContent = '— Tidak ada musik —';
  document.getElementById('musicNowPlaying').classList.remove('playing');
}

/* --- Add track --- */
function addTrack() {
  const ni = document.getElementById('musicTrackInput');
  const ui = document.getElementById('musicUrlInput');
  const name = ni.value.trim();
  let   url  = ui.value.trim();

  if (!name || !url) { showToast('Masukkan nama lagu dan URL.', 'warning'); return; }
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

  playlist.push({ id: uid(), name, url });
  savePlaylist();
  renderPlaylist();
  ni.value = ''; ui.value = ''; ni.focus();
  showToast(`"${name}" ditambahkan ke playlist 🎵`, 'success', 2000);

  // Auto-play jika ini lagu pertama
  if (playlist.length === 1) { currentTrackIdx = 0; saveMusicIdx(); playCurrentTrack(); }
}

function removeTrack(id) {
  const idx  = playlist.findIndex(t => t.id === id);
  const name = playlist[idx]?.name;
  playlist   = playlist.filter(t => t.id !== id);
  savePlaylist();

  // Adjust index
  if (currentTrackIdx >= playlist.length) currentTrackIdx = playlist.length - 1;
  saveMusicIdx();

  if (isPlaying && playlist.length === 0) stopMusic();
  else if (isPlaying) renderPlaylist();
  else renderPlaylist();

  if (name) showToast(`Dihapus: "${name}"`, 'info', 2000);
}

/* --- Buttons --- */
document.getElementById('musicPlayBtn').addEventListener('click', () => {
  if (!playlist.length) { showToast('Tambahkan lagu dulu ke playlist.', 'warning'); return; }
  if (isPlaying) {
    // Pause = hentikan iframe
    stopMusic();
    showToast('⏸ Musik dijeda.', 'info', 2000);
  } else {
    if (currentTrackIdx < 0) currentTrackIdx = 0;
    saveMusicIdx();
    playCurrentTrack();
  }
});

document.getElementById('musicPrevBtn').addEventListener('click', () => {
  if (!playlist.length) return;
  currentTrackIdx = (currentTrackIdx - 1 + playlist.length) % playlist.length;
  saveMusicIdx(); playCurrentTrack();
});

document.getElementById('musicNextBtn').addEventListener('click', () => {
  if (!playlist.length) return;
  if (shuffleMode) {
    currentTrackIdx = Math.floor(Math.random() * playlist.length);
  } else {
    currentTrackIdx = (currentTrackIdx + 1) % playlist.length;
  }
  saveMusicIdx(); playCurrentTrack();
});

document.getElementById('musicShuffleBtn').addEventListener('click', () => {
  shuffleMode = !shuffleMode;
  document.getElementById('musicShuffleBtn').classList.toggle('active', shuffleMode);
  showToast(shuffleMode ? '🔀 Mode acak aktif' : '🔀 Mode acak nonaktif', 'info', 1800);
});

document.getElementById('musicAddBtn').addEventListener('click', addTrack);
document.getElementById('musicUrlInput').addEventListener('keydown', e => { if (e.key === 'Enter') addTrack(); });
document.getElementById('musicTrackInput').addEventListener('keydown', e => { if (e.key === 'Enter') addTrack(); });

// Init
renderPlaylist();
if (currentTrackIdx >= 0 && currentTrackIdx < playlist.length) {
  const t = playlist[currentTrackIdx];
  document.getElementById('musicTrackName').textContent   = t.name;
  document.getElementById('musicTrackSource').textContent = getSourceLabel(t.url);
  document.getElementById('musicDiscIcon').textContent    = getTrackIcon(t.url);
  document.getElementById('musicNowPlaying').textContent  = `— ${t.name} —`;
}
