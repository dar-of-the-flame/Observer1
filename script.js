// ===== КОНФИГУРАЦИЯ ИГРЫ =====
const CONFIG = {
    width: 720,
    height: 1280,
    
    states: {
        MENU: 'menu',
        ACHIEVEMENTS: 'achievements',
        PLAYING: 'playing',
        END: 'end'
    },
    
    achievements: {
        'like_everyone': {
            id: 'like_everyone',
            title: 'Такой же... как все',
            description: 'Выбрать безопасный путь в прологе',
            unlocked: false,
            icon: 'fa-user'
        },
        'observer_path': {
            id: 'observer_path',
            title: 'Наблюдатель',
            description: 'Пройти пролог, выбрав путь исследования',
            unlocked: false,
            icon: 'fa-eye'
        }
    },
    
    images: {
        img1: 'images/img1.jpg',
        img2: 'images/img2.jpg',
        img3: 'images/img3.jpg',
        img4: 'images/img4.jpg',
        img5: 'images/img5.jpg',
        img6: 'images/img6.jpg',
        black: '#000'
    },
    
    music: {
        volume: 0.5,
        enabled: true
    }
};

// ===== СОСТОЯНИЕ ИГРЫ =====
let gameState = {
    currentState: CONFIG.states.MENU,
    currentScene: 0,
    currentSequence: null,
    isTyping: false,
    typingInterval: null,
    soundEnabled: true,
    achievements: JSON.parse(localStorage.getItem('observer_achievements')) || {}
};

// ===== DOM ЭЛЕМЕНТЫ =====
const elements = {
    mainMenu: document.getElementById('main-menu'),
    achievementsScreen: document.getElementById('achievements-screen'),
    gameScreen: document.getElementById('game-screen'),
    
    startBtn: document.getElementById('start-btn'),
    achievementsBtn: document.getElementById('achievements-btn'),
    soundBtn: document.getElementById('sound-btn'),
    backBtn: document.getElementById('back-btn'),
    
    bg: document.getElementById('background'),
    bgOverlay: document.getElementById('background-overlay'),
    mainText: document.getElementById('main-text'),
    choicesContainer: document.getElementById('choices-container'),
    gameHint: document.getElementById('game-hint'),
    soundToggle: document.getElementById('sound-toggle'),
    
    menuMusic: document.getElementById('menu-music'),
    gameMusic: document.getElementById('game-music')
};

