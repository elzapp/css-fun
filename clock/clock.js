/**
 * Swiss Railway Clock — Init Only
 *
 * Sets negative animation-delay values so CSS animations
 * start at the correct position for the current time.
 * After this runs, everything is pure CSS.
 */

const now = new Date();
const hours = now.getHours() % 12;
const minutes = now.getMinutes();
const seconds = now.getSeconds() + now.getMilliseconds() / 1000;

// Hour hand: how far into a 12-hour cycle we are
const hourOffset = hours * 3600 + minutes * 60 + seconds;

// Minute hand: how far into a 60-minute cycle (steps, so only full minutes matter)
const minuteOffset = minutes * 60 + seconds;

// Second hand: how far into a 60-second cycle
// The animation maps 0–58.5s of animation time to 0–360°, then holds 58.5–60s.
// We need to find the animation-time that corresponds to the current real second.
// If real seconds < 58.5: animation-time = seconds (sweep phase matches real time)
// If real seconds >= 58.5: animation-time = seconds (we're in the pause zone)
const secondOffset = seconds;

const clock = document.querySelector('.clock');
clock.style.setProperty('--hour-delay', `-${hourOffset}s`);
clock.style.setProperty('--minute-delay', `-${minuteOffset}s`);
clock.style.setProperty('--second-delay', `-${secondOffset}s`);

// Double-tap/double-click to toggle fullscreen
function toggleFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    document.documentElement.requestFullscreen();
  }
}

document.addEventListener('dblclick', toggleFullscreen);

let lastTap = 0;
document.addEventListener('touchend', (e) => {
  const now = Date.now();
  if (now - lastTap < 300) {
    e.preventDefault();
    toggleFullscreen();
  }
  lastTap = now;
});

// Wake Lock: keep screen awake only in fullscreen
let wakeLock = null;

async function requestWakeLock() {
  if ('wakeLock' in navigator) {
    try {
      wakeLock = await navigator.wakeLock.request('screen');
    } catch (_) {}
  }
}

function releaseWakeLock() {
  if (wakeLock) {
    wakeLock.release();
    wakeLock = null;
  }
}

document.addEventListener('fullscreenchange', () => {
  if (document.fullscreenElement) {
    requestWakeLock();
  } else {
    releaseWakeLock();
  }
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && document.fullscreenElement) {
    requestWakeLock();
  }
});
