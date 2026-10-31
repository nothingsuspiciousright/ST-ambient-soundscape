# ST-ambient-soundscape
Silly Tavern Ambient Soundscape
# 🎧 ST Ambient Soundscape (Процедурный генератор фоновых звуков для SillyTavern)

Лёгкое, 100% автономное звуковое расширение-микшер для **SillyTavern**, которое создаёт живую звуковую атмосферу для ваших ролевых сцен.

Главная особенность расширения — **полное отсутствие внешних MP3-файлов и ссылок**: все 13 звуковых дорожек синтезируются в реальном времени с помощью встроенного аудио-движка браузера (**Web Audio API**). Звук весит 0 мегабайт, никогда не обрывается, не имеет заметных швов зацикливания и работает полностью офлайн!

---

## 🎶 13 живых звуковых дорожек (Ручной микшер)

В левом верхнем углу экрана (рядом с кнопкой погоды 🌤️) располагается компактная сворачиваемая кнопка **🎧**, открывающая микшер из **13 процедурных звуков**, которые можно включать по отдельности или смешивать друг с другом в любых комбинациях:

* 🌧️ **Дождь и далёкий гром (Rain & Distant Thunder)** — мягкий шум ливня за окном с редкими глубокими раскатами грома вдалеке.
* 🔥 **Треск костра / камина (Campfire Crackle)** — тёплый гул пламени, частые звонкие искры и сочные щелчки горящих дров.
* 🌬️ **Ночной ветер / Вьюга (Howling Wind)** — объёмные переливающиеся порывы холодного ветра.
* 💿 **Виниловая пластинка (Spinning Vinyl)** — тёплое аналоговое шипение дорожки в ритме вращения диска (33 об/мин) и уютное потрескивание пылинок под иглой.
* 🌌 **Мистический дарк-эмбиент (Dark Synth Drone)** — глубокий пульсирующий низкочастотный гул для мистических, напряжённых или потусторонних сцен.
* 💓 **Стук сердца (Deep Heartbeat)** — отчётливый, глубокий двойной пульс для драматических, пугающих или романтических моментов.
* 🦗 **Ночной лес и сверчки (Night Crickets)** — реалистичное многоголосое стрекотание сверчков летней ночью.
* 🌊 **Морской прибой (Ocean Waves)** — медленный, убаюкивающий накат и отступление океанских волн по берегу.
* 🕰️ **Старинные часы (Grandfather Clock)** — размеренное тиканье маятниковых часов с мягким деревянным резонансом в тихой комнате.
* 🎐 **Колокольчики Фурин (Japanese Wind Chimes)** — нежные хрустальные перезвоны японских ветряных колокольчиков в пентатонике Хирадзёси.
* 🏙️ **Ночной город и неон (Distant City & Neon Hum)** — приглушённый гул ночного мегаполиса за окном, редкий шум проезжающих машин и тихое гудение неоновой вывески.
* 💧 **Пещера / Подземелье (Cave Water Drops)** — гулкий воздух каменных сводов и звонкие капли воды с эхом.
* 🐱 **Мурлыканье кота (Cat Purr)** — тёплое, вибрирующее кошачье мурчание на вдохе и выдохе для самых уютных домашних сцен.

### 🎛️ Удобное управление:
* 🔊 **Плавный регулятор громкости:** встроенный ползунок общей громкости прямо на панели микшера + мягкое нарастание и затухание звука (Fade-In / Fade-Out) при включении и выключении.
* 📱 **Адаптация под смартфоны:** компактная трёхколоночная сетка на мобильных экранах и отсутствие задержек нажатия.

---

## 🔗 Синхронизация с погодой и 🤖 Smart Auto-Audio

В меню **Extensions -> 🎧 Ambient Soundscape** доступны три переключателя:

1. **Показывать кнопку звука (🎧) в интерфейсе** — позволяет скрыть панель микшера и мгновенно остановить все звуки.
2. **🔗 Синхронизировать звук с кнопками погоды (🌤️):**
   Если у вас установлено расширение **ST Weather Effects**, звуковой микшер автоматически подстроится под визуальные эффекты:
   * Включили **🌧️ Дождь** -> зашумит дождь с громом;
   * Включили **❄️ Снег** -> задует вьюга;
   * Включили **🔥 Искры и пепел** -> затрещит костёр;
   * Включили **📼 VHS-плёнку** -> зашуршит виниловая пластинка;
   * Включили **🪰 Светлячков** -> запоют ночные сверчки;
   * Включили **🌸 Сакуру** или **🍁 Листья Момидзи** -> зазвенят японские колокольчики Фурин!