// ===== ПОЛНОСТЬЮ ПЕРЕРАБОТАННАЯ ПОСЛЕДОВАТЕЛЬНОСТЬ СЦЕН =====
const PROLOGUE_SCENES = [
    // После нажатия "Начать игру" - задержка и название
    { type: 'delay', time: 1000 },
    { type: 'title', text: 'НАБЛЮДАТЕЛЬ', cinematic: true, delay: 2000 },
    { type: 'waitForClick' },
    
    // Пролог и Акт 0
    { type: 'title', text: 'ПРОЛОГ: ПОРВАННАЯ НИТЬ', cinematic: true },
    { type: 'waitForClick' },
    
    { type: 'title', text: 'Акт 0: Немая точка', cinematic: true, duration: 2000 },
    { type: 'clearTitles' },
    
    // Акт 0 - текст системы (зелёный матричный)
    { type: 'text', 
      lines: [
        '>>СИСТЕМА: ИНИЦИАЦИЯ ПРОТОКОЛА ЗАГРУЗКИ...',
        '...',
        '>>ПОДКЛЮЧЕНИЕ К АРХИВУ "СУДЬБА".',
        '...',
        '>>ОШИБКА: НАЙДЕНА НЕСОВМЕСТИМОСТЬ.',
        '...',
        '>>АНАЛИЗ...',
        '...',
        '>> АНАЛИЗ ЗАВЕРШЕН.',
        '...',
        '>>ПРИЧИНА НАЙДЕНА: ОБНАРУЖЕН РАЗРЫВ НИТИ КАТЕГОРИИ "АЛЬФА-ОМЕГА".',
        '...',
        '>>ЦЕЛОСТНОСТЬ ПОЛОТНА НАРУШЕНА.',
        '...',
        '>>АКТИВАЦИЯ ОБХОДНОГО ПРОТОКОЛА...',
        '...',
        '>>КОДОВОЕ ИМЯ:',
        '>>"НАБЛЮДАТЕЛЬ".',
        '...'
      ],
      style: 'matrix',
      typingSpeed: 50,
      lineDelay: 800
    },
    { type: 'waitForClick' },
    
    // Переход после зелёного текста
    { type: 'clear' },
    { type: 'text', text: 'ДОБРО ПОЖАЛОВАТЬ В СИМУЛЯЦИЮ...', delay: 500 },
    { type: 'waitForClick' },
    
    // ===== АКТ 1 =====
    // ИЗМЕНЕНО: сначала очищаем текст, потом меняем фон
    { type: 'clear' },
    { type: 'bg', image: 'img1', transition: 2500 },
    { type: 'delay', time: 2500 },
    
    { type: 'title', text: 'Акт 1: Закон равновесия', cinematic: true, duration: 4000 },
    { type: 'delay', time: 1000 },
    
    // Блоки текста Акта 1
    { type: 'clear' },
    { type: 'textBlock', 
      text: 'Тишина. Не та, что перед звуком, а та, что после него. Когда эхо уже умерло, а новое начало ещё не осмелилось родиться. Вы в этой тишине. Вы — её часть.' 
    },
    { type: 'waitForClick' },
    
    { type: 'textBlock', 
      text: 'Когда рождается звезда...<br><br>где-то умирает галактика.<br><br>Это не поэзия.<br><br>Это — закон самого мироздания.<br><br>Вечный баланс.',
      style: 'poem'
    },
    { type: 'waitForClick' },
    
    { type: 'textBlock', 
      text: 'Каждый акт созидания где-то и для кого-то является актом разрушения. Каждая обретённая жизнь оплачивается чьей-то смертью, каждая вспыхнувшая надежда — чьим-то угасшим светом.' 
    },
    { type: 'waitForClick' },
    
    { type: 'textBlock', 
      text: '"Созидание" — всего лишь красивое, призрачное имя для вечного перераспределения долга. Одни миры берут в долг у других, одни судьбы отдают своё будущее, чтобы чьё-то настоящее могло произойти.' 
    },
    { type: 'waitForClick' },
    
    { type: 'textBlock', 
      text: 'Именно этот холодный, неумолимый закон лежит в основе всех часов, всех календарей, всех линий судьбы... Нить ткётся, натягивается и наконец... измеряет оставшийся срок.' 
    },
    { type: 'waitForClick' },
    
    // Пауза внизу
    { type: 'pauseText', text: 'Пауза. Ощущение, будто только что вам прочитали приговор. Или даровали помилование. Пока непонятно.' },
    { type: 'waitForClick' },
    
    // ===== АКТ 2 =====
    { type: 'clearAll' },
    { type: 'bg', image: 'img2', transition: 2000 },
    { type: 'delay', time: 2000 },
    
    { type: 'title', text: 'Акт 2: Несовершенный инструмент', cinematic: true, duration: 4000 },
    { type: 'delay', time: 1000 },
    
    // Акт 2 - автопоявление блоков
    { type: 'clear' },
    { type: 'textAuto', 
      lines: [
        'Но даже Часовщики неидеальны и всемогущи.',
        'Они лишь... Инструмент',
        'сотканный из сотен нитей...',
        'Те же в свою очередь — проводники долга...',
        'А что происходит, когда проводник... ломается?',
        'Нить не просто рвётся. Она взрывается тишиной...'
      ],
      interval: 1000
    },
    { type: 'waitForClick' },
    
    // ===== АКТ 3 =====
// ИСПРАВЛЕНО: Сначала текст "рождается Пустота", ПОТОМ изображение 3
{ type: 'clearAll' },
{ type: 'textBlock', text: 'И на этом месте...<br>...рождается Пустота.' },
{ type: 'waitForClick' },

// ТЕПЕРЬ меняем фон на img3
{ type: 'bg', image: 'img3', transition: 2500 },
{ type: 'delay', time: 1500 },

// Заменяем диалоги на обычное построчное появление текста
{ type: 'clear' },
{ type: 'textAuto', 
  lines: [
    'В ней — нету законов.',
    'Нету богов.',
    'Нету предназначений.'
  ],
  interval: 1200
},
{ type: 'waitForClick' },
    
    // Текст без тряски
    { type: 'clear' },
    { type: 'textBlock', text: 'Есть только один...<br><br>Неподвластный самому мирозданию...' },
    { type: 'waitForClick' },
    
    // Эффект приближения
    { type: 'effect', name: 'zoom' },
    { type: 'delay', time: 800 },
    
    // Тряска ТОЛЬКО перед СМОТРИТЕЛЬ
    { type: 'effect', name: 'shake' },
    { type: 'delay', time: 300 },
    { type: 'title', text: 'СМОТРИТЕЛЬ', style: 'blood', duration: 2000 },
    { type: 'delay', time: 1000 },
    
    // Смена фона на img4 после СМОТРИТЕЛЬ
    { type: 'bg', image: 'img4', transition: 2000 },
    { type: 'delay', time: 1500 },
    { type: 'title', text: 'Акт 3: На пороге', cinematic: true, duration: 4000 },
    { type: 'delay', time: 1000 },
    
    { type: 'clear' },
    { type: 'textBlock', text: 'Ты — на границе.<br><br>Разрыв...<br><br>Точка схода...<br><br>Или просто...' },
    { type: 'waitForClick' },
    
    // КРАСНЫЙ ТЕКСТ "ПУСТОТА!" по центру с эффектами
    { type: 'clear' },
    { type: 'effect', name: 'shake' },
    { type: 'voidText', text: 'ПУСТОТА!', duration: 2500 },
    { type: 'delay', time: 500 },
    
    // Смена фона после слова ПУСТОТА
    { type: 'bg', image: 'img5', transition: 2000 },
    { type: 'delay', time: 1500 },
    
    { type: 'text', text: 'Силуэт будто бы не желая видеть посторонних бросил взгляд в вашу сторону.', delay: 1000 },
    { type: 'waitForClick' },
    
    // Системные сообщения с эффектом печати
    { type: 'clear' },
    { type: 'text', 
    lines: [
        '>> ПРОТОКОЛ "НАБЛЮДАТЕЛЬ" ПЕРЕГРУЖЕН.',
        '>> ОБНАРУЖЕН ВНЕШНИЙ ОБЪЕКТ В ЗОНЕ НУЛЕВОЙ РЕАЛЬНОСТИ.',
        '>> НЕОБХОДИМО ДЕЙСТВИЕ.'
    ],
    style: 'matrix',
    typingSpeed: 50,
    lineDelay: 800
    },
{ type: 'waitForClick' },
    
    // ===== ВЫБОР =====
    { type: 'choices', 
      options: [
        { 
          text: 'ПОДОЙТИ БЛИЖЕ — Любопытство? Желание понять? Или голос долга, приказывающий исследовать аномалию?',
          action: 'choice1'
        },
        { 
          text: 'ОТСТУПИТЬ — Инстинкт самосохранения. Страх перед абсолютной неизвестностью... Мудрость того, кто знает, что некоторые двери открывать не стоит.',
          action: 'choice2'
        }
      ]
    }
];

