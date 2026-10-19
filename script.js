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
const gameScreen = document.getElementById("gameScreen");
const pauseScreen = document.getElementById("pauseScreen");
const levelScreen = document.getElementById("levelScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const thankYouScreen = document.getElementById("thankYouScreen");

const gameArea = document.getElementById("gameArea");
const player = document.getElementById("player");


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

let gameRunning = false;
let isPaused = false;

let timer;


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

function startGame() {

    currentLevel = 1;

    score = 0;

    lives = 3;

    startLevel();
}


// ==========================================
// START LEVEL
// ==========================================

function startLevel() {

    showScreen(gameScreen);

    const level =
        levels[currentLevel - 1];

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

    createWater(level.water);

    createObstacles(level.obstacles);

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

        placeRandomly(water);

        gameArea.appendChild(water);
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

        placeRandomly(obstacle);

        gameArea.appendChild(obstacle);
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

        placeRandomly(well);

        gameArea.appendChild(well);
    }
}


// ==========================================
// RANDOM POSITION
// ==========================================

function placeRandomly(object) {

    const maxX =
        Math.max(
            50,
            gameArea.clientWidth - 60
        );

    const maxY =
        Math.max(
            50,
            gameArea.clientHeight - 60
        );

    const x =
        Math.floor(
            Math.random() * maxX
        );

    const y =
        Math.floor(
            Math.random() * maxY
        );

    object.style.left =
        x + "px";

    object.style.top =
        y + "px";
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


function hitObstacle() {

    // Prevent one obstacle from
    // removing all lives instantly.

    if (recentlyHit) {
        return;
    }

    recentlyHit = true;

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


    if (lives <= 0) {

        endGame(
            "You ran out of lives!"
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
}


// ==========================================
// CHECK LEVEL COMPLETE
// ==========================================

function checkLevelComplete() {

    if (
        waterCollected >= waterGoal
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
    startGame
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