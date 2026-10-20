// Log a message to the console to ensure the script is linked correctly
console.log('JavaScript file is linked correctly.');
// ==========================================
// WATER FOR TOMORROW
// Main Game JavaScript
// ==========================================


// ==========================================
// GET HTML ELEMENTS
// ==========================================

const screens = document.querySelectorAll(".screen");

const menuScreen = document.getElementById("menuScreen");
const difficultyScreen = document.getElementById("difficultyScreen");
const gameScreen = document.getElementById("gameScreen");
const pauseScreen = document.getElementById("pauseScreen");
const levelScreen = document.getElementById("levelScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const thankYouScreen = document.getElementById("thankYouScreen");

const gameArea = document.getElementById("gameArea");
const player = document.getElementById("player");
const village = document.getElementById("village");


// HUD

const waterCountDisplay =
    document.getElementById("waterCount");

const waterGoalDisplay =
    document.getElementById("waterGoal");

const timeDisplay =
    document.getElementById("timeDisplay");

const livesDisplay =
    document.getElementById("livesDisplay");

const scoreDisplay =
    document.getElementById("scoreDisplay");

const objectiveText =
    document.getElementById("objectiveText");

const gameFeedback =
    document.getElementById("gameFeedback");


// ==========================================
// GAME VARIABLES
// ==========================================

let playerX = 20;
let playerY = 480;

let playerSpeed = 20;

let waterCollected = 0;
let waterGoal = 5;

let score = 0;
let lives = 3;

let timeLeft = 90;

let currentLevel = 1;
let totalLevels = 3;
let difficulty = "normal";

let gameRunning = false;
let isPaused = false;

let timer;
let audioContext;


// ==========================================
// LEVEL SETTINGS
// ==========================================

const levels = [

    {
        water: 5,
        obstacles: 3,
        wells: 1,
        time: 90
    },

    {
        water: 7,
        obstacles: 5,
        wells: 2,
        time: 80
    },

    {
        water: 10,
        obstacles: 7,
        wells: 3,
        time: 70
    }

];

const cleanWaterFacts = [
    "In 2022, 2.2 billion people lacked safely managed drinking-water services.",
    "When water is easier to reach, people spend less time and effort collecting it.",
    "Access to improved water sources can support children's health and school attendance."
];


// ==========================================
// SCREEN SYSTEM
// ==========================================

function showScreen(screen) {

    screens.forEach(function(item) {
        item.classList.remove("active");
    });

    screen.classList.add("active");
}


// ==========================================
// START GAME
// ==========================================

function initializeAudio() {

    const AudioContextClass =
        window.AudioContext ||
        window.webkitAudioContext;

    if (!AudioContextClass) {
        console.warn("Web Audio is not supported in this browser.");
        return;
    }

    if (!audioContext) {
        audioContext = new AudioContextClass();
    }

    if (audioContext.state === "suspended") {
        audioContext.resume().catch(function(error) {
            console.error("Could not start game audio.", error);
        });
    }
}


function playSound(frequency, delay, duration, type) {

    if (!audioContext || audioContext.state !== "running") {
        return;
    }

    const startTime =
        audioContext.currentTime + delay;

    const oscillator =
        audioContext.createOscillator();

    const volume =
        audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startTime);

    volume.gain.setValueAtTime(0.001, startTime);
    volume.gain.exponentialRampToValueAtTime(0.15, startTime + 0.01);
    volume.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    oscillator.connect(volume);
    volume.connect(audioContext.destination);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
}


function startGame(selectedDifficulty = "normal") {

    currentLevel = 1;

    score = 0;

    lives = 3;

    difficulty = selectedDifficulty;

    initializeAudio();

    startLevel();
}


// ==========================================
// START LEVEL
// ==========================================

function startLevel() {

    showScreen(gameScreen);

    const baseLevel =
        levels[currentLevel - 1];

    const level =
        difficulty === "hard"
            ? {
                water: baseLevel.water + 2,
                obstacles: baseLevel.obstacles + 2,
                wells: baseLevel.wells + 1,
                time: Math.max(30, baseLevel.time - 15)
            }
            : baseLevel;

    waterCollected = 0;

    waterGoal = level.water;

    timeLeft = level.time;

    playerX = 20;

    playerY =
        Math.max(
            20,
            gameArea.clientHeight - 70
        );

    gameRunning = true;

    isPaused = false;


    // Remove objects left over
    // from the previous level.

    removeGameObjects();


    // Create new level objects.

    createObstacles(level.obstacles);

    createWater(level.water);

    createWells(level.wells);


    updatePlayer();

    updateHUD();

    startTimer();
}


