// Pizza Classic Single Page Application Logic

// Pizza Data
const pizzas = [
  {
    id: 1,
    name: 'Margherita',
    category: 'vegetarian',
    description: 'Neapolitan style pizza with aromatic San Marzano tomato sauce, fresh mozzarella di bufala slices, fresh basil leaves, and a drizzle of extra virgin olive oil.',
    price: 12.99,
    image: 'assets/images/pizza_margherita.png'
  },
  {
    id: 2,
    name: 'Pepperoni',
    category: 'meat',
    description: 'A classic crowd-pleaser topped with rich tomato sauce, melted mozzarella, and a generous double layer of crispy, curled pepperoni slices.',
    price: 14.99,
    image: 'assets/images/pizza_pepperoni.png'
  },
  {
    id: 3,
    name: 'Veggie Supreme',
    category: 'vegetarian',
    description: 'A colorful garden delight with grilled bell peppers, caramelized red onions, sweet corn, black olives, cherry tomatoes, and sliced mushrooms.',
    price: 13.99,
    image: 'assets/images/pizza_veggie.png'
  },
  {
    id: 4,
    name: 'BBQ Chicken',
    category: 'meat',
    description: 'Smoky sweet BBQ sauce base, grilled chicken breast strips, sharp red onion slivers, melted smoked gouda, and fresh cilantro leaves.',
    price: 15.99,
    image: 'assets/images/pizza_bbq_chicken.png'
  },
  {
    id: 5,
    name: 'Gourmet Seafood',
    category: 'seafood',
    description: 'White garlic herb butter base topped with wild tiger shrimp, tender calamari rings, garlic confit, fresh parsley, and a squeeze of fresh lemon juice.',
    price: 18.99,
    image: 'assets/images/pizza_seafood.png'
  },
  {
    id: 6,
    name: 'Four Cheese (Quattro Formaggi)',
    category: 'vegetarian',
    description: 'A rich creamy blend of golden Mozzarella, sharp Gorgonzola, aged Parmesan, and soft creamy Goat cheese with a pinch of fresh oregano.',
    price: 14.49,
    image: 'assets/images/pizza_four_cheese.png'
  },
  {
    id: 7,
    name: 'Super Supreme',
    category: 'meat',
    description: 'The ultimate combo pizza loaded with pepperoni, Italian sausage, smoked ham, green peppers, sweet onions, black olives, and mushrooms.',
    price: 16.99,
    image: 'assets/images/pizza_super_supreme.png'
  },
  {
    id: 8,
    name: 'Truffle Mushroom',
    category: 'vegetarian',
    description: 'Creamy white sauce base, wild porcini and portobello mushrooms, caramelized onions, fresh thyme, finished with a premium white truffle oil drizzle.',
    price: 15.49,
    image: 'assets/images/pizza_mushroom.png'
  },
  {
    id: 9,
    name: 'Hot Dog Pizza',
    category: 'meat',
    description: 'A fun gourmet novelty topped with premium sliced frankfurter sausages, bubbling cheddar cheese, crispy fried onions, drizzled with mustard and organic ketchup.',
    price: 13.49,
    image: 'assets/images/pizza_hot_dog.png'
  }
];

// App State
const state = {
  user: null,
  cart: [],
  activeRoute: 'home',
  activeCategory: 'all',
  searchQuery: '',
  musicPlaying: false,
  currentTrackIndex: 0,
  volume: 0.3
};

// Simulated Database (LocalStorage)
const MOCK_USERS = JSON.parse(localStorage.getItem('pizza_users')) || [
  { email: 'admin@pizzaclassic.com', password: 'admin123', name: 'Chef Mario' }
];

// ----------------------------------------------------
// WEB AUDIO SYNTHESIZER FOR BACKGROUND MUSIC & SOUNDS
// ----------------------------------------------------

let audioCtx = null;
let musicNode = null;
let currentSynthNotes = [];
let sequencerTimer = null;
let tempo = 120;
let lookahead = 25.0; // Scheduling timer interval in milliseconds
let nextNoteTime = 0.0;
let currentNoteIndex = 0;
let isMusicInitialized = false;

