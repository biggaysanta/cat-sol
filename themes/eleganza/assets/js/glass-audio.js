const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const soundLibrary = {
    firm: { url: '/audio/glass-firm.wav', buffer: null },
    soft: { url: '/audio/glass-soft.wav', buffer: null }
};

// Preload the "Final Boss" samples
async function loadSounds() {
    for (const key in soundLibrary) {
        const response = await fetch(soundLibrary[key].url);
        const arrayBuffer = await response.arrayBuffer();
        soundLibrary[key].buffer = await audioCtx.decodeAudioData(arrayBuffer);
    }
}

function playGlassSound(type, volume = 0.2) {
    if (!soundLibrary[type].buffer) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const source = audioCtx.createBufferSource();
    const gainNode = audioCtx.createGain();

    source.buffer = soundLibrary[type].buffer;
    
    // Intimate Mix: keep it subtle
    gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
    
    source.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    source.start(0);
}

// Initialize on first user interaction (Browser requirement)
window.addEventListener('mousedown', loadSounds, { once: true });
window.addEventListener('keydown', loadSounds, { once: true });

document.addEventListener('DOMContentLoaded', () => {
    // 1. The Orange Logo: Firm strike for "Material Density"
    const logo = document.querySelector('.logo-glass-wrap');
    logo?.addEventListener('mouseenter', () => playGlassSound('firm', 0.15));

    // 2. The Glass Buttons: Softer strike for "Substrate Interaction"
    const buttons = document.querySelectorAll('.glass-button, .back-to-top');
    buttons.forEach(btn => {
        btn.addEventListener('mouseenter', () => playGlassSound('soft', 0.1));
        // Add a secondary "tink" on click for haptic feedback
        btn.addEventListener('mousedown', () => playGlassSound('firm', 0.05));
    });
});

let lastMouseX = 0;
let lastMouseY = 0;
let lastTimestamp = 0;
let mouseVelocity = 0;

// Track mouse speed sitewide
window.addEventListener('mousemove', (e) => {
    const now = performance.now();
    const dt = now - lastTimestamp;
    const dx = e.clientX - lastMouseX;
    const dy = e.clientY - lastMouseY;
    
    // Distance / Time = Velocity
    mouseVelocity = Math.sqrt(dx*dx + dy*dy) / dt;

    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    lastTimestamp = now;
});

// The Interactive Listener
document.addEventListener('mouseover', (e) => {
    const target = e.target.closest('.logo-glass-wrap, .glass-button, .back-to-top');
    if (!target) return;

    // Map velocity to volume: min 0.02 (ghostly) to max 0.2 (clear clink)
    let volume = Math.min(Math.max(mouseVelocity * 0.05, 0.02), 0.2);
    
    // Determine material strike based on class
    const soundType = target.classList.contains('logo-glass-wrap') ? 'firm' : 'soft';
    
    playGlassSound(soundType, volume);
});