// ==========================================
// REMOVE OLD OBJECTS
// ==========================================

function removeGameObjects() {

    document
        .querySelectorAll(
            ".water, .obstacle, .well"
        )
        .forEach(function(object) {

            object.remove();

        });
}


// ==========================================
// CREATE WATER
// ==========================================

function createWater(amount) {

    for (let i = 0; i < amount; i++) {

        const water =
            document.createElement("div");

        water.classList.add("water");

        water.textContent = "💧";

        gameArea.appendChild(water);

        placeRandomly(water, 50, false, true);
    }
}


// ==========================================
// CREATE OBSTACLES
// ==========================================

function createObstacles(amount) {

    const obstacleIcons = [
        "🪨",
        "🌵",
        "🌳"
    ];

    for (let i = 0; i < amount; i++) {

        const obstacle =
            document.createElement("div");

        obstacle.classList.add("obstacle");

        const randomIcon =
            obstacleIcons[
                Math.floor(
                    Math.random() *
                    obstacleIcons.length
                )
            ];

        obstacle.textContent =
            randomIcon;

        gameArea.appendChild(obstacle);

        placeRandomly(obstacle, 0, true, true);
    }
}


// ==========================================
// CREATE WELLS
// ==========================================

function createWells(amount) {

    for (let i = 0; i < amount; i++) {

        const well =
            document.createElement("div");

        well.classList.add("well");

        well.textContent = "🕳️";

        well.dataset.fixed = "false";

        gameArea.appendChild(well);

        placeRandomly(well);
    }
}


// ==========================================
// RANDOM POSITION
// ==========================================

function placeRandomly(object, obstacleSpacing = 0, keepStartClear = false, keepVillageClear = false) {

    const maxX =
        Math.max(
            0,
            gameArea.clientWidth - object.offsetWidth - 10
        );

    const maxY =
        Math.max(
            0,
            gameArea.clientHeight - object.offsetHeight - 10
        );

    const obstacles =
        obstacleSpacing > 0
            ? gameArea.querySelectorAll(".obstacle")
            : [];

    for (let attempt = 0; attempt < 100; attempt++) {

        const x =
            Math.floor(
                Math.random() * (maxX + 1)
            );

        const y =
            Math.floor(
                Math.random() * (maxY + 1)
            );

        const tooCloseToObstacle =
            Array.from(obstacles).some(function(obstacle) {

                const horizontalGap =
                    Math.max(
                        0,
                        obstacle.offsetLeft - (x + object.offsetWidth),
                        x - (obstacle.offsetLeft + obstacle.offsetWidth)
                    );

                const verticalGap =
                    Math.max(
                        0,
                        obstacle.offsetTop - (y + object.offsetHeight),
                        y - (obstacle.offsetTop + obstacle.offsetHeight)
                    );

                return Math.hypot(horizontalGap, verticalGap) < obstacleSpacing;

            });

        const startHorizontalGap =
            Math.max(
                0,
                playerX - (x + object.offsetWidth),
                x - (playerX + player.offsetWidth)
            );

        const startVerticalGap =
            Math.max(
                0,
                playerY - (y + object.offsetHeight),
                y - (playerY + player.offsetHeight)
            );

        const tooCloseToPlayerStart =
            keepStartClear &&
            Math.hypot(startHorizontalGap, startVerticalGap) < 60;

        const villageX =
            village.offsetLeft;

        const villageY =
            village.offsetTop;

        const villageHorizontalGap =
            Math.max(
                0,
                villageX - (x + object.offsetWidth),
                x - (villageX + village.offsetWidth)
            );

        const villageVerticalGap =
            Math.max(
                0,
                villageY - (y + object.offsetHeight),
                y - (villageY + village.offsetHeight)
            );

        const tooCloseToVillage =
            keepVillageClear &&
            Math.hypot(villageHorizontalGap, villageVerticalGap) < 70;

        if (
            !tooCloseToObstacle &&
            !tooCloseToPlayerStart &&
            !tooCloseToVillage
        ) {

            object.style.left =
                x + "px";

            object.style.top =
                y + "px";

            return;
        }
    }

    throw new Error("Could not find a safe position for the game object.");
}