// Последовательности для выборов (не изменились, но добавим для img1 в choice1)
const CHOICE_SEQUENCES = {
    choice1: [
    { type: 'clear' },
    { type: 'text', 
      lines: [
        'Шаг. Ещё шаг. Расстояние до Силуэта не уменьшается, но мир вокруг начинает меняться.',
        'Края разрыва начинают "плыть", как марево.',
        'Воздух (если это можно назвать воздухом) густеет.',
        'С каждым шагом нарастает давление — не физическое, а экзистенциальное.',
        'Ощущение, что вот-вот исчезнет последняя опора под ногами,',
        'и ты упадёшь не вниз, а вовне.'
      ],
      style: '',
      typingSpeed: 40,
      lineDelay: 600
    },
    { type: 'effect', name: 'blink' },
    { type: 'waitForClick' },
    
    { type: 'textBlock', 
      text: 'но ты делаешь шаг... ещё... ещё и вот...' 
    },
    { type: 'waitForClick' },
        
        { type: 'bg', image: 'img6', transition: 2000 },
        { type: 'delay', time: 1500 },
        
        { type: 'textBlock', 
          text: 'Вы врезаетесь во что-то( камера немного отдаляется)',
          style: 'poem'
        },
        { type: 'waitForClick' },
        
        { type: 'textBlock', 
          text: 'Вы смогли разглядеть в зеркале себя... но в нём — не сегодняшний лик, а тот, что вы носили до. До разрыва. До Протокола. Вы видите человека, которым были... И в его глазах — немой вопрос.' 
        },
        { type: 'waitForClick' },
        
        { type: 'text', 
          text: '— Значит... ты выбрал такой путь? — голос раздаётся не из зеркала, а со всех сторон сразу. Глухой, как удар грома под землёй.' 
        },
        { type: 'waitForClick' },
        
        { type: 'choices', 
          options: [
            { text: 'Да', action: 'choice1_yes' },
            { text: 'Нет', action: 'choice1_no' }
          ]
        }
    ],
    
    choice1_no: [
        { type: 'text', text: 'Процесс откатывается...' },
        { type: 'delay', time: 1000 },
        { type: 'bgReverse', images: ['img6', 'img5', 'img4', 'img3', 'img2', 'img1'], interval: 800, dim: true },
        { type: 'delay', time: 1500 },
        { type: 'achievement', id: 'like_everyone', text: 'ДОСТИЖЕНИЕ: «Такой же... как все»' },
        { type: 'end', title: 'ПРОЛОГ ЗАВЕРШЁН', message: 'Вы выбрали безопасный путь... пока что.' }
    ],
    
    choice1_yes: [
        { type: 'text', text: '— Уверен, что не пожалеешь?' },
        { type: 'waitForClick' },
        { type: 'choices', 
          options: [
            { text: 'ДА.', action: 'choice1_final_yes' }
          ]
        }
    ],
    
    choice1_final_yes: [
        { type: 'text', 
          text: '— Что ж... Раз твой выбор такой... Удачи, Наблюдатель...<br><br>Зеркальная поверхность впереди колышется и начинает затягивать тебя, как водоворот. Последнее, что ты видишь, — это своё отражение, растворяющееся в серебристой ряби.' 
        },
        { type: 'effect', name: 'zoom', duration: 3500 },
        { type: 'delay', time: 2500 },
        { type: 'bg', image: 'black', transition: 2500 },
        { type: 'delay', time: 1500 },
        { type: 'transitionToAct4' }
    ],
    
    choice2: [
        { type: 'text', 
          text: 'Инстинкт срабатывает раньше мысли. Ты отшатываешься. Силуэт в Пустоте не пытается преследовать. Он просто продолжает смотреть. Но его "взгляд" теперь кажется... почти презрительным. Или печальным...' 
        },
        { type: 'waitForClick' },
        
        { type: 'text', 
          text: 'Ты отступаешь дальше, и границы разрыва начинают стремительно сжиматься. (Картинка мира, как плохо настроенный канал, мелькает и зашумляется)' 
        },
        { type: 'effect', name: 'shake', duration: 2000 },
        { type: 'bgReverse', images: ['img5', 'img4', 'img3', 'img2', 'img1'], interval: 600, dim: true },
        { type: 'delay', time: 1500 },
        
        { type: 'text', 
          text: 'И наконец — резкий, жёсткий толчок. Будто тебя выплюнули.' 
        },
        { type: 'waitForClick' },
        
        { type: 'bg', image: 'black', transition: 2000 },
        { type: 'delay', time: 1000 },
        
        { type: 'text', 
          lines: [
            'Ты не в Пустоте. Ты в знакомой, стерильной, безопасной нейтральной зоне.',
            'Всё по правилам. Всё по Протоколу.',
            '>> ПРОТОКОЛ "НАБЛЮДЕНИЕ" ПРЕРВАН ПО ИНИЦИАТИВЕ ОПЕРАТОРА.',
            '>> ВОЗВРАТ К БАЗОВОГО ИНТЕРФЕЙСА.',
            '>> ДОСТИЖЕНИЕ РАЗБЛОКИРОВАНО: «ТАКОЙ ЖЕ, Как все...»'
          ],
          style: 'matrix',
          typingSpeed: 60,
          lineDelay: 1500
        },
        { type: 'achievement', id: 'like_everyone', text: 'ДОСТИЖЕНИЕ: «Такой же... как все»' },
        { type: 'end', title: 'ПРОЛОГ ЗАВЕРШЁН', message: 'Инстинкт самосохранения победил.' }
    ],
    
    act4: [
        { type: 'clearAll' },
        { type: 'text', 
          lines: [
            '>> ПЕРЕАДРЕСАЦИЯ...',
            '>> СБРОС ЭМОЦИОНАЛЬНЫХ ПАРАМЕТРОВ...',
            '>> ЗАГРУЗКА ПЕРВИЧНОГО КОНТЕКСТА...',
            '>> МЕСТОПОЛОЖЕНИЕ: ПОЛЕ ВЕЛИКОГО МОЛЧАНИЯ.',
            '>> ВРЕМЯ: До... РАЗРЫВА...'
          ],
          style: 'matrix',
          typingSpeed: 50,
          lineDelay: 1000
        },
        { type: 'waitForClick' },
        
        { type: 'text', 
          text: 'Чёрный экран будто бы постепенно светлеет, но не до цвета, а до оттенка бесконечного пепла. Тишина остаётся, но теперь в ней слышен далёкий, едва уловимый гул — звук остывающей реальности. Вы одни. Вы... Наблюдатель. И где-то в этой бескрайней серой пустоте вас ждет первая нить, которую предстоит увидеть... и, возможно, не только увидеть...',
          style: 'italic'
        },
        { type: 'waitForClick' },
        
        { type: 'achievement', id: 'observer_path', text: 'ДОСТИЖЕНИЕ: «Наблюдатель»' },
        { type: 'end', title: 'ПРОЛОГ ЗАВЕРШЁН', message: 'История только начинается...' }
    ]
};

