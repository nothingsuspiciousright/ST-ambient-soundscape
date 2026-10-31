jQuery(() => {
    // 1. Встраиваем панель из 13 звуков в интерфейс SillyTavern
    const soundHTML = `
        <div id="st-sound-buttons-container" class="st-sound-buttons-container">
            <button id="btn-sound-toggle-menu" class="toggleSound" title="Свернуть/развернуть звуковой микшер">🎧</button>
            <div id="st-sound-menu-items" class="st-sound-menu-items collapsed">
                <div class="st-sound-divider"></div>
                <button id="btn-snd-rain" class="toggleSound" title="Шум дождя и далёкий гром">🌧️</button>
                <button id="btn-snd-fire" class="toggleSound" title="Треск костра / камина">🔥</button>
                <button id="btn-snd-wind" class="toggleSound" title="Ночной ветер / Вьюга">🌬️</button>
                <button id="btn-snd-vinyl" class="toggleSound" title="Крутящаяся виниловая пластинка">💿</button>
                <button id="btn-snd-drone" class="toggleSound" title="Мистический дарк-эмбиент">🌌</button>
                <button id="btn-snd-heart" class="toggleSound" title="Стук сердца (Пульс)">💓</button>
                <button id="btn-snd-crickets" class="toggleSound" title="Ночной лес (Сверчки)">🦗</button>
                <button id="btn-snd-ocean" class="toggleSound" title="Морской прибой (Волны океана)">🌊</button>
                <button id="btn-snd-clock" class="toggleSound" title="Старинные часы (Тик-так)">🕰️</button>
                <button id="btn-snd-chimes" class="toggleSound" title="Японские колокольчики Фурин">🎐</button>
                <button id="btn-snd-city" class="toggleSound" title="Ночной город за окном и гул неона">🏙️</button>
                <button id="btn-snd-cave" class="toggleSound" title="Пещера / Подземелье (Капли воды)">💧</button>
                <button id="btn-snd-purr" class="toggleSound" title="Уютное мурлыканье кота">🐱</button>
                <div class="st-sound-divider"></div>
                <div class="st-sound-volume-wrapper" title="Громкость фоновых звуков">
                    <input id="st-sound-volume" class="st-sound-volume-slider" type="range" min="0" max="1" step="0.02" value="0.5" />
                </div>
            </div>
        </div>
    `;

    $('body').append(soundHTML);

    // 2. Встраиваем настройки во вкладку Extensions
    const settingsHTML = `
        <div class="sound-extension-settings">
            <div class="inline-drawer">
                <div class="inline-drawer-toggle inline-drawer-header">
                    <b>Ambient Soundscape</b>
                    <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
                </div>
                <div class="inline-drawer-content">
                    <label class="checkbox_label" for="st-sound-enabled-checkbox" style="margin-top: 8px;">
                        <input id="st-sound-enabled-checkbox" type="checkbox" />
                        <span>Показывать кнопку звука (🎧) в интерфейсе</span>
                    </label>
                    <label class="checkbox_label" for="st-sound-sync-weather-checkbox" style="margin-top: 6px;" title="При включении эффектов в погодном расширении автоматически включает подходящий звук!">
                        <input id="st-sound-sync-weather-checkbox" type="checkbox" />
                        <span>🔗 Синхронизировать звук с кнопками погоды (🌤️)</span>
                    </label>
                    <label class="checkbox_label" for="st-sound-auto-checkbox" style="margin-top: 6px; margin-bottom: 6px;" title="Автоматически включает фоновые звуки по ключевым словам в тексте чата">
                        <input id="st-sound-auto-checkbox" type="checkbox" />
                        <span>🤖 Smart Auto-Audio (Авто-звук по тексту чата)</span>
                    </label>
                </div>
            </div>
        </div>
    `;

    $('#extensions_settings').append(settingsHTML);

    // Следим за тем, открыта ли соседняя менюшка погоды
    setInterval(() => {
        const weatherMenu = document.getElementById('st-weather-menu-items');
        if (weatherMenu) {
            const isExpanded = !weatherMenu.classList.contains('collapsed');
            document.body.classList.toggle('st-weather-menu-expanded', isExpanded);
        }
    }, 200);

    // Состояния настроек
    let extensionEnabled = localStorage.getItem('st_sound_enabled') !== 'false';
    let syncWithWeather = localStorage.getItem('st_sound_sync_weather') !== 'false';
    let autoSoundEnabled = localStorage.getItem('st_sound_auto') === 'true';
    let masterVolume = parseFloat(localStorage.getItem('st_sound_volume') ?? '0.5');
    let menuCollapsed = true;

    $('#st-sound-volume').val(masterVolume);
    $('#st-sound-enabled-checkbox').prop('checked', extensionEnabled);
    $('#st-sound-sync-weather-checkbox').prop('checked', syncWithWeather);
    $('#st-sound-auto-checkbox').prop('checked', autoSoundEnabled);

    // ================= ДВИЖОК WEB AUDIO API =================
    let audioCtx = null;
    let masterGain = null;
    let sharedNoiseBuffer = null;

    function initAudioEngine() {
        if (audioCtx) {
            if (audioCtx.state === 'suspended') audioCtx.resume();
            return;
        }
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContextClass();
        masterGain = audioCtx.createGain();
        masterGain.gain.value = masterVolume;
        masterGain.connect(audioCtx.destination);

        const bufferSize = audioCtx.sampleRate * 5;
        sharedNoiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const output = sharedNoiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
            b6 = white * 0.115926;
        }
    }

    const activeChannels = {};
    const autoActivatedSounds = new Set();

    function stopChannel(id) {
        const ch = activeChannels[id];
        if (!ch) return;
        delete activeChannels[id];
        try {
            const now = audioCtx.currentTime;
            ch.gain.gain.cancelScheduledValues(now);
            ch.gain.gain.setValueAtTime(ch.gain.gain.value, now);
            ch.gain.gain.linearRampToValueAtTime(0.0001, now + 0.6);
            if (ch.interval) clearInterval(ch.interval);
            setTimeout(() => {
                try { ch.cleanup(); } catch (e) {}
            }, 650);
        } catch (e) {}
    }

    // 1. 🌧️ ДОЖДЬ И ДАЛЁКИЙ ГРОМ
    function startRainSound() {
        initAudioEngine();
        const chGain = audioCtx.createGain();
        chGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
        chGain.gain.linearRampToValueAtTime(0.65, audioCtx.currentTime + 1.0);
        chGain.connect(masterGain);

        const noise = audioCtx.createBufferSource();
        noise.buffer = sharedNoiseBuffer;
        noise.loop = true;

        const filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1100;
        filter.Q.value = 0.45;

        noise.connect(filter);
        filter.connect(chGain);
        noise.start();

        const interval = setInterval(() => {
            if (!activeChannels.rain || Math.random() > 0.25) return;
            const tNow = audioCtx.currentTime;
            const thunderSrc = audioCtx.createBufferSource();
            thunderSrc.buffer = sharedNoiseBuffer;
            thunderSrc.loop = true;

            const tFilter = audioCtx.createBiquadFilter();
            tFilter.type = 'lowpass';
            tFilter.frequency.setValueAtTime(140, tNow);
            tFilter.frequency.exponentialRampToValueAtTime(45, tNow + 3.5);

            const tGain = audioCtx.createGain();
            tGain.gain.setValueAtTime(0.001, tNow);
            tGain.gain.linearRampToValueAtTime(0.45, tNow + 0.4);
            tGain.gain.exponentialRampToValueAtTime(0.001, tNow + 4.0);

            thunderSrc.connect(tFilter);
            tFilter.connect(tGain);
            tGain.connect(chGain);
            thunderSrc.start(tNow);
            thunderSrc.stop(tNow + 4.2);
        }, 7000);

        activeChannels.rain = {
            gain: chGain,
            interval,
            cleanup: () => { noise.stop(); chGain.disconnect(); }
        };
    }

    // 2. 🔥 ТРЕСКУЧИЙ КОСТЁР / КАМИН
    function startFireSound() {
        initAudioEngine();
        const chGain = audioCtx.createGain();
        chGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
        chGain.gain.linearRampToValueAtTime(0.85, audioCtx.currentTime + 0.8);
        chGain.connect(masterGain);

        const rumble = audioCtx.createBufferSource();
        rumble.buffer = sharedNoiseBuffer;
        rumble.loop = true;

        const rFilter = audioCtx.createBiquadFilter();
        rFilter.type = 'lowpass';
        rFilter.frequency.value = 140;

        const rGain = audioCtx.createGain();
        rGain.gain.value = 0.45;

        rumble.connect(rFilter);
        rFilter.connect(rGain);
        rGain.connect(chGain);
        rumble.start();

        function triggerCrackle(isBigSnap) {
            if (!activeChannels.fire) return;
            const tNow = audioCtx.currentTime + Math.random() * 0.08;
            const pop = audioCtx.createBufferSource();
            pop.buffer = sharedNoiseBuffer;

            const pFilter = audioCtx.createBiquadFilter();
            pFilter.type = 'bandpass';
            pFilter.frequency.value = isBigSnap ? (1200 + Math.random() * 1300) : (2800 + Math.random() * 2700);
            pFilter.Q.value = isBigSnap ? 2.2 : 4.5;

            const pGain = audioCtx.createGain();
            const amp = isBigSnap ? (0.45 + Math.random() * 0.45) : (0.18 + Math.random() * 0.28);
            const dur = isBigSnap ? 0.045 : 0.022;

            pGain.gain.setValueAtTime(0.001, tNow);
            pGain.gain.linearRampToValueAtTime(amp, tNow + 0.003);
            pGain.gain.exponentialRampToValueAtTime(0.001, tNow + dur);

            pop.connect(pFilter);
            pFilter.connect(pGain);
            pGain.connect(chGain);
            pop.start(tNow, Math.random() * 3, dur + 0.01);
        }

        const interval = setInterval(() => {
            if (!activeChannels.fire) return;
            const sparks = Math.floor(Math.random() * 3) + 1;
            for (let i = 0; i < sparks; i++) {
                if (Math.random() < 0.75) triggerCrackle(false);
            }
            if (Math.random() < 0.35) triggerCrackle(true);
        }, 95);

        activeChannels.fire = {
            gain: chGain,
            interval,
            cleanup: () => { rumble.stop(); chGain.disconnect(); }
        };
    }

    // 3. 🌬️ НОЧНОЙ ВЕТЕР / ВЬЮГА
    function startWindSound() {
        initAudioEngine();
        const chGain = audioCtx.createGain();
        chGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
        chGain.gain.linearRampToValueAtTime(0.55, audioCtx.currentTime + 1.2);
        chGain.connect(masterGain);

        const wind = audioCtx.createBufferSource();
        wind.buffer = sharedNoiseBuffer;
        wind.loop = true;

        const wFilter = audioCtx.createBiquadFilter();
        wFilter.type = 'bandpass';
        wFilter.frequency.value = 380;
        wFilter.Q.value = 4.5;

        const lfo = audioCtx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.14;
        const lfoGain = audioCtx.createGain();
        lfoGain.gain.value = 220;

        lfo.connect(lfoGain);
        lfoGain.connect(wFilter.frequency);

        wind.connect(wFilter);
        wFilter.connect(chGain);
        wind.start();
        lfo.start();

        activeChannels.wind = {
            gain: chGain,
            cleanup: () => { wind.stop(); lfo.stop(); chGain.disconnect(); }
        };
    }

    // 4. 💿 КРУТЯЩАЯСЯ ВИНИЛОВАЯ ПЛАСТИНКА
    function startVinylSound() {
        initAudioEngine();
        const chGain = audioCtx.createGain();
        chGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
        chGain.gain.linearRampToValueAtTime(0.75, audioCtx.currentTime + 0.8);
        chGain.connect(masterGain);

        const groove = audioCtx.createBufferSource();
        groove.buffer = sharedNoiseBuffer;
        groove.loop = true;

        const grooveFilter = audioCtx.createBiquadFilter();
        grooveFilter.type = 'bandpass';
        grooveFilter.frequency.value = 1400;
        grooveFilter.Q.value = 0.7;

        const grooveGain = audioCtx.createGain();
        grooveGain.gain.value = 0.16;

        const wowLfo = audioCtx.createOscillator();
        wowLfo.type = 'sine';
        wowLfo.frequency.value = 0.55;
        const wowGain = audioCtx.createGain();
        wowGain.gain.value = 0.05;
        wowLfo.connect(wowGain);
        wowGain.connect(grooveGain.gain);

        groove.connect(grooveFilter);
        grooveFilter.connect(grooveGain);
        grooveGain.connect(chGain);
        groove.start();
        wowLfo.start();

        const interval = setInterval(() => {
            if (!activeChannels.vinyl) return;
            const clicks = Math.random() < 0.35 ? 2 : 1;
            for (let i = 0; i < clicks; i++) {
                if (Math.random() > 0.7) continue;
                const tNow = audioCtx.currentTime + Math.random() * 0.06;
                const dust = audioCtx.createBufferSource();
                dust.buffer = sharedNoiseBuffer;

                const dFilter = audioCtx.createBiquadFilter();
                dFilter.type = 'bandpass';
                dFilter.frequency.value = 2400 + Math.random() * 3200;
                dFilter.Q.value = 3.0;

                const dGain = audioCtx.createGain();
                const vol = 0.12 + Math.random() * 0.22;
                dGain.gain.setValueAtTime(vol, tNow);
                dGain.gain.exponentialRampToValueAtTime(0.001, tNow + 0.014);

                dust.connect(dFilter);
                dFilter.connect(dGain);
                dGain.connect(chGain);
                dust.start(tNow, Math.random() * 3, 0.018);
            }
        }, 90);

        activeChannels.vinyl = {
            gain: chGain,
            interval,
            cleanup: () => { groove.stop(); wowLfo.stop(); chGain.disconnect(); }
        };
    }

    // 5. 🌌 МИСТИЧЕСКИЙ ДАРК-ЭМБИЕНТ
    function startDroneSound() {
        initAudioEngine();
        const chGain = audioCtx.createGain();
        chGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
        chGain.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 2.0);
        chGain.connect(masterGain);

        const dFilter = audioCtx.createBiquadFilter();
        dFilter.type = 'lowpass';
        dFilter.frequency.value = 260;
        dFilter.connect(chGain);

        const lfo = audioCtx.createOscillator();
        lfo.frequency.value = 0.08;
        const lfoGain = audioCtx.createGain();
        lfoGain.gain.value = 110;
        lfo.connect(lfoGain);
        lfoGain.connect(dFilter.frequency);
        lfo.start();

        const freqs = [55, 55.4, 82.41, 110.2];
        const oscs = freqs.map((f, i) => {
            const osc = audioCtx.createOscillator();
            osc.type = i < 2 ? 'sawtooth' : 'triangle';
            osc.frequency.value = f;
            const g = audioCtx.createGain();
            g.gain.value = 0.06;
            osc.connect(g);
            g.connect(dFilter);
            osc.start();
            return osc;
        });

        activeChannels.drone = {
            gain: chGain,
            cleanup: () => { oscs.forEach(o => o.stop()); lfo.stop(); chGain.disconnect(); }
        };
    }

    // 6. 💓 ОТЧЁТЛИВЫЙ СТУК СЕРДЦА (ПУЛЬС)
    function startHeartSound() {
        initAudioEngine();
        const chGain = audioCtx.createGain();
        chGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
        chGain.gain.linearRampToValueAtTime(1.0, audioCtx.currentTime + 0.3);
        chGain.connect(masterGain);

        function beat(delay, startFreq, endFreq, strength) {
            if (!activeChannels.heart) return;
            const t = audioCtx.currentTime + delay;

            const osc = audioCtx.createOscillator();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(startFreq, t);
            osc.frequency.exponentialRampToValueAtTime(endFreq, t + 0.16);

            const filter = audioCtx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(220, t);
            filter.frequency.exponentialRampToValueAtTime(65, t + 0.16);

            const g = audioCtx.createGain();
            g.gain.setValueAtTime(0.001, t);
            g.gain.linearRampToValueAtTime(strength, t + 0.02);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.19);

            osc.connect(filter);
            filter.connect(g);
            g.connect(chGain);
            osc.start(t);
            osc.stop(t + 0.21);
        }

        function triggerHeartbeatCycle() {
            beat(0.02, 130, 48, 0.95);
            beat(0.28, 115, 42, 0.65);
        }

        triggerHeartbeatCycle();
        const interval = setInterval(triggerHeartbeatCycle, 1050);

        activeChannels.heart = {
            gain: chGain,
            interval,
            cleanup: () => { chGain.disconnect(); }
        };
    }

    // 7. 🦗 НОЧНОЙ ЛЕС / СВЕРЧКИ
    function startCricketsSound() {
        initAudioEngine();
        const chGain = audioCtx.createGain();
        chGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
        chGain.gain.linearRampToValueAtTime(0.55, audioCtx.currentTime + 1.0);
        chGain.connect(masterGain);

        function chirp(baseFreq, delay) {
            if (!activeChannels.crickets) return;
            const start = audioCtx.currentTime + delay;
            // Трель сверчка состоит из 4 коротких звонких импульсов
            for (let p = 0; p < 4; p++) {
                const t = start + p * 0.042;
                const osc = audioCtx.createOscillator();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(baseFreq, t);

                const g = audioCtx.createGain();
                g.gain.setValueAtTime(0.001, t);
                g.gain.linearRampToValueAtTime(0.11, t + 0.01);
                g.gain.exponentialRampToValueAtTime(0.001, t + 0.032);

                osc.connect(g);
                g.connect(chGain);
                osc.start(t);
                osc.stop(t + 0.035);
            }
        }

        const interval = setInterval(() => {
            if (!activeChannels.crickets) return;
            // Два-три сверчка на чуть разных частотах (ближе и дальше)
            chirp(4350, 0);
            if (Math.random() < 0.75) chirp(4620, 0.22 + Math.random() * 0.15);
            if (Math.random() < 0.5) chirp(4180, 0.45 + Math.random() * 0.2);
        }, 780);

        activeChannels.crickets = {
            gain: chGain,
            interval,
            cleanup: () => { chGain.disconnect(); }
        };
    }

    // 8. 🌊 МОРСКОЙ ПРИБОЙ / ОКЕАНСКИЕ ВОЛНЫ
    function startOceanSound() {
        initAudioEngine();
        const chGain = audioCtx.createGain();
        chGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
        chGain.gain.linearRampToValueAtTime(0.65, audioCtx.currentTime + 1.5);
        chGain.connect(masterGain);

        const waveNoise = audioCtx.createBufferSource();
        waveNoise.buffer = sharedNoiseBuffer;
        waveNoise.loop = true;

        const wFilter = audioCtx.createBiquadFilter();
        wFilter.type = 'lowpass';
        wFilter.frequency.value = 480;

        const waveGain = audioCtx.createGain();
        waveGain.gain.value = 0.45;

        // Медленный накат и откат морской волны (период ~9 секунд)
        const lfo = audioCtx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.11;

        const lfoFilterGain = audioCtx.createGain();
        lfoFilterGain.gain.value = 360;
        lfo.connect(lfoFilterGain);
        lfoFilterGain.connect(wFilter.frequency);

        const lfoAmpGain = audioCtx.createGain();
        lfoAmpGain.gain.value = 0.30;
        lfo.connect(lfoAmpGain);
        lfoAmpGain.connect(waveGain.gain);

        waveNoise.connect(wFilter);
        wFilter.connect(waveGain);
        waveGain.connect(chGain);
        waveNoise.start();
        lfo.start();

        activeChannels.ocean = {
            gain: chGain,
            cleanup: () => { waveNoise.stop(); lfo.stop(); chGain.disconnect(); }
        };
    }

    // 9. 🕰️ СТАРИННЫЕ МАЯТНИКОВЫЕ ЧАСЫ (ТИК-ТАК)
    function startClockSound() {
        initAudioEngine();
        const chGain = audioCtx.createGain();
        chGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
        chGain.gain.linearRampToValueAtTime(0.8, audioCtx.currentTime + 0.4);
        chGain.connect(masterGain);

        let isTick = true;

        function tickTock() {
            if (!activeChannels.clock) return;
            const t = audioCtx.currentTime;

            // Короткий щелчок анкерного механизма + деревянный резонанс корпуса
            const osc = audioCtx.createOscillator();
            osc.type = 'triangle';
            const freq = isTick ? 920 : 680; // "Тик" чуть выше, "Так" чуть глубже
            osc.frequency.setValueAtTime(freq, t);
            osc.frequency.exponentialRampToValueAtTime(180, t + 0.028);

            const g = audioCtx.createGain();
            g.gain.setValueAtTime(0.001, t);
            g.gain.linearRampToValueAtTime(isTick ? 0.35 : 0.26, t + 0.002);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

            osc.connect(g);
            g.connect(chGain);
            osc.start(t);
            osc.stop(t + 0.04);

            isTick = !isTick;
        }

        tickTock();
        const interval = setInterval(tickTock, 1000);

        activeChannels.clock = {
            gain: chGain,
            interval,
            cleanup: () => { chGain.disconnect(); }
        };
    }

    // 10. 🎐 ЯПОНСКИЕ ВЕТРЯНЫЕ КОЛОКОЛЬЧИКИ ФУРИН
    function startChimesSound() {
        initAudioEngine();
        const chGain = audioCtx.createGain();
        chGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
        chGain.gain.linearRampToValueAtTime(0.65, audioCtx.currentTime + 0.8);
        chGain.connect(masterGain);

        // Японская пентатоника в высоком хрустальном регистре (Хирадзёси)
        const notes = [1046.5, 1174.66, 1244.51, 1567.98, 1661.22, 2093.0, 2349.32];

        function ringNote(delay) {
            if (!activeChannels.chimes) return;
            const t = audioCtx.currentTime + delay;
            const baseFreq = notes[Math.floor(Math.random() * notes.length)];

            // Основной тон + стеклянный обертон колокольчика Фурин
            [1, 2.41].forEach((mult, idx) => {
                const osc = audioCtx.createOscillator();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(baseFreq * mult, t);

                const g = audioCtx.createGain();
                const peak = idx === 0 ? 0.16 : 0.05;
                const decay = idx === 0 ? 2.6 : 0.9;
                g.gain.setValueAtTime(0.001, t);
                g.gain.linearRampToValueAtTime(peak, t + 0.012);
                g.gain.exponentialRampToValueAtTime(0.0008, t + decay);

                osc.connect(g);
                g.connect(chGain);
                osc.start(t);
                osc.stop(t + decay + 0.05);
            });
        }

        ringNote(0.1);
        const interval = setInterval(() => {
            if (!activeChannels.chimes || Math.random() > 0.65) return;
            ringNote(0);
            if (Math.random() < 0.4) ringNote(0.25 + Math.random() * 0.35);
        }, 1800);

        activeChannels.chimes = {
            gain: chGain,
            interval,
            cleanup: () => { chGain.disconnect(); }
        };
    }

    // 11. 🏙️ НОЧНОЙ ГОРОД ЗА ОКНОМ + ГУЛ НЕОНОВОЙ ВЫВЕСКИ
    function startCitySound() {
        initAudioEngine();
        const chGain = audioCtx.createGain();
        chGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
        chGain.gain.linearRampToValueAtTime(0.6, audioCtx.currentTime + 1.5);
        chGain.connect(masterGain);

        // Далёкий приглушённый гул ночных улиц
        const cityNoise = audioCtx.createBufferSource();
        cityNoise.buffer = sharedNoiseBuffer;
        cityNoise.loop = true;

        const cFilter = audioCtx.createBiquadFilter();
        cFilter.type = 'lowpass';
        cFilter.frequency.value = 210;

        cityNoise.connect(cFilter);
        cFilter.connect(chGain);
        cityNoise.start();

        // Тихое гудение неоновой вывески (120 Гц)
        const neonOsc = audioCtx.createOscillator();
        neonOsc.type = 'sawtooth';
        neonOsc.frequency.value = 120;
        const nFilter = audioCtx.createBiquadFilter();
        nFilter.type = 'bandpass';
        nFilter.frequency.value = 240;
        const nGain = audioCtx.createGain();
        nGain.gain.value = 0.022;

        neonOsc.connect(nFilter);
        nFilter.connect(nGain);
        nGain.connect(chGain);
        neonOsc.start();

        // Редкий шум проезжающей вдалеке машины по ночной дороге
        const interval = setInterval(() => {
            if (!activeChannels.city || Math.random() > 0.45) return;
            const t = audioCtx.currentTime;
            const car = audioCtx.createBufferSource();
            car.buffer = sharedNoiseBuffer;
            car.loop = true;

            const carFilter = audioCtx.createBiquadFilter();
            carFilter.type = 'bandpass';
            carFilter.frequency.setValueAtTime(250, t);
            carFilter.frequency.linearRampToValueAtTime(620, t + 2.2);
            carFilter.frequency.linearRampToValueAtTime(220, t + 4.5);

            const carGain = audioCtx.createGain();
            carGain.gain.setValueAtTime(0.001, t);
            carGain.gain.linearRampToValueAtTime(0.22, t + 2.2);
            carGain.gain.linearRampToValueAtTime(0.001, t + 4.6);

            car.connect(carFilter);
            carFilter.connect(carGain);
            carGain.connect(chGain);
            car.start(t);
            car.stop(t + 4.7);
        }, 6500);

        activeChannels.city = {
            gain: chGain,
            interval,
            cleanup: () => { cityNoise.stop(); neonOsc.stop(); chGain.disconnect(); }
        };
    }

    // 12. 💧 ПЕЩЕРА / ПОДЗЕМЕЛЬЕ С КАПАЮЩЕЙ ВОДОЙ
    function startCaveSound() {
        initAudioEngine();
        const chGain = audioCtx.createGain();
        chGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
        chGain.gain.linearRampToValueAtTime(0.7, audioCtx.currentTime + 1.0);
        chGain.connect(masterGain);

        // Гулкий воздух подземелья
        const caveAir = audioCtx.createBufferSource();
        caveAir.buffer = sharedNoiseBuffer;
        caveAir.loop = true;

        const aFilter = audioCtx.createBiquadFilter();
        aFilter.type = 'bandpass';
        aFilter.frequency.value = 135;
        aFilter.Q.value = 3.0;

        const aGain = audioCtx.createGain();
        aGain.gain.value = 0.35;

        caveAir.connect(aFilter);
        aFilter.connect(aGain);
        aGain.connect(chGain);
        caveAir.start();

        // Звонкие капли воды с эффектом эха
        function dropWater(delay, vol, baseFreq) {
            if (!activeChannels.cave) return;
            const t = audioCtx.currentTime + delay;
            const osc = audioCtx.createOscillator();
            osc.type = 'sine';
            // Капля воды резко повышает тон при схлопывании пузырька ("бульк!")
            osc.frequency.setValueAtTime(baseFreq, t);
            osc.frequency.exponentialRampToValueAtTime(baseFreq * 2.3, t + 0.065);

            const g = audioCtx.createGain();
            g.gain.setValueAtTime(0.001, t);
            g.gain.linearRampToValueAtTime(vol, t + 0.008);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.085);

            osc.connect(g);
            g.connect(chGain);
            osc.start(t);
            osc.stop(t + 0.09);
        }

        const interval = setInterval(() => {
            if (!activeChannels.cave || Math.random() > 0.65) return;
            const f = 550 + Math.random() * 550;
            // Основная капля + 2 тихих отражения эха в пещере
            dropWater(0, 0.25, f);
            dropWater(0.18, 0.08, f);
            dropWater(0.36, 0.025, f);
        }, 1400);

        activeChannels.cave = {
            gain: chGain,
            interval,
            cleanup: () => { caveAir.stop(); chGain.disconnect(); }
        };
    }

    // 13. 🐱 УЮТНОЕ МУРЛЫКАНЬЕ КОТА
    function startPurrSound() {
        initAudioEngine();
        const chGain = audioCtx.createGain();
        chGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
        chGain.gain.linearRampToValueAtTime(0.85, audioCtx.currentTime + 1.0);
        chGain.connect(masterGain);

        // Основа кошачьего мурчания — мягкая вибрация 26 Гц с дыхательным циклом (вдох-выдох)
        const purrOsc = audioCtx.createOscillator();
        purrOsc.type = 'sawtooth';
        purrOsc.frequency.value = 26.5;

        const pFilter = audioCtx.createBiquadFilter();
        pFilter.type = 'lowpass';
        pFilter.frequency.value = 145;

        const breathGain = audioCtx.createGain();
        breathGain.gain.value = 0.22;

        // Дыхательная волна котика (вдох и выдох каждые 3.5 секунды)
        const breathLfo = audioCtx.createOscillator();
        breathLfo.type = 'sine';
        breathLfo.frequency.value = 0.28;
        const breathDepth = audioCtx.createGain();
        breathDepth.gain.value = 0.14;

        breathLfo.connect(breathDepth);
        breathDepth.connect(breathGain.gain);

        purrOsc.connect(pFilter);
        pFilter.connect(breathGain);
        breathGain.connect(chGain);

        purrOsc.start();
        breathLfo.start();

        activeChannels.purr = {
            gain: chGain,
            cleanup: () => { purrOsc.stop(); breathLfo.stop(); chGain.disconnect(); }
        };
    }

    // Регистрация всех 13 кнопок
    function setupSoundButton(btnSelector, id, startFn) {
        $(btnSelector).on('click', function(e, isAuto) {
            if (!isAuto) autoActivatedSounds.delete(id);
            const isActive = !!activeChannels[id];
            if (isActive) {
                stopChannel(id);
                $(this).removeClass('active-sound');
            } else {
                startFn();
                $(this).addClass('active-sound');
            }
        });
    }

    setupSoundButton('#btn-snd-rain', 'rain', startRainSound);
    setupSoundButton('#btn-snd-fire', 'fire', startFireSound);
    setupSoundButton('#btn-snd-wind', 'wind', startWindSound);
    setupSoundButton('#btn-snd-vinyl', 'vinyl', startVinylSound);
    setupSoundButton('#btn-snd-drone', 'drone', startDroneSound);
    setupSoundButton('#btn-snd-heart', 'heart', startHeartSound);
    setupSoundButton('#btn-snd-crickets', 'crickets', startCricketsSound);
    setupSoundButton('#btn-snd-ocean', 'ocean', startOceanSound);
    setupSoundButton('#btn-snd-clock', 'clock', startClockSound);
    setupSoundButton('#btn-snd-chimes', 'chimes', startChimesSound);
    setupSoundButton('#btn-snd-city', 'city', startCitySound);
    setupSoundButton('#btn-snd-cave', 'cave', startCaveSound);
    setupSoundButton('#btn-snd-purr', 'purr', startPurrSound);

    function stopAllSounds() {
        Object.keys(activeChannels).forEach(id => {
            $(`#btn-snd-${id}`).trigger('click');
        });
        autoActivatedSounds.clear();
    }

    // Ползунок громкости
    $('#st-sound-volume').on('input', function() {
        masterVolume = parseFloat($(this).val());
        localStorage.setItem('st_sound_volume', masterVolume);
        if (masterGain && audioCtx) {
            masterGain.gain.setTargetAtTime(masterVolume, audioCtx.currentTime, 0.05);
        }
    });

    // Сворачивание/разворачивание меню звука
    $('#btn-sound-toggle-menu').on('click', function() {
        menuCollapsed = !menuCollapsed;
        $('#st-sound-menu-items').toggleClass('collapsed', menuCollapsed);
        $(this).toggleClass('menu-open', !menuCollapsed);
    });

    function updateExtensionVisibility() {
        if (extensionEnabled) {
            $('#st-sound-buttons-container').show();
        } else {
            stopAllSounds();
            $('#st-sound-buttons-container').hide();
        }
    }
    updateExtensionVisibility();

    $('#st-sound-enabled-checkbox').on('change', function() {
        extensionEnabled = $(this).is(':checked');
        localStorage.setItem('st_sound_enabled', extensionEnabled);
        updateExtensionVisibility();
    });

    $('#st-sound-sync-weather-checkbox').on('change', function() {
        syncWithWeather = $(this).is(':checked');
        localStorage.setItem('st_sound_sync_weather', syncWithWeather);
    });

    // ================= 🔗 СИНХРОНИЗАЦИЯ СО ВСЕМИ КНОПКАМИ ПОГОДЫ (🌤️) =================
    const weatherToSoundMap = {
        'btn-rain': 'rain',
        'btn-snow': 'wind',
        'btn-embers': 'fire',
        'btn-vhs': 'vinyl',
        'btn-fireflies': 'crickets',
        'btn-petals': 'chimes',
        'btn-leaves': 'chimes'
    };

    $(document).on('click', '#btn-rain, #btn-snow, #btn-embers, #btn-vhs, #btn-fireflies, #btn-petals, #btn-leaves', function() {
        if (!extensionEnabled || !syncWithWeather) return;
        const weatherBtnId = this.id;
        const soundId = weatherToSoundMap[weatherBtnId];
        if (!soundId) return;

        setTimeout(() => {
            const isWeatherNowActive = $(this).hasClass('active-weather');
            const isSoundNowActive = !!activeChannels[soundId];
            if (isWeatherNowActive && !isSoundNowActive) {
                $(`#btn-snd-${soundId}`).trigger('click', [true]);
            } else if (!isWeatherNowActive && isSoundNowActive) {
                $(`#btn-snd-${soundId}`).trigger('click', [true]);
            }
        }, 30);
    });

    // ================= 🤖 SMART AUTO-AUDIO (ПО ТЕКСТУ ЧАТА ДЛЯ ВСЕХ 13 ЗВУКОВ) =================
    function makeAudioRegex(words) {
        return new RegExp(`(?:^|[^a-zA-Zа-яА-ЯёЁ0-9])(${words})(?=$|[^a-zA-Zа-яА-ЯёЁ0-9])`, 'i');
    }

    const soundTriggers = [
        { id: 'rain', regex: makeAudioRegex('rain|raining|downpour|drizzle|pouring|thunder|thunderstorm|дождь|дождя|ливень|гроза|гром') },
        { id: 'fire', regex: makeAudioRegex('campfire|bonfire|fireplace|crackling fire|flames|embers|костер|костёр|костра|камин|камина|треск огня|пламя') },
        { id: 'wind', regex: makeAudioRegex('howling wind|blizzard|snowstorm|cold wind|gale|завывание ветра|вьюга|метель|холодный ветер') },
        { id: 'heart', regex: makeAudioRegex('heart pounding|heart racing|heartbeat|pulse racing|сердце колотится|стук сердца|сердцебиение|пульс') },
        { id: 'crickets', regex: makeAudioRegex('crickets|cicadas|night forest|fireflies|сверчк[а-я]+|цикад[а-я]+|ночной лес') },
        { id: 'ocean', regex: makeAudioRegex('ocean waves|sea waves|beach|seashore|surf|прибой|волны океана|шум моря|морской берег|пляж') },
        { id: 'clock', regex: makeAudioRegex('clock ticking|ticking clock|pendulum|tick-tock|тиканье часов|часы тикают|маятник') },
        { id: 'chimes', regex: makeAudioRegex('wind chimes|furin|bell chimes|колокольчик[а-я]+|фурин|перезвон') },
        { id: 'city', regex: makeAudioRegex('city traffic|distant traffic|neon sign|city streets|шум города|гул машин|неоновая вывеска') },
        { id: 'cave', regex: makeAudioRegex('dripping water|cave|dungeon|sewer|капли воды|капает вода|пещер[а-я]+|подземель[а-я]+') },
        { id: 'purr', regex: makeAudioRegex('purring|cat purrs|purrs softly|мурлычет|мурлыканье|мурчит') }
    ];

    let lastAudioSignature = '';

    function checkChatForAudio(force = false) {
        if (!extensionEnabled || !autoSoundEnabled) return;

        const validMessages = $('#chat .mes').filter(function() {
            const txt = $(this).find('.mes_text').text();
            return txt && !txt.includes('Proxy error') && !txt.includes('HTTP 402');
        });

        const recent = validMessages.slice(-2);
        if (!recent.length) return;

        const combinedText = recent.map((_, el) => $(el).find('.mes_text').text().trim()).get().join(' \n ');
        if (!combinedText || (!force && combinedText === lastAudioSignature)) return;
        lastAudioSignature = combinedText;

        const matched = new Set();
        for (const item of soundTriggers) {
            if (item.regex.test(combinedText)) matched.add(item.id);
        }

        for (const item of soundTriggers) {
            if (autoActivatedSounds.has(item.id) && !matched.has(item.id)) {
                if (activeChannels[item.id]) $(`#btn-snd-${item.id}`).trigger('click', [true]);
                autoActivatedSounds.delete(item.id);
            }
        }

        for (const item of soundTriggers) {
            if (matched.has(item.id)) {
                if (!activeChannels[item.id]) $(`#btn-snd-${item.id}`).trigger('click', [true]);
                autoActivatedSounds.add(item.id);
            }
        }
    }

    $('#st-sound-auto-checkbox').on('change', function() {
        autoSoundEnabled = $(this).is(':checked');
        localStorage.setItem('st_sound_auto', autoSoundEnabled);
        if (autoSoundEnabled) {
            checkChatForAudio(true);
        } else {
            for (const item of soundTriggers) {
                if (autoActivatedSounds.has(item.id) && activeChannels[item.id]) {
                    $(`#btn-snd-${item.id}`).trigger('click', [true]);
                }
            }
            autoActivatedSounds.clear();
            lastAudioSignature = '';
        }
    });

    let chatAudioTimeout = null;
    const chatAudioObserver = new MutationObserver(() => {
        if (!extensionEnabled || !autoSoundEnabled) return;
        clearTimeout(chatAudioTimeout);
        chatAudioTimeout = setTimeout(() => checkChatForAudio(false), 1200);
    });

    const waitChatAudio = setInterval(() => {
        const chatEl = document.getElementById('chat');
        if (chatEl) {
            clearInterval(waitChatAudio);
            chatAudioObserver.observe(chatEl, { childList: true, subtree: true, characterData: true });
        }
    }, 1000);
});