// MIDI Note Converter
function midiToFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// Sound Synthesis Library
const musicTracks = [
  {
    name: "Tarantella (Italian Folk)",
    tempo: 150,
    timeSignature: 6, // 6/8 time
    // Melody note, duration (in steps, 1 step = 1/8 note)
    // 0 = rest
    melody: [
      { n: 69, d: 1 }, { n: 71, d: 1 }, { n: 72, d: 1 }, { n: 71, d: 1 }, { n: 69, d: 1 }, { n: 71, d: 1 }, // A B C B A B
      { n: 72, d: 1 }, { n: 71, d: 1 }, { n: 69, d: 1 }, { n: 76, d: 3 }, // C B A E
      { n: 76, d: 1 }, { n: 74, d: 1 }, { n: 72, d: 1 }, { n: 71, d: 1 }, { n: 72, d: 1 }, { n: 74, d: 1 }, // E D C B C D
      { n: 72, d: 3 }, { n: 69, d: 3 }, // C A
      { n: 71, d: 1 }, { n: 68, d: 1 }, { n: 69, d: 1 }, { n: 71, d: 1 }, { n: 64, d: 1 }, { n: 64, d: 1 }, // B G# A B E E
      { n: 64, d: 3 }, { n: 69, d: 3 }, // E A
      { n: 71, d: 1 }, { n: 68, d: 1 }, { n: 69, d: 1 }, { n: 71, d: 1 }, { n: 64, d: 1 }, { n: 64, d: 1 }, // B G# A B E E
      { n: 69, d: 6 }  // A
    ],
    // Accompanying chords (one chord per 3 beats / half bar)
    chords: [
      [57, 60, 64], [57, 60, 64], [57, 60, 64], [57, 60, 64], // Am
      [53, 57, 60], [53, 57, 60], [57, 60, 64], [57, 60, 64], // F, Am
      [52, 56, 59], [52, 56, 59], [57, 60, 64], [57, 60, 64], // E, Am
      [52, 56, 59], [52, 56, 59], [57, 60, 64], [57, 60, 64]  // E, Am
    ]
  },
  {
    name: "Bach Prelude in C",
    tempo: 110,
    timeSignature: 8, // 8 beats per pattern bar
    // Standard C Major Prelude arpeggio chords
    // Played note by note: 0-1-2-3-4-2-3-4
    chords: [
      [48, 52, 55, 60, 64], // C Major
      [48, 50, 57, 62, 65], // D minor 7 / C
      [47, 50, 55, 62, 65], // G7 / B
      [48, 52, 55, 60, 64], // C Major
      [48, 52, 57, 60, 69], // A minor / C
      [42, 45, 50, 57, 60], // D7 / F#
      [43, 47, 50, 55, 59], // G Major
      [40, 43, 48, 55, 60]  // C Major 7 / E
    ]
  },
  {
    name: "Beethoven's Ode to Joy",
    tempo: 120,
    timeSignature: 4, // 4/4 time
    melody: [
      { n: 64, d: 2 }, { n: 64, d: 2 }, { n: 65, d: 2 }, { n: 67, d: 2 }, // Mi Mi Fa Sol
      { n: 67, d: 2 }, { n: 65, d: 2 }, { n: 64, d: 2 }, { n: 62, d: 2 }, // Sol Fa Mi Re
      { n: 60, d: 2 }, { n: 60, d: 2 }, { n: 62, d: 2 }, { n: 64, d: 2 }, // Do Do Re Mi
      { n: 64, d: 3 }, { n: 62, d: 1 }, { n: 62, d: 4 },                 // Mi. Re Re_
      { n: 64, d: 2 }, { n: 64, d: 2 }, { n: 65, d: 2 }, { n: 67, d: 2 }, // Mi Mi Fa Sol
      { n: 67, d: 2 }, { n: 65, d: 2 }, { n: 64, d: 2 }, { n: 62, d: 2 }, // Sol Fa Mi Re
      { n: 60, d: 2 }, { n: 60, d: 2 }, { n: 62, d: 2 }, { n: 64, d: 2 }, // Do Do Re Mi
      { n: 62, d: 3 }, { n: 60, d: 1 }, { n: 60, d: 4 }                  // Re. Do Do_
    ],
    chords: [
      [48, 52, 55], [48, 52, 55], [47, 50, 55], [47, 50, 55],
      [48, 52, 55], [48, 52, 55], [47, 50, 55], [47, 50, 55],
      [48, 52, 55], [48, 52, 55], [47, 50, 55], [47, 50, 55],
      [48, 52, 55], [47, 50, 55], [48, 52, 55], [48, 52, 55]
    ]
  }
];

function initAudio() {
  if (isMusicInitialized) return;
  
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  audioCtx = new AudioContext();
  
  // Create primary gain node for volume control
  musicNode = audioCtx.createGain();
  musicNode.gain.setValueAtTime(state.volume, audioCtx.currentTime);
  musicNode.connect(audioCtx.destination);
  
  isMusicInitialized = true;
}

// Play a single note synthetically
function playSynthNote(pitch, startTime, duration, voiceType = 'triangle') {
  if (!audioCtx) return;
  
  const osc = audioCtx.createOscillator();
  const oscGain = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();
  
  osc.type = voiceType;
  osc.frequency.setValueAtTime(midiToFreq(pitch), startTime);
  
  // Make Tarantella pluckier, Bach smoother
  if (voiceType === 'triangle') {
    // Lowpass filter for warm tone (warm rhodes style)
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, startTime);
    filter.Q.setValueAtTime(1, startTime);
    
    // Smooth volume envelope
    oscGain.gain.setValueAtTime(0, startTime);
    oscGain.gain.linearRampToValueAtTime(0.2, startTime + 0.015);
    oscGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration - 0.02);
  } else if (voiceType === 'sine') {
    // Pure sine for bass lines
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, startTime);
    
    oscGain.gain.setValueAtTime(0, startTime);
    oscGain.gain.linearRampToValueAtTime(0.25, startTime + 0.03);
    oscGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration - 0.01);
  } else {
    // Soft saw for melody lead
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, startTime);
    filter.frequency.exponentialRampToValueAtTime(400, startTime + duration - 0.05);
    
    oscGain.gain.setValueAtTime(0, startTime);
    oscGain.gain.linearRampToValueAtTime(0.12, startTime + 0.02);
    oscGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration - 0.02);
  }
  
  osc.connect(filter);
  filter.connect(oscGain);
  oscGain.connect(musicNode);
  
  osc.start(startTime);
  osc.stop(startTime + duration);
  
  // Track active sound nodes to dispose on stop
  currentSynthNotes.push(osc);
}