// ===== ИНИЦИАЛИЗАЦИЯ =====
function init() {
    elements.menuMusic.volume = CONFIG.music.volume;
    elements.gameMusic.volume = CONFIG.music.volume;
    
    loadAchievements();
    setupEventListeners();
    
    if (gameState.soundEnabled) {
        elements.menuMusic.play().catch(e => console.log("Автовоспроизведение заблокировано"));
    }
    
    switchScreen(CONFIG.states.MENU);
    window.addEventListener('beforeunload', saveAchievements);
}

// ===== УПРАВЛЕНИЕ ЭКРАНАМИ =====
function switchScreen(screen) {
    elements.mainMenu.classList.remove('active');
    elements.achievementsScreen.classList.remove('active');
    elements.gameScreen.classList.remove('active');
    
    switch(screen) {
        case CONFIG.states.MENU:
            elements.mainMenu.classList.add('active');
            if (gameState.soundEnabled) {
                elements.gameMusic.pause();
                elements.gameMusic.currentTime = 0;
                elements.menuMusic.play();
            }
            break;
            
        case CONFIG.states.ACHIEVEMENTS:
            elements.achievementsScreen.classList.add('active');
            updateAchievementsDisplay();
            break;
            
        case CONFIG.states.PLAYING:
            elements.gameScreen.classList.add('active');
            if (gameState.soundEnabled) {
                elements.menuMusic.pause();
                elements.gameMusic.play();
            }
            break;
    }
    
    gameState.currentState = screen;
}

