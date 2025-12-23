
let audioContext: AudioContext | null = null;
let selectedVoice: SpeechSynthesisVoice | null = null;
let isAudioUnlocked = false;

/**
 * Busca y selecciona la mejor voz disponible en español.
 */
const loadVoice = () => {
  if (!('speechSynthesis' in window)) return;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    selectedVoice = voices.find(v => v.lang.includes('es-MX')) || 
                    voices.find(v => v.lang.includes('es-US')) ||
                    voices.find(v => v.lang.includes('es-ES')) ||
                    voices.find(v => v.lang.startsWith('es')) ||
                    null;
  }
};

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = loadVoice;
  loadVoice();
}

/**
 * Activa físicamente el hardware de audio. 
 * CRÍTICO: Debe ser llamado por un evento de clic directo del usuario.
 */
export const initAudio = () => {
  if (isAudioUnlocked) {
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume();
    }
    return;
  }

  try {
    const AudioCtx = (window.AudioContext || (window as any).webkitAudioContext);
    if (AudioCtx) {
      audioContext = new AudioCtx();
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      
      const osc = audioContext.createOscillator();
      const g = audioContext.createGain();
      g.gain.setValueAtTime(0.0001, audioContext.currentTime); // Valor casi cero pero positivo
      osc.connect(g);
      g.connect(audioContext.destination);
      osc.start(0);
      osc.stop(audioContext.currentTime + 0.01);
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(" ");
      utter.volume = 0;
      utter.rate = 10;
      window.speechSynthesis.speak(utter);
      loadVoice();
    }
    
    isAudioUnlocked = true;
    console.log("✅ Audio desbloqueado correctamente.");
  } catch (e) {
    console.error("❌ Error al activar audio:", e);
  }
};

export const speakText = (text: string, options?: { pitch?: number, rate?: number }) => {
  if (!('speechSynthesis' in window)) return;
  if (!isAudioUnlocked) initAudio();

  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'es-MX';
  utterance.pitch = options?.pitch ?? 1.1; 
  utterance.rate = options?.rate ?? 0.95;
  
  if (!selectedVoice) loadVoice();
  if (selectedVoice) utterance.voice = selectedVoice;
  
  utterance.onerror = (e: any) => {
    if (e.error !== 'interrupted' && e.error !== 'not-allowed') {
      console.warn("SpeechSynthesis warning:", e.error);
    }
  };
  
  window.speechSynthesis.speak(utterance);
};

export type SoundEffectType = 'correct' | 'incorrect' | 'complete' | 'pop' | 'drag' | 'drop';

export const playSoundEffect = (type: SoundEffectType) => {
  try {
    if (!audioContext) initAudio();
    if (!audioContext || audioContext.state === 'closed') return;
    
    if (audioContext.state === 'suspended') audioContext.resume();

    const now = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(audioContext.destination);

    if (type === 'pop') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.1);
      osc.start(); osc.stop(now + 0.1);
    } else if (type === 'drag') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, now);
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.05);
      osc.start(); osc.stop(now + 0.05);
    } else if (type === 'drop') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.linearRampToValueAtTime(0, now + 0.1);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.1);
      osc.start(); osc.stop(now + 0.1);
    } else if (type === 'correct') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.2);
      gain.gain.setValueAtTime(0.1, now);
      // FIX: exponentialRampToValueAtTime cannot ramp to 0. Using 0.001 instead.
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(); osc.stop(now + 0.2);
    } else if (type === 'incorrect') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(70, now + 0.3);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.3);
      osc.start(); osc.stop(now + 0.3);
    } else if (type === 'complete') {
      [523, 659, 783, 1046].forEach((f, i) => {
        const o = audioContext!.createOscillator();
        const g = audioContext!.createGain();
        o.connect(g); g.connect(audioContext!.destination);
        o.frequency.value = f;
        g.gain.setValueAtTime(0.08, now + i * 0.1);
        g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.4);
        o.start(now + i * 0.1); o.stop(now + i * 0.1 + 0.4);
      });
    }
  } catch (e) {
    console.error("Error al reproducir sonido:", e);
  }
};

export const getDynamicInstruction = async (gameType: string, target: string, gender: 'm' | 'f' | 'mp' | 'fp' = 'm') => {
  const articles = { m: 'el', f: 'la', mp: 'los', fp: 'las' };
  const art = articles[gender] || 'el';
  
  const instructions: Record<string, string[]> = {
    "contar": [`¡Vamos a contar ${target}!`, `¿Me ayudas a contar ${target}?`, `¡Contemos juntos!`],
    "reconocer partes del rostro": [`¿Dónde están ${art} ${target}?`, `¡Toca ${art} ${target}!`],
    "shapes": [`Busca ${art} ${target} de colores`, `¿Dónde está ${art} ${target}?`],
    "sizes": [`Toca ${art === 'el' || art === 'los' ? 'el' : 'la'} más ${target}`],
    "patterns": [`¿Qué sigue ahora?`, `¡Completa el patrón!`],
    "builder": ["¡Vamos a construir!", "Pon las piezas donde quieras."]
  };

  const pool = instructions[gameType] || [`Busca ${target}`];
  return pool[Math.floor(Math.random() * pool.length)];
};

export const getEncouragement = async (buddyName: string, action: string) => {
  const messages = ["¡Lo hiciste genial!", "¡Eres increíble!", "¡Muy bien!", "¡Excelente!", "¡Bravo!"];
  return messages[Math.floor(Math.random() * messages.length)];
};