// ==========================================
// PLAYER MOVEMENT
// ==========================================

function movePlayer(direction) {

    if (!gameRunning || isPaused) {
        return;
    }


    if (direction === "up") {
        playerY -= playerSpeed;
    }

    if (direction === "down") {
        playerY += playerSpeed;
    }

    if (direction === "left") {
        playerX -= playerSpeed;
    }

    if (direction === "right") {
        playerX += playerSpeed;
    }


    // Keep player inside game area.

    const maxX =
        gameArea.clientWidth -
        player.offsetWidth;

    const maxY =
        gameArea.clientHeight -
        player.offsetHeight;


    playerX =
        Math.max(
            0,
            Math.min(playerX, maxX)
        );

    playerY =
        Math.max(
            0,
            Math.min(playerY, maxY)
        );


    updatePlayer();

    checkCollisions();
}


// ==========================================
// UPDATE PLAYER POSITION
// ==========================================

function updatePlayer() {

    player.style.left =
        playerX + "px";

    player.style.top =
        playerY + "px";
}


// ==========================================
// KEYBOARD CONTROLS
// ==========================================

document.addEventListener(
    "keydown",
    function(event) {

        const key =
            event.key.toLowerCase();


        if (
            key === "arrowup" ||
            key === "w"
        ) {

            event.preventDefault();

            movePlayer("up");
        }


        if (
            key === "arrowdown" ||
            key === "s"
        ) {

            event.preventDefault();

            movePlayer("down");
        }


        if (
            key === "arrowleft" ||
            key === "a"
        ) {

            event.preventDefault();

            movePlayer("left");
        }


        if (
            key === "arrowright" ||
            key === "d"
        ) {

            event.preventDefault();

            movePlayer("right");
        }


        // Spacebar repairs wells.

        if (key === " ") {

            event.preventDefault();

            repairNearbyWell();
        }


        // P pauses game.

        if (key === "p") {

            if (gameRunning) {

                if (isPaused) {
                    resumeGame();
                }
                else {
                    pauseGame();
                }

            }

        }

    }
);


// ==========================================
// ON-SCREEN ARROW BUTTONS
// ==========================================

document
    .querySelectorAll(
        "[data-direction]"
    )
    .forEach(function(button) {

        button.addEventListener(
            "click",
            function() {

                movePlayer(
                    button.dataset.direction
                );

            }
        );

    });

// Keep the player and placed objects inside the play area after rotation or resize.
window.addEventListener("resize", function() {

    if (!gameScreen.classList.contains("active")) {
        return;
    }

    playerX = Math.min(
        playerX,
        Math.max(0, gameArea.clientWidth - player.offsetWidth)
    );

    playerY = Math.min(
        playerY,
        Math.max(0, gameArea.clientHeight - player.offsetHeight)
    );

    updatePlayer();

    document
        .querySelectorAll(".water, .obstacle, .well")
        .forEach(function(object) {

            const maxX = Math.max(0, gameArea.clientWidth - object.offsetWidth);
            const maxY = Math.max(0, gameArea.clientHeight - object.offsetHeight);
            const objectX = parseFloat(object.style.left) || 0;
            const objectY = parseFloat(object.style.top) || 0;

            object.style.left = Math.min(objectX, maxX) + "px";
            object.style.top = Math.min(objectY, maxY) + "px";

        });

});


// ==========================================
// COLLISION FUNCTION
// ==========================================

function isColliding(a, b) {

    const aRect =
        a.getBoundingClientRect();

    const bRect =
        b.getBoundingClientRect();


    return !(
        aRect.right < bRect.left ||
        aRect.left > bRect.right ||
        aRect.bottom < bRect.top ||
        aRect.top > bRect.bottom
    );
}


// ==========================================
// CHECK COLLISIONS
// ==========================================

function checkCollisions() {

    checkWaterCollision();

    checkObstacleCollision();

    checkLevelComplete();
}


function showGameFeedback(message, type, statCard) {

    gameFeedback.textContent = message;
    gameFeedback.className = `game-feedback feedback-${type}`;

    // Restart the brief animation so repeated feedback is visible.
    clearTimeout(feedbackTimeout);
    void gameFeedback.offsetWidth;
    gameFeedback.classList.add("feedback-show");

    if (statCard) {
        const card =
            document.getElementById(statCard).closest(".hud-box");

        card.classList.remove("stat-pop");
        void card.offsetWidth;
        card.classList.add("stat-pop");
    }

    feedbackTimeout = setTimeout(function() {
        gameFeedback.classList.remove("feedback-show");
    }, 1600);
}