// ===== ОБРАБОТЧИКИ СОБЫТИЙ =====
function setupEventListeners() {
    elements.startBtn.addEventListener('click', startGame);
    elements.achievementsBtn.addEventListener('click', () => switchScreen(CONFIG.states.ACHIEVEMENTS));
    elements.soundBtn.addEventListener('click', toggleSound);
    elements.backBtn.addEventListener('click', () => switchScreen(CONFIG.states.MENU));
    
    elements.soundToggle.addEventListener('click', toggleSound);
    
    document.addEventListener('click', handleGameClick);
    document.addEventListener('keydown', handleGameKey);
    document.addEventListener('contextmenu', e => e.preventDefault());
}

function startGame() {
    gameState.currentScene = 0;
    gameState.currentSequence = PROLOGUE_SCENES;
    gameState.isTyping = false;
    
    switchScreen(CONFIG.states.PLAYING);
    
    setTimeout(() => {
        nextScene();
    }, 500);
}

function handleGameClick() {
    if (gameState.currentState !== CONFIG.states.PLAYING) return;
    
    if (gameState.isTyping && gameState.typingInterval) {
        clearTimeout(gameState.typingInterval);
        gameState.isTyping = false;
        
        const scene = gameState.currentSequence[gameState.currentScene];
        if (scene && scene.type === 'text') {
            const lines = scene.lines || [scene.text];
            elements.mainText.innerHTML = lines.join('<br><br>');
            if (scene.style === 'matrix') {
                elements.mainText.classList.add('matrix-text');
            }
        }
        return;
    }
    
    const scene = gameState.currentSequence[gameState.currentScene];
    if (scene && scene.type === 'waitForClick') {
        gameState.currentScene++;
        nextScene();
    }
}

function handleGameKey(e) {
    if (gameState.currentState !== CONFIG.states.PLAYING) return;
    
    if (e.code === 'Space' || e.code === 'Enter') {
        handleGameClick();
    }
}

// ===== УПРАВЛЕНИЕ ЗВУКОМ =====
function toggleSound() {
    gameState.soundEnabled = !gameState.soundEnabled;
    
    const icon = gameState.soundEnabled ? 'fa-volume-up' : 'fa-volume-mute';
    elements.soundBtn.innerHTML = `<i class="fas ${icon}"></i> ЗВУК: ${gameState.soundEnabled ? 'ВКЛ' : 'ВЫКЛ'}`;
    elements.soundToggle.innerHTML = `<i class="fas ${icon}"></i>`;
    
    if (gameState.soundEnabled) {
        elements.menuMusic.volume = CONFIG.music.volume;
        elements.gameMusic.volume = CONFIG.music.volume;
        
        if (gameState.currentState === CONFIG.states.MENU) {
            elements.menuMusic.play();
        } else if (gameState.currentState === CONFIG.states.PLAYING) {
            elements.gameMusic.play();
        }
    } else {
        elements.menuMusic.volume = 0;
        elements.gameMusic.volume = 0;
    }
}

// ===== СИСТЕМА ДОСТИЖЕНИЙ =====
function unlockAchievement(achievementId) {
    if (!CONFIG.achievements[achievementId]) return;
    
    CONFIG.achievements[achievementId].unlocked = true;
    gameState.achievements[achievementId] = true;
    
    showAchievementPopup(CONFIG.achievements[achievementId].title);
    saveAchievements();
}

function showAchievementPopup(title) {
    const popup = document.createElement('div');
    popup.className = 'achievement-popup';
    popup.innerHTML = `
        <h3>★ ДОСТИЖЕНИЕ ★</h3>
        <p>${title}</p>
    `;
    
    document.getElementById('app-container').appendChild(popup);
    
    setTimeout(() => {
        popup.remove();
    }, 3000);
}

