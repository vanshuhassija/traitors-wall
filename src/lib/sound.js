// Knife-slash sound effect, served from public/sounds/stab.mp3.
const STAB_SOUND_SRC = '/sounds/stab.mp3';
let stabAudio = null;

function getStabAudio() {
  if (!stabAudio) {
    stabAudio = new Audio(STAB_SOUND_SRC);
    stabAudio.preload = 'auto';
  }
  return stabAudio;
}

// Browsers block audio until a user gesture. Call this from a click handler
// (e.g. a "tap to enable sound" button in the User View) before any elimination fires.
export function primeAudio() {
  try {
    const audio = getStabAudio();
    const originalVolume = audio.volume;
    audio.volume = 0;
    audio
      .play()
      .then(() => {
        audio.pause();
        audio.currentTime = 0;
        audio.volume = originalVolume;
      })
      .catch(() => {
        audio.volume = originalVolume;
      });
  } catch (err) {
    console.warn('Unable to prime audio', err);
  }
}

export function playStabSound() {
  try {
    const audio = getStabAudio();
    audio.currentTime = 0;
    audio.play().catch((err) => console.warn('Unable to play stab sound', err));
  } catch (err) {
    console.warn('Unable to play stab sound effect', err);
  }
}