// ==========================================
// WATER COLLISION
// ==========================================

function checkWaterCollision() {

    const waters =
        document.querySelectorAll(".water");


    waters.forEach(function(water) {

        if (
            water.isConnected &&
            isColliding(player, water)
        ) {

            water.remove();

            waterCollected++;

            score += 100;

            playSound(660, 0, 0.12, "sine");
            playSound(880, 0.09, 0.16, "sine");

            showGameFeedback(
                "+1 Clean Water! +100 points",
                "success",
                "waterCount"
            );

            updateHUD();

        }

    });
}


// ==========================================
// OBSTACLE COLLISION
// ==========================================

function checkObstacleCollision() {

    const obstacles =
        document.querySelectorAll(
            ".obstacle"
        );


    obstacles.forEach(
        function(obstacle) {

            if (
                isColliding(
                    player,
                    obstacle
                )
            ) {

                hitObstacle();

            }

        }
    );
}


// ==========================================
// HIT OBSTACLE
// ==========================================

let recentlyHit = false;
let feedbackTimeout;


function hitObstacle() {

    // Prevent one obstacle from
    // removing all lives instantly.

    if (recentlyHit) {
        return;
    }

    recentlyHit = true;

    playSound(180, 0, 0.22, "square");

    lives--;

    score =
        Math.max(
            0,
            score - 50
        );


    // Return player to start.

    playerX = 20;

    playerY =
        Math.max(
            20,
            gameArea.clientHeight - 70
        );

    updatePlayer();

    updateHUD();

    showGameFeedback(
        "Obstacle hit! -1 life, -50 points. Sent back to start.",
        "warning",
        "livesDisplay"
    );


    if (lives <= 0) {

        endGame(
            "An obstacle hit cost your last life and 50 points."
        );

    }


    setTimeout(
        function() {

            recentlyHit = false;

        },
        1000
    );
}


// ==========================================
// REPAIR WELL
// ==========================================

function repairNearbyWell() {

    if (!gameRunning || isPaused) {
        return;
    }


    const wells =
        document.querySelectorAll(
            ".well"
        );


    wells.forEach(function(well) {

        if (
            well.dataset.fixed ===
            "false"
        ) {
            if (isColliding(player, well)) {

                well.dataset.fixed =
                    "true";

                well.textContent =
                    "⛲";

                score += 250;

                showGameFeedback(
                    "Well repaired! +250 points",
                    "success",
                    "scoreDisplay"
                );

                updateHUD();
            }

        }

    });
}


// ==========================================
// TIMER
// ==========================================

function startTimer() {

    clearInterval(timer);


    timer =
        setInterval(
            function() {

                if (
                    gameRunning &&
                    !isPaused
                ) {

                    timeLeft--;

                    updateHUD();


                    if (timeLeft <= 0) {

                        endGame(
                            "You ran out of time!"
                        );

                    }

                }

            },
            1000
        );
}


// ==========================================
// FORMAT TIMER
// ==========================================

function formatTime(seconds) {

    const minutes =
        Math.floor(
            seconds / 60
        );

    const remainingSeconds =
        seconds % 60;


    return (
        String(minutes)
            .padStart(2, "0")
        +
        ":"
        +
        String(remainingSeconds)
            .padStart(2, "0")
    );
}


// ==========================================
// UPDATE HUD
// ==========================================

function updateHUD() {

    waterCountDisplay.textContent =
        waterCollected;

    waterGoalDisplay.textContent =
        waterGoal;

    livesDisplay.textContent =
        lives;

    scoreDisplay.textContent =
        score;

    timeDisplay.textContent =
        formatTime(timeLeft);

    objectiveText.textContent =
        waterCollected >= waterGoal
            ? "All water collected! Reach the village."
            : `Collect all the water, then reach the village.`;
}


// ==========================================
// CHECK LEVEL COMPLETE
// ==========================================

function checkLevelComplete() {

    if (
        waterCollected >= waterGoal &&
        isColliding(player, village)
    ) {

        completeLevel();

    }
}


// ==========================================
// COMPLETE LEVEL
// ==========================================