function updateAchievementsDisplay() {
    const container = document.querySelector('.achievements-list');
    container.innerHTML = '';
    
    let unlockedCount = 0;
    
    Object.values(CONFIG.achievements).forEach(achievement => {
        const isUnlocked = gameState.achievements[achievement.id] || false;
        if (isUnlocked) unlockedCount++;
        
        const div = document.createElement('div');
        div.className = `achievement ${isUnlocked ? 'unlocked' : 'locked'}`;
        div.innerHTML = `
            <div class="achievement-icon"><i class="fas ${achievement.icon}"></i></div>
            <div class="achievement-info">
                <h3>${achievement.title}</h3>
                <p>${achievement.description}</p>
            </div>
            <div class="achievement-status">${isUnlocked ? 'Разблокировано' : 'Заблокировано'}</div>
        `;
        
        container.appendChild(div);
    });
    
    document.querySelector('.achievements-footer p').textContent = 
        `Всего достижений: ${unlockedCount} из ${Object.keys(CONFIG.achievements).length} разблокировано`;
}

function saveAchievements() {
    localStorage.setItem('observer_achievements', JSON.stringify(gameState.achievements));
}

function loadAchievements() {
    const saved = localStorage.getItem('observer_achievements');
    if (saved) {
        gameState.achievements = JSON.parse(saved);
        
        Object.keys(gameState.achievements).forEach(id => {
            if (CONFIG.achievements[id]) {
                CONFIG.achievements[id].unlocked = true;
            }
        });
    }
}

// ===== ИГРОВОЙ ДВИЖОК =====
function nextScene() {
    if (!gameState.currentSequence || gameState.currentScene >= gameState.currentSequence.length) {
        console.log('Конец последовательности');
        return;
    }
    
    const scene = gameState.currentSequence[gameState.currentScene];
    console.log('Сцена', gameState.currentScene, scene.type);
    
    switch(scene.type) {
        case 'delay':
            setTimeout(() => {
                gameState.currentScene++;
                nextScene();
            }, scene.time);
            break;
            
        case 'title':
            showTitle(scene.text, scene.cinematic, scene.delay, scene.duration, scene.style);
            if (scene.duration > 0) {
                // Для заголовков с duration увеличение сцены делается внутри showTitle
            } else {
                gameState.currentScene++;
            }
            break;
            
        case 'clearTitles':
            clearTitles();
            gameState.currentScene++;
            nextScene();
            break;
            
        case 'text':
            showText(scene.lines || [scene.text], scene.style, scene.typingSpeed, scene.lineDelay, scene.delay);
            gameState.currentScene++;
            break;
            
        case 'textBlock':
            showTextBlock(scene.text, scene.style);
            gameState.currentScene++;
            break;
            
        case 'dialog':
            showDialog(scene.text);
            gameState.currentScene++;
            break;
            
        case 'voidText':
            showVoidText(scene.text, scene.duration || 2500);
            gameState.currentScene++;
            break;
            
        case 'textAuto':
            showTextAuto(scene.lines, scene.interval);
            gameState.currentScene++;
            break;
            
        case 'bg':
            changeBackground(scene.image, scene.transition);
            gameState.currentScene++;
            nextScene();
            break;
            
        case 'bgReverse':
            reverseBackgrounds(scene.images, scene.interval, scene.dim);
            gameState.currentScene++;
            setTimeout(() => {
                nextScene();
            }, scene.interval * scene.images.length);
            break;
            
        case 'clear':
            clearText();
            gameState.currentScene++;
            nextScene();
            break;
            
        case 'clearAll':
            clearAll();
            gameState.currentScene++;
            nextScene();
            break;
            
        case 'pauseText':
            showPauseText(scene.text);
            gameState.currentScene++;
            break;
            
        case 'effect':
            applyEffect(scene.name, scene.duration);
            gameState.currentScene++;
            setTimeout(() => {
                nextScene();
            }, scene.duration || 500);
            break;
            
        case 'choices':
            showChoices(scene.options);
            break;
            
        case 'achievement':
            if (scene.id) unlockAchievement(scene.id);
            if (scene.text) showAchievementMessage(scene.text);
            gameState.currentScene++;
            setTimeout(() => {
                nextScene();
            }, 500);
            break;
            
        case 'transitionToAct4':
            transitionToAct4();
            break;
            
        case 'end':
            showEndScreen(scene.title, scene.message);
            break;
            
        case 'waitForClick':
            break;
            
        default:
            gameState.currentScene++;
            nextScene();
    }
}

