/**
 * LIQUID GLASS ENGINE: Sound & Specular Tracking
 */

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const soundLibrary = {
    firm: { url: '/audio/glass-firm.wav', buffer: null },
    soft: { url: '/audio/glass-soft.wav', buffer: null }
};

// 1. STATE TRACKING
let lastMouseX = 0, lastMouseY = 0, lastTimestamp = 0, mouseVelocity = 0;
const debugEl = createDebugger(); // Calibration tool

// 2. CORE TRACKER (Motion & CSS Variables)
window.addEventListener('mousemove', (e) => {
    const now = performance.now();
    const dt = now - lastTimestamp;
    if (dt < 10) return; 

    const dx = e.clientX - lastMouseX;
    const dy = e.clientY - lastMouseY;
    
    // Calculate Velocity (px/ms)
    mouseVelocity = Math.sqrt(dx*dx + dy*dy) / dt;

    // Update CSS for the Specular Glint
    document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
    document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);

    // Update Calibration Readout
    debugEl.innerText = `Velocity: ${mouseVelocity.toFixed(2)} px/ms`;

    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    lastTimestamp = now;
});

// 3. THE INTERACTIVE STRIKE (Audio Trigger)
document.addEventListener('mouseover', (e) => {
    const target = e.target.closest('.logo-glass-wrap, .glass-button, .back-to-top');
    if (!target) return;

    // Velocity-based Volume Mapping
    let volume = Math.min(Math.max(mouseVelocity * 0.1, 0.01), 0.25);
    const soundType = target.classList.contains('logo-glass-wrap') ? 'firm' : 'soft';
    
    // Log to console for fine-tuning
    console.log(`%c Strike! ${soundType} | Vol: ${volume.toFixed(2)}`, "color: #ffaa00");
    
    playGlassSound(soundType, volume);
});

// Haptic "Tink" on Click
document.addEventListener('mousedown', (e) => {
    const target = e.target.closest('.glass-button, .back-to-top');
    if (target) playGlassSound('firm', 0.05);
    
    // Unlock Audio Context on first click (Browser Safety)
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
        loadSounds();
    }
}, { once: false });

// 4. AUDIO UTILITIES
async function loadSounds() {
    if (soundLibrary.firm.buffer) return; // Prevent double loading
    for (const key in soundLibrary) {
        try {
            const response = await fetch(soundLibrary[key].url);
            const arrayBuffer = await response.arrayBuffer();
            soundLibrary[key].buffer = await audioCtx.decodeAudioData(arrayBuffer);
        } catch (err) {
            console.error("Audio Load Error:", err);
        }
    }
}

function playGlassSound(type, volume = 0.2) {
    if (!soundLibrary[type].buffer) return;
    const source = audioCtx.createBufferSource();
    const gainNode = audioCtx.createGain();
    source.buffer = soundLibrary[type].buffer;
    gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
    source.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    source.start(0);
}

function createDebugger() {
    const el = document.createElement('div');
    el.style.cssText = "position:fixed;top:10px;right:10px;padding:10px;background:rgba(0,0,0,0.8);color:#0f0;font-family:monospace;z-index:9999;font-size:12px;pointer-events:none;border-radius:4px;";
    document.body.appendChild(el);
    return el;
}