function completeLevel() {

    gameRunning = false;

    clearInterval(timer);

    playSound(523, 0, 0.16, "sine");
    playSound(659, 0.14, 0.16, "sine");
    playSound(784, 0.28, 0.16, "sine");
    playSound(1047, 0.42, 0.3, "sine");


    // Bonus for remaining time.

    score += timeLeft * 5;


    document.getElementById(
        "resultWater"
    ).textContent =
        waterCollected;


    document.getElementById(
        "peopleHelped"
    ).textContent =
        waterCollected * 3;


    document.getElementById(
        "resultScore"
    ).textContent =
        score;

    const waterFact =
        cleanWaterFacts[(currentLevel - 1) % cleanWaterFacts.length];

    document.getElementById("levelWaterFact").textContent =
        waterFact;

    document.getElementById("finalWaterFact").textContent =
        waterFact;


    // Final level?

    if (
        currentLevel >= totalLevels
    ) {

        document.getElementById(
            "finalScore"
        ).textContent =
            score;

        showScreen(
            thankYouScreen
        );

        return;
    }


    showScreen(
        levelScreen
    );
}


// ==========================================
// NEXT LEVEL
// ==========================================

function nextLevel() {

    currentLevel++;

    startLevel();
}


// ==========================================
// PAUSE
// ==========================================

function pauseGame() {

    if (!gameRunning) {
        return;
    }

    isPaused = true;

    pauseScreen.classList.add(
        "active"
    );
}


// ==========================================
// RESUME
// ==========================================

function resumeGame() {

    isPaused = false;

    pauseScreen.classList.remove(
        "active"
    );
}


// ==========================================
// GAME OVER
// ==========================================

function endGame(message) {

    gameRunning = false;

    clearInterval(timer);

    document.getElementById(
        "gameOverMessage"
    ).textContent =
        message;

    showScreen(
        gameOverScreen
    );
}


// ==========================================
// RETURN TO MENU
// ==========================================

function returnToMenu() {

    gameRunning = false;

    isPaused = false;

    clearInterval(timer);

    pauseScreen.classList.remove(
        "active"
    );

    showScreen(
        menuScreen
    );
}


// ==========================================
// BUTTON EVENTS
// ==========================================


// Play

document.getElementById(
    "playButton"
).addEventListener(
    "click",
    function() {

        showScreen(difficultyScreen);

    }
);


// Difficulty choices

document.getElementById(
    "normalButton"
).addEventListener(
    "click",
    function() {

        startGame("normal");

    }
);


document.getElementById(
    "hardButton"
).addEventListener(
    "click",
    function() {

        startGame("hard");

    }
);


document.getElementById(
    "difficultyBackButton"
).addEventListener(
    "click",
    function() {

        showScreen(menuScreen);

    }
);


// How to Play

document.getElementById(
    "howButton"
).addEventListener(
    "click",
    function() {

        showScreen(
            document.getElementById(
                "howScreen"
            )
        );

    }
);


// About

document.getElementById(
    "aboutButton"
).addEventListener(
    "click",
    function() {

        showScreen(
            document.getElementById(
                "aboutScreen"
            )
        );

    }
);


// Back buttons

document.getElementById(
    "howBackButton"
).addEventListener(
    "click",
    function() {

        showScreen(menuScreen);

    }
);


document.getElementById(
    "aboutBackButton"
).addEventListener(
    "click",
    function() {

        showScreen(menuScreen);

    }
);


// Pause

document.getElementById(
    "pauseButton"
).addEventListener(
    "click",
    pauseGame
);


// Resume

document.getElementById(
    "resumeButton"
).addEventListener(
    "click",
    resumeGame
);


// Restart current level

document.getElementById(
    "restartButton"
).addEventListener(
    "click",
    function() {

        pauseScreen.classList.remove(
            "active"
        );

        startLevel();

    }
);


// Main menu

document.getElementById(
    "mainMenuButton"
).addEventListener(
    "click",
    returnToMenu
);


// Next Level

document.getElementById(
    "nextLevelButton"
).addEventListener(
    "click",
    nextLevel
);


// Game-over restart

document.getElementById(
    "tryAgainButton"
).addEventListener(
    "click",
    startLevel
);


// Game-over menu

document.getElementById(
    "gameOverMenuButton"
).addEventListener(
    "click",
    returnToMenu
);


// Play Again

document.getElementById(
    "playAgainButton"
).addEventListener(
    "click",
    startGame
);