// ===== ФУНКЦИИ ОТОБРАЖЕНИЯ =====
function showTitle(text, cinematic = false, delay = 0, duration = 0, style = '') {
    clearAll();
    
    setTimeout(() => {
        const oldTitle = document.querySelector('.cinematic-title, .act-title');
        if (oldTitle) oldTitle.remove();
        
        const titleElement = document.createElement('div');
        titleElement.className = cinematic ? 'cinematic-title' : 'act-title';
        titleElement.textContent = text;
        
        if (style === 'blood') {
            titleElement.classList.add('blood-text');
        }
        
        document.getElementById('game-content').appendChild(titleElement);
        
        setTimeout(() => {
            titleElement.classList.add('visible');
        }, 50);
        
        if (duration > 0) {
            setTimeout(() => {
                titleElement.classList.remove('visible');
                setTimeout(() => {
                    if (titleElement.parentNode) {
                        titleElement.parentNode.removeChild(titleElement);
                    }
                    gameState.currentScene++;
                    nextScene();
                }, 1000);
            }, duration);
        }
    }, delay);
}

function showVoidText(text, duration = 2500) {
    clearAll();
    
    const voidElement = document.createElement('div');
    voidElement.className = 'void-text';
    voidElement.textContent = text;
    
    document.getElementById('game-content').appendChild(voidElement);
    
    setTimeout(() => {
        voidElement.style.animation = 'voidAppear 2.5s forwards';
    }, 50);
    
    setTimeout(() => {
        voidElement.remove();
        setTimeout(() => {
            nextScene();
        }, 500);
    }, duration);
}

function showDialog(text) {
    const dialogElement = document.createElement('div');
    dialogElement.className = 'dialog-block';
    dialogElement.textContent = text;
    
    elements.mainText.appendChild(dialogElement);
    elements.mainText.classList.add('visible');
    
    setTimeout(() => {
        dialogElement.style.animation = 'dialogAppear 0.8s forwards';
        scrollToBottom();
    }, 100);
}

function clearTitles() {
    const titles = document.querySelectorAll('.cinematic-title, .act-title, .void-text');
    titles.forEach(title => {
        title.classList.remove('visible');
        setTimeout(() => {
            if (title.parentNode) {
                title.parentNode.removeChild(title);
            }
        }, 500);
    });
}

function showText(lines, style = '', speed = 50, lineDelay = 0, initialDelay = 0) {
    clearText();
    
    setTimeout(() => {
        let lineIndex = 0;
        let charIndex = 0;
        const textElement = elements.mainText;
        
        textElement.classList.add('visible');
        
        if (style === 'matrix') {
            textElement.classList.add('matrix-text');
        } else if (style === 'italic') {
            textElement.classList.add('italic-text');
        }
        
        function typeChar() {
            if (lineIndex >= lines.length) {
                gameState.isTyping = false;
                scrollToBottom();
                return;
            }
            
            if (charIndex === 0) {
                if (lineIndex > 0) {
                    textElement.innerHTML += '<br><br>';
                }
            }
            
            const line = lines[lineIndex];
            
            if (charIndex < line.length) {
                textElement.innerHTML += line.charAt(charIndex);
                charIndex++;
                gameState.typingInterval = setTimeout(typeChar, speed);
            } else {
                lineIndex++;
                charIndex = 0;
                
                if (lineIndex < lines.length) {
                    gameState.typingInterval = setTimeout(typeChar, lineDelay);
                } else {
                    gameState.isTyping = false;
                    scrollToBottom();
                }
            }
        }
        
        gameState.isTyping = true;
        typeChar();
        
        setTimeout(() => {
            scrollToBottom();
        }, 300);
        
    }, initialDelay);
}

function showTextBlock(text, style = '') {
    const block = document.createElement('div');
    block.className = 'text-block';
    block.innerHTML = text;
    
    if (style === 'poem') {
        block.classList.add('poem');
    }
    
    elements.mainText.appendChild(block);
    elements.mainText.classList.add('visible');
    
    setTimeout(() => {
        block.style.animation = 'textAppear 1s forwards';
        scrollToBottom();
    }, 100);
}

function showTextAuto(lines, interval) {
    clearText();
    elements.mainText.classList.add('visible');
    
    let lineIndex = 0;
    
    function showNextLine() {
        if (lineIndex >= lines.length) {
            return;
        }
        
        const block = document.createElement('div');
        block.className = 'text-block';
        block.textContent = lines[lineIndex];
        elements.mainText.appendChild(block);
        
        lineIndex++;
        
        scrollToBottom();
        
        if (lineIndex < lines.length) {
            setTimeout(showNextLine, interval);
        } else {
            setTimeout(() => {
                scrollToBottom();
            }, 500);
        }
    }
    
    showNextLine();
}

function scrollToBottom() {
    const textContainer = document.getElementById('text-container');
    if (textContainer) {
        setTimeout(() => {
            textContainer.scrollTop = textContainer.scrollHeight;
        }, 50);
    }
}