// Sequencer Scheduler
function scheduleNextNotes() {
  const track = musicTracks[state.currentTrackIndex];
  const stepDuration = 60.0 / track.tempo / (state.currentTrackIndex === 1 ? 2 : 1); // 16th notes for Bach
  
  while (nextNoteTime < audioCtx.currentTime + 0.1) {
    if (state.currentTrackIndex === 1) {
      // Bach Prelude Sequencer (arpeggio based)
      const chordIndex = Math.floor(currentNoteIndex / 16) % track.chords.length;
      const currentChord = track.chords[chordIndex];
      const noteOffset = currentNoteIndex % 16;
      
      let noteToPlay = 0;
      // Arpeggio pattern: 0, 1, 2, 3, 4, 2, 3, 4 repeated twice per chord bar
      const pattern = [0, 1, 2, 3, 4, 2, 3, 4, 0, 1, 2, 3, 4, 2, 3, 4];
      const pi = pattern[noteOffset];
      noteToPlay = currentChord[pi];
      
      // Play melody / arpeggio pluck
      playSynthNote(noteToPlay, nextNoteTime, stepDuration * 0.95, 'triangle');
      
      // Add a soft sub-bass note on the first note of each bar
      if (noteOffset === 0) {
        playSynthNote(currentChord[0] - 12, nextNoteTime, stepDuration * 7.5, 'sine');
      }
      
      currentNoteIndex++;
    } 
    else if (state.currentTrackIndex === 0) {
      // Tarantella Sequencer
      // 6/8 rhythmic accompaniment (Am - E)
      const barStep = currentNoteIndex % 24; // 24 steps per full loop block
      const chordIndex = Math.floor(currentNoteIndex / 6) % track.chords.length;
      const bassChord = track.chords[chordIndex];
      
      // Tarantella bass accompaniment: Bass (step 0), chord pluck (step 1,2,3), rest (4,5)
      const accompanimentOffset = currentNoteIndex % 6;
      if (accompanimentOffset === 0) {
        playSynthNote(bassChord[0] - 12, nextNoteTime, stepDuration * 0.8, 'sine'); // Root bass note
      } else if (accompanimentOffset === 1 || accompanimentOffset === 2 || accompanimentOffset === 4 || accompanimentOffset === 5) {
        playSynthNote(bassChord[1], nextNoteTime, stepDuration * 0.5, 'triangle'); // Chord note
        playSynthNote(bassChord[2], nextNoteTime, stepDuration * 0.5, 'triangle');
      }
      
      // Tarantella melody scheduler
      // Find current note based on accumulated duration
      let currentMelodyStep = currentNoteIndex % 48; // Loop melody after 48 steps
      let melodyAcc = 0;
      let targetNote = 0;
      
      for (let i = 0; i < track.melody.length; i++) {
        const note = track.melody[i];
        if (currentMelodyStep >= melodyAcc && currentMelodyStep < melodyAcc + note.d) {
          // Play note at the onset of its duration block
          if (currentMelodyStep === melodyAcc) {
            playSynthNote(note.n, nextNoteTime, stepDuration * note.d * 0.85, 'sawtooth');
          }
          break;
        }
        melodyAcc += note.d;
      }
      
      currentNoteIndex++;
    } 
    else if (state.currentTrackIndex === 2) {
      // Ode to Joy Sequencer
      const barStep = currentNoteIndex % 32; // 32 steps per melody loop
      let stepAcc = 0;
      let targetMelodyNote = 0;
      
      // Match melody note based on duration step accumulator
      for (let i = 0; i < track.melody.length; i++) {
        const mNote = track.melody[i];
        if (barStep >= stepAcc && barStep < stepAcc + mNote.d) {
          if (barStep === stepAcc) {
            playSynthNote(mNote.n, nextNoteTime, stepDuration * mNote.d * 0.9, 'triangle');
          }
          break;
        }
        stepAcc += mNote.d;
      }
      
      // Play a soft chord pad on the background
      const chordIndex = Math.floor(currentNoteIndex / 4) % track.chords.length;
      if (currentNoteIndex % 4 === 0) {
        const chord = track.chords[chordIndex];
        playSynthNote(chord[0] - 12, nextNoteTime, stepDuration * 3.8, 'sine');
        playSynthNote(chord[0], nextNoteTime, stepDuration * 3.8, 'triangle');
        playSynthNote(chord[1], nextNoteTime, stepDuration * 3.8, 'triangle');
      }
      
      currentNoteIndex++;
    }
    
    nextNoteTime += stepDuration;
  }
  
  sequencerTimer = setTimeout(scheduleNextNotes, lookahead);
}

// Start Music Sequencer
function startMusic() {
  initAudio();
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  
  stopMusicPlayback();
  
  state.musicPlaying = true;
  nextNoteTime = audioCtx.currentTime + 0.05;
  currentNoteIndex = 0;
  
  scheduleNextNotes();
  updateMusicUI();
}

// Stop Music Sequencer
function stopMusicPlayback() {
  if (sequencerTimer) {
    clearTimeout(sequencerTimer);
    sequencerTimer = null;
  }
  
  // Stop and clear all active notes
  currentSynthNotes.forEach(node => {
    try { node.stop(); } catch (e) {}
  });
  currentSynthNotes = [];
}

function pauseMusic() {
  state.musicPlaying = false;
  stopMusicPlayback();
  updateMusicUI();
}

function updateMusicVolume() {
  if (musicNode && audioCtx) {
    musicNode.gain.setValueAtTime(state.volume, audioCtx.currentTime);
  }
}

