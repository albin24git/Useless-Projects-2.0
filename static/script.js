// script.js 

document.addEventListener('DOMContentLoaded', () => {
  
    let currentMode = ''; 
    let videoStream = null;
    let imageDataUrl = null;

  
    const appContainer = document.querySelector('.app-container');

  
    const startCamera = async (videoEl) => {
        try {
            if (videoStream) videoStream.getTracks().forEach(track => track.stop());
            videoStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
            videoEl.srcObject = videoStream;
            
            await new Promise(resolve => videoEl.onloadedmetadata = resolve);
        } catch (err) {
            console.error("Camera Error:", err);
            alert("Could not access camera. Please check permissions.");
        }
    };

    const generateName = async () => {
        renderScreen('loading');
        const modeForApi = (currentMode === 'father') ? 'self' : currentMode;
        try {
            const response = await fetch('/generate_name', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: imageDataUrl, mode: modeForApi, context: currentMode }),
            });
            if (!response.ok) throw new Error('Server error');
            const data = await response.json();
            if (data.error) throw new Error(data.error);
            renderScreen('reveal', data);
        } catch (error) {
            console.error('Generation Failed:', error);
            alert('Something went wrong. Please try again.');
            renderScreen('home');
        }
    };
    
   
    const renderScreen = (screenName, data = {}) => {
     
        appContainer.innerHTML = '';

       
        if (screenName !== 'camera' && videoStream) {
            videoStream.getTracks().forEach(track => track.stop());
            videoStream = null;
        }

        let newScreen;
        if (screenName === 'home') {
            newScreen = createHomeScreen();
        } else if (screenName === 'camera') {
            newScreen = createCameraScreen(data.title);
        } else if (screenName === 'loading') {
            newScreen = createLoadingScreen();
        } else if (screenName === 'reveal') {
            newScreen = createRevealScreen(data.name, data.reason);
        }
        
        
        if (newScreen) {
           
            newScreen.classList.add('hidden');
            appContainer.appendChild(newScreen);
            setTimeout(() => newScreen.classList.remove('hidden'), 50);
        }
    };

  
    const createHomeScreen = () => {
        const screen = document.createElement('div');
        screen.className = 'screen';
        screen.innerHTML = `
            <h1 class="title">NameAI</h1>
            <p class="subtitle">Find a name that defines you.</p>
            <div class="choice-cards">
                <div class="card" id="btn-who-am-i">
                    <h2>Who Am I?</h2><p>Discover your soul's name.</p>
                </div>
                <div class="card" id="btn-who-for-me">
                    <h2>Who For Me?</h2><p>Find a name for your ideal partner.</p>
                </div>
            </div>`;
        screen.querySelector('#btn-who-am-i').onclick = () => { currentMode = 'self'; renderScreen('camera', { title: 'Capture Your Essence' }); };
        screen.querySelector('#btn-who-for-me').onclick = () => { currentMode = 'partner'; renderScreen('camera', { title: 'Capture Your Vibe' }); };
        return screen;
    };

    const createCameraScreen = (title) => {
        const screen = document.createElement('div');
        screen.className = 'screen';
        screen.innerHTML = `
            <h1 id="camera-title">${title}</h1>
            <div class="camera-wrapper">
                <div class="camera-box">
                    <video id="video-feed" autoplay playsinline></video>
                    <canvas id="photo-canvas"></canvas>
                    <div id="flash-overlay"></div>
                    <div id="countdown-overlay"></div>
                </div>
            </div>
            <div id="camera-controls" class="button-group-row"></div>`;

        const videoEl = screen.querySelector('#video-feed');
        const canvasEl = screen.querySelector('#photo-canvas');
        const controlsEl = screen.querySelector('#camera-controls');
        const countdownEl = screen.querySelector('#countdown-overlay');
        const flashEl = screen.querySelector('#flash-overlay');

        const showCaptureControl = () => {
            controlsEl.innerHTML = `<button class="btn-capture"><div class="capture-ring"></div></button>`;
            controlsEl.querySelector('.btn-capture').onclick = runCountdownAndCapture;
        };

        const showReviewControls = () => {
            controlsEl.innerHTML = `<button class="btn-control btn-retake">🔄️</button><button class="btn-control btn-use">✔️</button>`;
            controlsEl.querySelector('.btn-retake').onclick = () => {
                canvasEl.classList.remove('visible');
                showCaptureControl();
            };
            controlsEl.querySelector('.btn-use').onclick = generateName;
        };

        const runCountdownAndCapture = async () => {
            controlsEl.innerHTML = '';
            for (let i = 3; i > 0; i--) {
                countdownEl.textContent = i;
                countdownEl.classList.add('show');
                await new Promise(resolve => setTimeout(resolve, 800));
                countdownEl.classList.remove('show');
            }
            const context = canvasEl.getContext('2d');
            canvasEl.width = videoEl.videoWidth;
            canvasEl.height = videoEl.videoHeight;
            context.translate(canvasEl.width, 0);
            context.scale(-1, 1);
            context.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);
            canvasEl.classList.add('visible');
            flashEl.classList.add('flash');
            setTimeout(() => flashEl.classList.remove('flash'), 500);
            imageDataUrl = canvasEl.toDataURL('image/jpeg');
            showReviewControls();
        };

        startCamera(videoEl).then(showCaptureControl);
        return screen;
    };

    const createLoadingScreen = () => {
        const screen = document.createElement('div');
        screen.className = 'screen';
        screen.innerHTML = `<div class="spinner"></div><p>Consulting the cosmos...</p>`;
        return screen;
    };
    
    const createRevealScreen = (name, reason) => {
        const screen = document.createElement('div');
        screen.className = 'screen';
        screen.innerHTML = `
            <div class="result-card">
                <p>The universe suggests the name...</p>
                <h1 class="result-name-text">${name}</h1>
                <p class="result-reason-text">"${reason}"</p>
            </div>
            <div id="reveal-buttons" class="button-group"></div>`;
        
        const buttonsContainer = screen.querySelector('#reveal-buttons');
        if (currentMode === 'self' || currentMode === 'father') {
            buttonsContainer.innerHTML = `<button class="btn">Thanks for my name!</button><button class="btn btn-secondary">I need a name for my father too!</button>`;
            buttonsContainer.querySelector('.btn').onclick = () => renderScreen('home');
            buttonsContainer.querySelector('.btn-secondary').onclick = () => { currentMode = 'father'; renderScreen('camera', { title: "Capture Your Father's Essence" }); };
        } else { 
            buttonsContainer.innerHTML = `<button class="btn">Send Proposal</button><button class="btn btn-secondary">Find Another Partner</button>`;
            buttonsContainer.querySelector('.btn').onclick = () => { alert("Proposal Sent! (Just kidding... or are we? 😉)"); renderScreen('home'); };
            buttonsContainer.querySelector('.btn-secondary').onclick = () => { currentMode = 'partner'; renderScreen('camera', { title: 'Capture Your Vibe' }); };
        }
        return screen;
    };

    // --- Initial State ---
    renderScreen('home');
});