function changeBackground(imageName, transitionTime = 2000) {
    const imgUrl = CONFIG.images[imageName];
    
    if (imageName === 'black') {
        elements.bg.style.background = '#000';
        elements.bg.style.opacity = '1';
    } else {
        elements.bg.style.backgroundImage = `url('${imgUrl}')`;
        elements.bg.style.opacity = '0';
        
        setTimeout(() => {
            elements.bg.style.opacity = '1';
        }, 50);
    }
    
    if (transitionTime) {
        elements.bg.style.transition = `opacity ${transitionTime}ms ease-in-out`;
    }
}

function reverseBackgrounds(images, interval, dim = false) {
    let index = 0;
    
    function changeNextBg() {
        if (index >= images.length) {
            return;
        }
        
        if (dim) {
            elements.bgOverlay.style.opacity = '0.7';
            setTimeout(() => {
                elements.bgOverlay.style.opacity = '0.3';
            }, interval / 2);
        }
        
        const imgUrl = CONFIG.images[images[index]];
        elements.bg.style.backgroundImage = `url('${imgUrl}')`;
        
        index++;
        
        if (index < images.length) {
            setTimeout(changeNextBg, interval);
        }
    }
    
    changeNextBg();
}

function clearText() {
    if (gameState.typingInterval) {
        clearTimeout(gameState.typingInterval);
    }
    
    elements.mainText.innerHTML = '';
    elements.mainText.className = '';
    elements.mainText.classList.remove('visible', 'matrix-text', 'italic-text');
    gameState.isTyping = false;
    
    const pauseText = document.querySelector('.pause-text');
    if (pauseText) {
        pauseText.remove();
    }
}

function clearAll() {
    clearText();
    clearTitles();
    elements.choicesContainer.innerHTML = '';
}

function showPauseText(text) {
    const pauseElement = document.createElement('div');
    pauseElement.className = 'pause-text';
    pauseElement.textContent = text;
    document.getElementById('game-content').appendChild(pauseElement);
}

function applyEffect(effectName, duration = 500) {
    const container = document.getElementById('game-screen');
    
    switch(effectName) {
        case 'shake':
            container.classList.add('shake-effect');
            setTimeout(() => {
                container.classList.remove('shake-effect');
            }, duration);
            break;
            
        case 'zoom':
            container.classList.add('zoom');
            setTimeout(() => {
                container.classList.remove('zoom');
            }, duration);
            break;
            
        case 'blink':
            container.classList.add('blink');
            setTimeout(() => {
                container.classList.remove('blink');
            }, 300);
            break;
    }
}

function showChoices(options) {
    clearText();
    elements.choicesContainer.innerHTML = '';
    
    options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'choice-btn';
        button.innerHTML = option.text;
        button.onclick = () => {
            elements.choicesContainer.innerHTML = '';
            handleChoice(option.action);
        };
        elements.choicesContainer.appendChild(button);
    });
}

function handleChoice(choice) {
    if (CHOICE_SEQUENCES[choice]) {
        gameState.currentSequence = CHOICE_SEQUENCES[choice];
        gameState.currentScene = 0;
        
        setTimeout(() => {
            nextScene();
        }, 300);
    }
}

function showAchievementMessage(text) {
    const message = document.createElement('div');
    message.className = 'text-block';
    message.style.cssText = `
        color: gold;
        font-size: 1.5rem;
        text-shadow: 0 0 8px gold;
        margin-top: 25px;
        font-weight: bold;
    `;
    message.textContent = text;
    elements.mainText.appendChild(message);
}

function transitionToAct4() {
    setTimeout(() => {
        gameState.currentSequence = CHOICE_SEQUENCES.act4;
        gameState.currentScene = 0;
        nextScene();
    }, 2000);
}

function showEndScreen(title, message) {
    const endScreen = document.createElement('div');
    endScreen.className = 'end-screen';
    endScreen.innerHTML = `
        <h1 class="end-title">${title}</h1>
        <p style="font-size: 1.3rem; text-align: center; line-height: 1.6; max-width: 550px;">${message}</p>
        <div class="end-buttons">
            <button id="menu-btn" class="end-btn">Вернуться в меню</button>
            <button id="restart-btn" class="end-btn">Начать заново</button>
        </div>
    `;
    
    document.getElementById('game-screen').appendChild(endScreen);
    
    document.getElementById('menu-btn').addEventListener('click', () => {
        endScreen.remove();
        switchScreen(CONFIG.states.MENU);
    });
    
    document.getElementById('restart-btn').addEventListener('click', () => {
        endScreen.remove();
        startGame();
    });
}

// ===== ЗАПУСК ИГРЫ =====
window.addEventListener('DOMContentLoaded', init);