// Web Audio API Synth: Tomato Splash Squish Sound Effect
function playTomatoSplatSound() {
  initAudio();
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  
  const startTime = audioCtx.currentTime;
  
  // Low-frequency impact thump (Oscillator)
  const osc = audioCtx.createOscillator();
  const oscGain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(140, startTime);
  osc.frequency.exponentialRampToValueAtTime(10, startTime + 0.25);
  
  oscGain.gain.setValueAtTime(0.4, startTime);
  oscGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);
  
  // White noise burst for the liquid squish spray
  const bufferSize = audioCtx.sampleRate * 0.35; // 0.35 seconds
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  
  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;
  
  const noiseFilter = audioCtx.createBiquadFilter();
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.setValueAtTime(1000, startTime);
  noiseFilter.frequency.exponentialRampToValueAtTime(200, startTime + 0.3);
  noiseFilter.Q.setValueAtTime(3, startTime);
  
  const noiseGain = audioCtx.createGain();
  noiseGain.gain.setValueAtTime(0.3, startTime);
  noiseGain.gain.linearRampToValueAtTime(0.4, startTime + 0.05); // quick fade in
  noiseGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);
  
  // Connect thump
  osc.connect(oscGain);
  oscGain.connect(audioCtx.destination);
  
  // Connect liquid spray noise
  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(audioCtx.destination);
  
  osc.start(startTime);
  osc.stop(startTime + 0.26);
  
  noise.start(startTime);
  noise.stop(startTime + 0.36);
}

// ----------------------------------------------------
// DYNAMIC APP ROUTING (SPA)
// ----------------------------------------------------

function navigateTo(route) {
  state.activeRoute = route;
  
  // Update views
  document.querySelectorAll('.view').forEach(view => {
    view.classList.remove('active');
  });
  
  const targetView = document.getElementById(`${route}-view`);
  if (targetView) {
    targetView.classList.add('active');
  }
  
  // Update active links
  document.querySelectorAll('.nav-links li').forEach(li => {
    li.classList.remove('active');
    if (li.getAttribute('data-route') === route) {
      li.classList.add('active');
    }
  });
  
  // Close menu on mobile after clicking
  const navLinks = document.getElementById('nav-links');
  const hamburger = document.getElementById('hamburger');
  if (navLinks && navLinks.classList.contains('active')) {
    navLinks.classList.remove('active');
    hamburger.classList.remove('open');
  }
  
  // If navigating, scroll to top
  window.scrollTo(0, 0);
  
  // Specific view load triggers
  if (route === 'home') {
    renderPizzaProducts();
  } else if (route === 'checkout') {
    renderCheckoutSummary();
  }
}

// ----------------------------------------------------
// AUTHENTICATION CONTROLS
// ----------------------------------------------------

let generatedVerifyCode = '';
let pendingRegUser = null;

function handleLoginSubmit(e) {
  e.preventDefault();
  const emailInput = document.getElementById('login-email').value.trim();
  const passwordInput = document.getElementById('login-password').value;
  
  const matchedUser = MOCK_USERS.find(u => u.email === emailInput && u.password === passwordInput);
  
  if (matchedUser) {
    state.user = matchedUser;
    showToast(`Welcome back, ${matchedUser.name}!`, 'success');
    updateUserAuthUI();
    navigateTo('home');
  } else {
    showToast('Invalid email or password. Hint: admin@pizzaclassic.com / admin123', 'error');
  }
}

function handleRegisterSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const confirmPassword = document.getElementById('reg-confirm-password').value;
  
  if (password !== confirmPassword) {
    showToast('Passwords do not match.', 'error');
    return;
  }
  
  if (MOCK_USERS.find(u => u.email === email)) {
    showToast('Email already registered.', 'error');
    return;
  }
  
  // Setup pending registration
  pendingRegUser = { name, email, password };
  
  // Generate verification code
  generatedVerifyCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Show Verification Modal
  document.getElementById('register-modal').classList.remove('active');
  document.getElementById('verification-modal').classList.add('active');
  document.getElementById('verification-code-value').textContent = generatedVerifyCode;
  
  showToast('Email verification code generated!', 'info');
}

function handleVerificationSubmit(e) {
  e.preventDefault();
  const enteredCode = document.getElementById('verification-code-input').value.trim();
  
  if (enteredCode === generatedVerifyCode) {
    // Add pending user to MOCK_USERS list
    MOCK_USERS.push(pendingRegUser);
    localStorage.setItem('pizza_users', JSON.stringify(MOCK_USERS));
    
    // Automatically log in
    state.user = pendingRegUser;
    pendingRegUser = null;
    generatedVerifyCode = '';
    
    document.getElementById('verification-modal').classList.remove('active');
    showToast('Account verified and created successfully!', 'success');
    updateUserAuthUI();
    navigateTo('home');
  } else {
    showToast('Incorrect verification code. Please try again.', 'error');
  }
}

function logoutUser() {
  state.user = null;
  showToast('Logged out successfully.', 'info');
  updateUserAuthUI();
  navigateTo('home');
}

// ----------------------------------------------------
// HOMEPAGE MENU RENDERING, FILTERS, & SEARCH
// ----------------------------------------------------

