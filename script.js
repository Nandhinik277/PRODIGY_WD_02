// === STATE ===
const state = {
    is24Hour: true,
    timezone: 'UTC',
    stopwatch: {
        startTime: 0,
        elapsedTime: 0,
        intervalId: null,
        isRunning: false,
        laps: []
    }
};

// === ELEMENTS ===
const els = {
    mainTime: document.getElementById('main-time'),
    mainDate: document.getElementById('main-date'),
    formatBtn: document.getElementById('format-toggle-btn'),
    swDisplay: document.getElementById('sw-display'),
    btnStart: document.getElementById('btn-sw-start'),
    btnPause: document.getElementById('btn-sw-pause'),
    btnLap: document.getElementById('btn-sw-lap'),
    btnReset: document.getElementById('btn-sw-reset'),
    lapsList: document.getElementById('laps-list'),
    lapCount: document.getElementById('lap-count')
};

// === CLOCK FUNCTIONS ===
function toggleFormat() {
    state.is24Hour = !state.is24Hour;
    els.formatBtn.textContent = state.is24Hour ? "24H" : "12H";
    updateClock();
}

// === FORMAT TIME ===
function formatTime(dateObj) {
    let hours = dateObj.getHours();
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    const seconds = dateObj.getSeconds().toString().padStart(2, '0');

    let ampm = '';

    if (!state.is24Hour) {
        // 12-hour format
        ampm = hours >= 12 ? ' PM' : ' AM';
        hours = hours % 12 || 12; // convert 0 → 12
    }

    hours = hours.toString().padStart(2, '0');

    return `${hours}:${minutes}:${seconds}${ampm}`;
}


function formatDate(dateObj) {
    return dateObj.toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
}

function updateClock() {
    const now = new Date();
    els.mainTime.textContent = formatTime(now);
    els.mainDate.textContent = formatDate(now);
}