3. **🤖 Smart Auto-Audio (Авто-звук по тексту чата):**
   Расширение само читает последние сообщения в чате (на **русском и английском языках**) и автоматически включает/выключает подходящее звуковое сопровождение для текущей сцены (дождь, костёр, вьюга, стук сердца, сверчки, шум моря, тиканье часов, колокольчики, шум города, капли в пещере или мурлыканье кота!).

---

## 📥 Установка (Installation)

1. Откройте **SillyTavern** -> вкладку **Extensions** (иконка кубиков сверху) -> **Install extension**.
2. Вставьте ссылку на репозиторий:
   ```text
   https://github.com/nothingsuspiciousright/ST-ambient-soundscape

   ---
---

# 🌐 English Description

**ST Ambient Soundscape** is a lightweight, 100% self-contained procedural audio mixer extension for **SillyTavern** that brings immersive soundscapes to your roleplay sessions.

**Zero External MP3s:** All **13 audio tracks** are synthesized in real-time using the browser's native **Web Audio API**. It takes up 0 MB of audio files, never suffers from broken links or noticeable loop seams, and works completely offline!

---

## 🎶 13 Procedural Audio Tracks (Manual Mixer)

A compact, collapsible **🎧** button in the top-left corner opens an audio mixer featuring **13 combinable tracks** and a master volume slider:

* 🌧️ **Rain & Distant Thunder** — Soft rainfall outside the window with occasional deep, rolling thunderclaps.
* 🔥 **Campfire Crackle** — Warm low flame rumble, frequent bright sparks, and crisp snapping firewood.
* 🌬️ **Howling Wind** — Sweeping, dynamic gusts of cold night wind.
* 💿 **Spinning Vinyl** — Pure analog vinyl groove hiss oscillating at 33.3 RPM with vintage dust crackles (no music, pure turntable ambiance).
* 🌌 **Dark Synth Drone** — A deep, evolving low-frequency atmospheric drone for mysterious, tense, or supernatural scenes.
* 💓 **Deep Heartbeat** — A clear, resonant double pulse (*lub-dub*) for dramatic, tense, or romantic moments.
* 🦗 **Night Crickets** — Realistic multi-layered cricket chirps of a summer night forest.
* 🌊 **Ocean Waves** — Slow, soothing surf rolling onto the shore and receding.
* 🕰️ **Grandfather Clock** — Steady, resonant pendulum clock *tick-tock* in a quiet room.
* 🎐 **Japanese Wind Chimes (Furin)** — Delicate, crystalline bells tuned to the Japanese Hirajoshi pentatonic scale.
* 🏙️ **Distant City & Neon Hum** — Muffled late-night urban traffic, occasional passing cars, and a subtle 120Hz neon sign hum.
* 💧 **Cave Water Drops** — Hollow subterranean air and echoing water droplets.
* 🐱 **Cat Purr** — A warm, rhythmic feline purr (inhale and exhale cycle) for cozy indoor scenes.

---

## 🔗 Weather Sync & 🤖 Smart Auto-Audio

In the **Extensions -> 🎧 Ambient Soundscape** settings panel, you can configure:

1. **Show Sound Button (🎧) in UI:** Quickly hide the mixer and stop all active sounds.
2. **🔗 Sync with Weather Effects (🌤️):**
   If you also use the **ST Weather Effects** extension, toggling visual effects automatically toggles their matching soundscapes:
   * **🌧️ Rain** -> Rain & Thunder audio
   * **❄️ Snow** -> Howling Wind audio
   * **🔥 Embers & Ash** -> Campfire Crackle audio
   * **📼 VHS Overlay** -> Spinning Vinyl audio
   * **🪰 Fireflies** -> Night Crickets audio
   * **🌸 Sakura / 🍁 Momiji Leaves** -> Wind Chimes (Furin) audio
3. **🤖 Smart Auto-Audio (Context-Aware Mode):**
   Automatically scans the latest chat messages in both **English and Russian** and dynamically fades in/out matching ambient sounds based on the current roleplay scene (rain, fireplace, wind, racing heartbeat, crickets, ocean beach, ticking clock, wind chimes, city streets, dungeon/cave, or a purring cat)—automatically fading them out when the scene changes!
```

---