function renderPizzaProducts() {
  const gridContainer = document.getElementById('pizza-grid');
  if (!gridContainer) return;
  
  gridContainer.innerHTML = '';
  
  // Apply filters
  const filtered = pizzas.filter(pizza => {
    const matchesCategory = state.activeCategory === 'all' || pizza.category === state.activeCategory;
    const matchesSearch = pizza.name.toLowerCase().includes(state.searchQuery.toLowerCase()) || 
                          pizza.description.toLowerCase().includes(state.searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  
  if (filtered.length === 0) {
    gridContainer.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--color-text-muted);">
        <p style="font-size: 1.2rem;">No pizzas found matching "${state.searchQuery}" in this category.</p>
      </div>
    `;
    return;
  }
  
  filtered.forEach(pizza => {
    const card = document.createElement('div');
    card.className = 'pizza-card';
    card.innerHTML = `
      <div class="pizza-img-wrapper">
        <img src="${pizza.image}" alt="${pizza.name}" loading="lazy" />
        <span class="pizza-badge">${pizza.category}</span>
      </div>
      <div class="pizza-info">
        <div class="pizza-title-price">
          <h3 class="pizza-title">${pizza.name}</h3>
          <span class="pizza-price">$${pizza.price.toFixed(2)}</span>
        </div>
        <p class="pizza-desc">${pizza.description}</p>
        <div class="pizza-actions">
          <button class="btn-add-cart" data-id="${pizza.id}">
            <svg viewBox="0 0 24 24"><path d="M11 9h2V6h3V4h-3V1h-2v3H8v2h3v3zm-4 9c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zm-8.9-5h7.45c.75 0 1.41-.41 1.75-1.03l3.86-7.01L19.42 4l-3.87 7H8.53L4.27 2H1v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63z"/></svg>
            Add to Cart
          </button>
        </div>
      </div>
    `;
    gridContainer.appendChild(card);
  });
  
  // Attach Event Listeners to Buttons
  gridContainer.querySelectorAll('.btn-add-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.getAttribute('data-id'));
      addToCart(id);
    });
  });
}

// ----------------------------------------------------
// SHOPPING CART & SIDE DRAWER
// ----------------------------------------------------

function addToCart(pizzaId) {
  const itemInCart = state.cart.find(item => item.pizzaId === pizzaId);
  
  if (itemInCart) {
    itemInCart.quantity++;
  } else {
    state.cart.push({ pizzaId, quantity: 1 });
  }
  
  updateCartBadge();
  renderCartItems();
  openCartDrawer();
  showToast(`Added ${pizzas.find(p => p.id === pizzaId).name} to your cart.`, 'success');
}

function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  if (!badge) return;
  
  const totalQty = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  badge.textContent = totalQty;
  badge.style.display = totalQty > 0 ? 'flex' : 'none';
}

function changeCartQty(pizzaId, change) {
  const itemIndex = state.cart.findIndex(item => item.pizzaId === pizzaId);
  if (itemIndex === -1) return;
  
  state.cart[itemIndex].quantity += change;
  
  if (state.cart[itemIndex].quantity <= 0) {
    state.cart.splice(itemIndex, 1);
  }
  
  updateCartBadge();
  renderCartItems();
  
  // If checkout page is active, update summary
  if (state.activeRoute === 'checkout') {
    renderCheckoutSummary();
  }
}

function removeCartItem(pizzaId) {
  state.cart = state.cart.filter(item => item.pizzaId !== pizzaId);
  updateCartBadge();
  renderCartItems();
  
  if (state.activeRoute === 'checkout') {
    renderCheckoutSummary();
  }
}

function calculateCartTotals() {
  let subtotal = 0;
  state.cart.forEach(item => {
    const pizza = pizzas.find(p => p.id === item.pizzaId);
    if (pizza) {
      subtotal += pizza.price * item.quantity;
    }
  });
  
  const tax = subtotal * 0.1; // 10% tax
  const delivery = subtotal > 0 ? 3.99 : 0;
  const total = subtotal + tax + delivery;
  
  return { subtotal, tax, delivery, total };
}

function renderCartItems() {
  const listContainer = document.getElementById('cart-items-list');
  if (!listContainer) return;
  
  listContainer.innerHTML = '';
  
  if (state.cart.length === 0) {
    listContainer.innerHTML = `
      <div class="cart-empty-message">
        <svg viewBox="0 0 24 24"><path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h14v12zm-7-8c-1.66 0-3-1.34-3-3H7c0 2.76 2.24 5 5 5s5-2.24 5-5h-2c0 1.66-1.34 3-3 3z"/></svg>
        <p>Your cart is empty.</p>
        <button class="btn-primary" style="margin-top: 1rem; width: auto; padding: 0.6rem 1.5rem;" onclick="navigateTo('home'); closeCartDrawer();">Start Ordering</button>
      </div>
    `;
    
    // Update summary values to zero
    document.getElementById('cart-subtotal').textContent = '$0.00';
    document.getElementById('cart-tax').textContent = '$0.00';
    document.getElementById('cart-delivery').textContent = '$0.00';
    document.getElementById('cart-total').textContent = '$0.00';
    return;
  }
  
  state.cart.forEach(item => {
    const pizza = pizzas.find(p => p.id === item.pizzaId);
    if (!pizza) return;
    
    const element = document.createElement('div');
    element.className = 'cart-item';
    element.innerHTML = `
      <img src="${pizza.image}" class="cart-item-img" alt="${pizza.name}" />
      <div class="cart-item-detail">
        <div class="cart-item-name">${pizza.name}</div>
        <div class="cart-item-price">$${pizza.price.toFixed(2)}</div>
        <div class="cart-item-actions">
          <button class="qty-btn" onclick="changeCartQty(${pizza.id}, -1)">-</button>
          <span class="cart-item-qty">${item.quantity}</span>
          <button class="qty-btn" onclick="changeCartQty(${pizza.id}, 1)">+</button>
        </div>
      </div>
      <button class="btn-remove-item" onclick="removeCartItem(${pizza.id})" title="Remove item">
        <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
      </button>
    `;
    listContainer.appendChild(element);
  });
  
  // Calculate and display values
  const totals = calculateCartTotals();
  document.getElementById('cart-subtotal').textContent = `$${totals.subtotal.toFixed(2)}`;
  document.getElementById('cart-tax').textContent = `$${totals.tax.toFixed(2)}`;
  document.getElementById('cart-delivery').textContent = `$${totals.delivery.toFixed(2)}`;
  document.getElementById('cart-total').textContent = `$${totals.total.toFixed(2)}`;
}

function openCartDrawer() {
  document.getElementById('cart-drawer').classList.add('active');
}

function closeCartDrawer() {
  document.getElementById('cart-drawer').classList.remove('active');
}

// ----------------------------------------------------
// CHECKOUT FORM HANDLERS
// ----------------------------------------------------

function selectPaymentMethod(method) {
  document.querySelectorAll('.payment-option-card').forEach(card => {
    card.classList.remove('active');
  });
  
  const targetCard = document.querySelector(`.payment-option-card[data-method="${method}"]`);
  if (targetCard) {
    targetCard.classList.add('active');
  }
  
  // Hide all payment section fields
  document.querySelectorAll('.payment-fields-section').forEach(sec => {
    sec.classList.remove('active');
  });
  
  // Show target payment fields
  const targetFields = document.getElementById(`payment-fields-${method}`);
  if (targetFields) {
    targetFields.classList.add('active');
  }
}

function renderCheckoutSummary() {
  const summaryContainer = document.getElementById('checkout-items-summary');
  if (!summaryContainer) return;
  
  summaryContainer.innerHTML = '';
  
  if (state.cart.length === 0) {
    summaryContainer.innerHTML = '<p style="color: var(--color-text-muted);">No items in order.</p>';
    document.getElementById('checkout-subtotal').textContent = '$0.00';
    document.getElementById('checkout-tax').textContent = '$0.00';
    document.getElementById('checkout-delivery').textContent = '$0.00';
    document.getElementById('checkout-total').textContent = '$0.00';
    return;
  }
  
  state.cart.forEach(item => {
    const pizza = pizzas.find(p => p.id === item.pizzaId);
    if (!pizza) return;
    
    const row = document.createElement('div');
    row.className = 'summary-item-row';
    row.innerHTML = `
      <span class="summary-item-qty-name">${item.quantity}x ${pizza.name}</span>
      <span class="summary-item-price">$${(pizza.price * item.quantity).toFixed(2)}</span>
    `;
    summaryContainer.appendChild(row);
  });
  
  const totals = calculateCartTotals();
  document.getElementById('checkout-subtotal').textContent = `$${totals.subtotal.toFixed(2)}`;
  document.getElementById('checkout-tax').textContent = `$${totals.tax.toFixed(2)}`;
  document.getElementById('checkout-delivery').textContent = `$${totals.delivery.toFixed(2)}`;
  document.getElementById('checkout-total').textContent = `$${totals.total.toFixed(2)}`;
}

function handleCheckoutSubmit(e) {
  e.preventDefault();
  
  if (state.cart.length === 0) {
    showToast('Your cart is empty. Add pizzas before checking out.', 'error');
    return;
  }
  
  // Check active payment method
  const activePaymentCard = document.querySelector('.payment-option-card.active');
  const method = activePaymentCard ? activePaymentCard.getAttribute('data-method') : 'cash';
  
  // Verify card fields if credit card is selected
  if (method === 'credit-card') {
    const cardNum = document.getElementById('card-number').value.replace(/\s+/g, '');
    const cardExp = document.getElementById('card-expiry').value;
    const cardCvv = document.getElementById('card-cvv').value;
    
    if (cardNum.length < 16 || cardExp.length < 5 || cardCvv.length < 3) {
      showToast('Please enter valid credit card details.', 'error');
      return;
    }
  }
  
  // Successful order checkout triggers confetti
  showOrderSuccessModal();
  
  // Clear cart
  state.cart = [];
  updateCartBadge();
  renderCartItems();
}

function showOrderSuccessModal() {
  document.getElementById('success-modal').classList.add('active');
  playSuccessConfetti();
}

function playSuccessConfetti() {
  const container = document.getElementById('success-modal');
  
  // Spawn 60 colorful confetti pieces falling inside the modal
  for (let i = 0; i < 60; i++) {
    const confetti = document.createElement('div');
    confetti.style.position = 'absolute';
    confetti.style.width = `${Math.random() * 8 + 6}px`;
    confetti.style.height = `${Math.random() * 12 + 6}px`;
    
    const colors = ['#e04f39', '#f2c94c', '#4e8d55', '#3498db', '#9b59b6'];
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    
    // Starting position in center of modal
    confetti.style.left = `${Math.random() * 80 + 10}%`;
    confetti.style.top = `20px`;
    confetti.style.borderRadius = '2px';
    confetti.style.opacity = '1';
    confetti.style.zIndex = '99';
    
    // Animation parameters
    const driftX = (Math.random() - 0.5) * 200;
    const dropY = Math.random() * 300 + 200;
    const rotate = Math.random() * 720;
    
    confetti.animate([
      { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
      { transform: `translate(${driftX}px, ${dropY}px) rotate(${rotate}deg)`, opacity: 0 }
    ], {
      duration: Math.random() * 1500 + 1500,
      easing: 'cubic-bezier(0.1, 0.8, 0.25, 1)',
      fill: 'forwards'
    });
    
    container.appendChild(confetti);
    
    // Clean up confetti element
    setTimeout(() => confetti.remove(), 3000);
  }
}

// ----------------------------------------------------
// TOMATO INTERACTIVE THROWING MECHANICS
// ----------------------------------------------------

function throwTomato(event) {
  // If event is defined and button triggered, throw tomato
  const splashOverlay = document.getElementById('splash-overlay');
  const throwBtn = document.getElementById('btn-throw-tomato');
  if (!splashOverlay || !throwBtn) return;
  
  // Position of launcher button to start throwing from
  const btnRect = throwBtn.getBoundingClientRect();
  const startX = btnRect.left + btnRect.width / 2;
  const startY = btnRect.top + btnRect.height / 2;
  
  // Target position: either randomly on screen, or cursor location if clicked canvas
  // We throw to a random spot on the screen
  const targetX = Math.random() * (window.innerWidth - 200) + 100;
  const targetY = Math.random() * (window.innerHeight - 200) + 100;
  
  // Create flying tomato element
  const tomatoEl = document.createElement('div');
  tomatoEl.className = 'flying-tomato';
  tomatoEl.style.left = `${startX - 30}px`;
  tomatoEl.style.top = `${startY - 30}px`;
  splashOverlay.appendChild(tomatoEl);
  
  // Animate flight path
  const duration = 800; // ms
  const flightAnimation = tomatoEl.animate([
    {
      left: `${startX - 30}px`,
      top: `${startY - 30}px`,
      transform: 'scale(1) rotate(0deg)'
    },
    {
      left: `${(startX + targetX) / 2}px`,
      top: `${Math.min(startY, targetY) - 150}px`, // Arc peak
      transform: 'scale(1.8) rotate(180deg)'
    },
    {
      left: `${targetX - 30}px`,
      top: `${targetY - 30}px`,
      transform: 'scale(1.2) rotate(360deg)'
    }
  ], {
    duration: duration,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    fill: 'forwards'
  });
  
  flightAnimation.onfinish = () => {
    tomatoEl.remove();
    
    // Play impact sound synthesized using Web Audio API
    playTomatoSplatSound();
    
    // Create red splat graphic
    createSplatStain(targetX, targetY);
  };
}

function createSplatStain(x, y) {
  const splashOverlay = document.getElementById('splash-overlay');
  if (!splashOverlay) return;
  
  const splat = document.createElement('div');
  splat.className = 'tomato-splat';
  splat.style.left = `${x}px`;
  splat.style.top = `${y}px`;
  
  const randScale = Math.random() * 0.6 + 0.7; // size scaling
  const randRot = Math.random() * 360;
  splat.style.setProperty('--rotation', `${randRot}deg`);
  splat.style.transform = `translate(-50%, -50%) scale(${randScale}) rotate(${randRot}deg)`;
  
  // Custom organic path for SVG mask/background details (tomato shape variation)
  const paths = [
    '50% 10%, 80% 20%, 95% 45%, 85% 75%, 50% 95%, 15% 75%, 5% 45%, 20% 20%',
    '45% 5%, 85% 15%, 90% 55%, 75% 85%, 50% 90%, 25% 80%, 10% 50%, 15% 15%',
    '52% 12%, 78% 25%, 92% 50%, 82% 80%, 48% 92%, 18% 78%, 8% 52%, 22% 22%'
  ];
  splat.style.clipPath = `polygon(${paths[Math.floor(Math.random() * paths.length)]})`;
  
  splashOverlay.appendChild(splat);
  
  // Spawn liquid scatter micro-splashes
  const numSubparticles = 12;
  for (let i = 0; i < numSubparticles; i++) {
    const sp = document.createElement('div');
    sp.className = 'splat-subparticle';
    sp.style.left = `${x}px`;
    sp.style.top = `${y}px`;
    
    // Random direction and distance
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * 80 + 40;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;
    
    sp.style.setProperty('--dx', `${dx}px`);
    sp.style.setProperty('--dy', `${dy}px`);
    
    splashOverlay.appendChild(sp);
    
    // Clean up scatter particle
    setTimeout(() => sp.remove(), 550);
  }
}

function clearAllSplats() {
  const splashOverlay = document.getElementById('splash-overlay');
  if (!splashOverlay) return;
  splashOverlay.innerHTML = '';
  showToast('Stains cleaned up! You can throw more tomatoes.', 'info');
}

// ----------------------------------------------------
// AUXILIARY LOGIC & DYNAMIC UI HELPERS
// ----------------------------------------------------

function updateUserAuthUI() {
  const loginLink = document.querySelector('li[data-route="login"]');
  const userBtn = document.getElementById('nav-user-status');
  
  if (state.user) {
    if (loginLink) loginLink.style.display = 'none';
    if (userBtn) {
      userBtn.textContent = `Logout (${state.user.name})`;
      userBtn.onclick = logoutUser;
    }
  } else {
    if (loginLink) loginLink.style.display = 'block';
    if (userBtn) {
      userBtn.textContent = 'Login';
      userBtn.onclick = () => navigateTo('login');
    }
  }
}

function toggleMusicPlayback() {
  if (state.musicPlaying) {
    pauseMusic();
  } else {
    startMusic();
  }
}

function nextMusicTrack() {
  state.currentTrackIndex = (state.currentTrackIndex + 1) % musicTracks.length;
  if (state.musicPlaying) {
    startMusic();
  } else {
    updateMusicUI();
  }
}

function updateMusicUI() {
  const playBtn = document.getElementById('audio-play-icon');
  const pauseBtn = document.getElementById('audio-pause-icon');
  const label = document.getElementById('track-title-label');
  
  if (playBtn && pauseBtn) {
    if (state.musicPlaying) {
      playBtn.style.display = 'none';
      pauseBtn.style.display = 'block';
    } else {
      playBtn.style.display = 'block';
      pauseBtn.style.display = 'none';
    }
  }
  
  if (label) {
    label.textContent = musicTracks[state.currentTrackIndex].name;
  }
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${message}</span>
    <button class="toast-close">&times;</button>
  `;
  container.appendChild(toast);
  
  // Show transition
  setTimeout(() => toast.classList.add('show'), 10);
  
  const autoClose = setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
  
  toast.querySelector('.toast-close').addEventListener('click', () => {
    clearTimeout(autoClose);
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  });
}

// Float floating pizza slice elements in Login background
function generateLoginParticles() {
  const container = document.getElementById('login-particles');
  if (!container) return;
  
  container.innerHTML = '';
  const pizzaEmojis = ['🍕', '🍅', '🧀', '🔥'];
  
  for (let i = 0; i < 15; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.textContent = pizzaEmojis[Math.floor(Math.random() * pizzaEmojis.length)];
    p.style.left = `${Math.random() * 100}%`;
    p.style.animationDelay = `${Math.random() * 15}s`;
    p.style.fontSize = `${Math.random() * 1.5 + 1}rem`;
    container.appendChild(p);
  }
}

// ----------------------------------------------------
// ONLOAD SYSTEM BINDINGS
// ----------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  // Navigation Links Bindings
  document.querySelectorAll('.nav-links li[data-route]').forEach(li => {
    li.addEventListener('click', () => {
      navigateTo(li.getAttribute('data-route'));
    });
  });
  
  document.getElementById('logo-home-link').addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('home');
  });
  
  // Hamburger Menu
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navLinks.classList.toggle('active');
    });
  }
  
  // Category tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeCategory = btn.getAttribute('data-category');
      renderPizzaProducts();
    });
  });
  
  // Search input
  const searchInput = document.getElementById('product-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      renderPizzaProducts();
    });
  }
  
  // Music control widget click actions
  document.getElementById('btn-play-pause-music').addEventListener('click', () => {
    toggleMusicPlayback();
  });
  
  document.getElementById('btn-next-track').addEventListener('click', () => {
    nextMusicTrack();
  });
  
  const volBar = document.getElementById('volume-slider');
  if (volBar) {
    volBar.addEventListener('input', (e) => {
      state.volume = parseFloat(e.target.value);
      updateMusicVolume();
    });
  }
  
  // Login / Register form submits
  const loginForm = document.getElementById('login-form');
  if (loginForm) loginForm.addEventListener('submit', handleLoginSubmit);
  
  const regForm = document.getElementById('register-form');
  if (regForm) regForm.addEventListener('submit', handleRegisterSubmit);
  
  const verificationForm = document.getElementById('verification-form');
  if (verificationForm) verificationForm.addEventListener('submit', handleVerificationSubmit);
  
  // Modal Triggers
  const regBtn = document.getElementById('btn-show-register');
  if (regBtn) {
    regBtn.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('register-modal').classList.add('active');
    });
  }
  
  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    });
  });
  
  // Cart Actions & Drawer Triggers
  document.getElementById('btn-cart-trigger').addEventListener('click', () => {
    openCartDrawer();
  });
  
  document.getElementById('btn-close-cart').addEventListener('click', () => {
    closeCartDrawer();
  });
  
  document.getElementById('btn-checkout-trigger').addEventListener('click', () => {
    closeCartDrawer();
    navigateTo('checkout');
  });
  
  // Checkout Form Triggers
  document.querySelectorAll('.payment-option-card').forEach(card => {
    card.addEventListener('click', () => {
      selectPaymentMethod(card.getAttribute('data-method'));
    });
  });
  
  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) checkoutForm.addEventListener('submit', handleCheckoutSubmit);
  
  // Contact Us Form submit
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('Thank you! Your message has been sent successfully.', 'success');
      contactForm.reset();
    });
  }
  
  // Tomato throwing
  document.getElementById('btn-throw-tomato').addEventListener('click', throwTomato);
  document.getElementById('btn-clear-splats').addEventListener('click', clearAllSplats);
  
  // Close modals on overlay clicks
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
      }
    });
  });
  
  // Check if user is logged in
  updateUserAuthUI();
  
  // Load default product list
  renderPizzaProducts();
  
  // Create login floating particles
  generateLoginParticles();
  
  // Dynamic pricing for special offers
  startSpecialOfferIntervals();
});

// Setup countdown bar ticks dynamically
function startSpecialOfferIntervals() {
  const bars = document.querySelectorAll('.offer-progress');
  let pct = [75, 45, 90];
  setInterval(() => {
    bars.forEach((bar, idx) => {
      pct[idx] -= (Math.random() * 2);
      if (pct[idx] <= 5) pct[idx] = 100; // Reset countdowns
      bar.style.width = `${pct[idx]}%`;
    });
  }, 3000);
}