// === STOPWATCH FUNCTIONS ===
function formatStopwatchTime(ms) {
    const totalSeconds = ms / 1000; // use float for smooth seconds
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

function updateStopwatchDisplay() {
    const now = Date.now();
    const elapsed = state.stopwatch.elapsedTime + (state.stopwatch.isRunning ? (now - state.stopwatch.startTime) : 0);
    els.swDisplay.textContent = formatStopwatchTime(elapsed);
}


// START
function startStopwatch() {
    if (state.stopwatch.isRunning) return;

    state.stopwatch.isRunning = true;
    state.stopwatch.startTime = Date.now();

    els.btnStart.classList.add('hidden');
    els.btnPause.classList.remove('hidden');
    els.btnReset.disabled = true;
    els.btnLap.disabled = false;

    // Update every 50ms for smooth seconds
    state.stopwatch.intervalId = setInterval(updateStopwatchDisplay, 50);
    updateStopwatchDisplay();
}

// PAUSE
function pauseStopwatch() {
    if (!state.stopwatch.isRunning) return;

    state.stopwatch.isRunning = false;
    state.stopwatch.elapsedTime += Date.now() - state.stopwatch.startTime;

    els.btnPause.classList.add('hidden');
    els.btnStart.classList.remove('hidden');
    els.btnReset.disabled = false;
    els.btnLap.disabled = true;

    clearInterval(state.stopwatch.intervalId);
    updateStopwatchDisplay();
}

// RESET
function resetStopwatch() {
    pauseStopwatch();
    state.stopwatch.elapsedTime = 0;
    state.stopwatch.laps = [];
    els.swDisplay.textContent = formatStopwatchTime(0);
    renderLaps();
    els.btnReset.disabled = true;
    els.btnLap.disabled = true;
    els.lapCount.textContent = "0 Laps";
}

// LAP
function lapStopwatch() {
    if (!state.stopwatch.isRunning) return;

    const now = Date.now();
    const currentTotal = state.stopwatch.elapsedTime + (now - state.stopwatch.startTime);
    const lastLapTotal = state.stopwatch.laps.length > 0 ? state.stopwatch.laps[state.stopwatch.laps.length - 1].total : 0;
    const splitTime = currentTotal - lastLapTotal;

    const lap = {
        index: state.stopwatch.laps.length + 1,
        total: currentTotal,
        split: splitTime
    };
    state.stopwatch.laps.push(lap); // single lap per click
    renderLaps();
}

// RENDER LAPS
function renderLaps() {
    if (state.stopwatch.laps.length === 0) {
        els.lapsList.innerHTML = '<div class="text-center py-8 text-gray-500 text-sm italic">No laps recorded yet</div>';
        els.lapCount.textContent = "0 Laps";
        return;
    }

    els.lapsList.innerHTML = state.stopwatch.laps.map(lap => `
        <div class="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors animate-[fadeIn_0.3s_ease-out]">
            <div class="flex items-center gap-3">
                <span class="text-xs font-bold text-gray-500 w-6">#${lap.index}</span>
                <span class="text-sm font-mono-digit text-white">${formatStopwatchTime(lap.total)}</span>
            </div>
            <span class="text-xs font-mono-digit text-cyan-400">+${formatStopwatchTime(lap.split)}</span>
        </div>
    `).join('');
    els.lapCount.textContent = `${state.stopwatch.laps.length} Lap${state.stopwatch.laps.length !== 1 ? 's' : ''}`;
}

// === TAB SWITCHING ===
function switchTab(tabName) {
    const clockSection = document.getElementById('clock-section');
    const stopwatchSection = document.getElementById('stopwatch-section');
    const btnClock = document.getElementById('btn-clock');
    const btnStopwatch = document.getElementById('btn-stopwatch');

    if (tabName === 'clock') {
        clockSection.classList.add('active');
        stopwatchSection.classList.remove('active');

        btnClock.classList.add('bg-white/10', 'text-cyan-300', 'shadow-lg');
        btnClock.classList.remove('text-gray-400', 'hover:text-white', 'hover:bg-white/5');

        btnStopwatch.classList.remove('bg-white/10', 'text-pink-300', 'shadow-lg');
        btnStopwatch.classList.add('text-gray-400', 'hover:text-white', 'hover:bg-white/5');
    } else {
        stopwatchSection.classList.add('active');
        clockSection.classList.remove('active');

        btnStopwatch.classList.add('bg-white/10', 'text-pink-300', 'shadow-lg');
        btnStopwatch.classList.remove('text-gray-400', 'hover:text-white', 'hover:bg-white/5');

        btnClock.classList.remove('bg-white/10', 'text-cyan-300', 'shadow-lg');
        btnClock.classList.add('text-gray-400', 'hover:text-white', 'hover:bg-white/5');
    }
}

// === INITIALIZATION ===
setInterval(updateClock, 1000);
updateClock();
els.swDisplay.textContent = formatStopwatchTime(0);
switchTab('clock');

// === EVENT LISTENERS ===
els.btnStart.addEventListener('click', startStopwatch);
els.btnPause.addEventListener('click', pauseStopwatch);
els.btnReset.addEventListener('click', resetStopwatch);
els.btnLap.addEventListener('click', lapStopwatch);
els.formatBtn.addEventListener('click', toggleFormat);
document.getElementById('btn-clock').addEventListener('click', () => switchTab('clock'));
document.getElementById('btn-stopwatch').addEventListener('click', () => switchTab('stopwatch'));


tsParticles.load("tsparticles", {
  fullScreen: { enable: false },

  background: {
    color: "transparent"
  },

  fpsLimit: 60,

  particles: {
    number: {
      value: 70,
      density: {
        enable: true,
        area: 800
      }
    },

    color: {
      value: ["#22d3ee", "#a855f7", "#ec4899"]
    },

    shape: {
      type: "circle"
    },

    opacity: {
      value: 0.6
    },

    size: {
      value: { min: 1, max: 3 }
    },

    links: {
      enable: true,
      distance: 140,
      color: "#22d3ee",
      opacity: 0.3,
      width: 1
    },

    move: {
      enable: true,
      speed: 1.2,
      direction: "none",
      random: false,
      straight: false,
      outModes: {
        default: "out"
      }
    }
  },

  interactivity: {
    events: {
      onHover: {
        enable: true,
        mode: "grab"
      },
      resize: true
    },
    modes: {
      grab: {
        distance: 160,
        links: {
          opacity: 0.6
        }
      }
    }
  },

  detectRetina: true
});
