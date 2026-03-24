$(document).ready(function () {
    // Kezdeti megjelenítés
    $("#content").fadeIn(1000);

    // Változók beállítása
    let mode = localStorage.getItem("selected_gamemode");
    let gamemode = "none";
    console.log("Mentett mód: " + mode);

    if (mode && mode !== "none") {
        let modeName = "";
        if (mode === "single") modeName = "SINGLEPLAYER";
        if (mode === "cpu") modeName = "VS CPU";
        if (mode === "multi") modeName = "MULTIPLAYER";
        $("#mode-display").text(modeName);
    }

    //  Index oldal
    if (mode === "none" || mode === null) {
        $(".btn").hover(function () {
            $(this).stop().animate({ width: '60vw' }, 100);
        }, function () {
            $(this).stop().animate({ width: '50vw' }, 100);
        });

        // Játékmód választás
        $(".btn").click(function () {
            gamemode = $(this).attr("id");
            $(".btn-start").attr("src", "img/btns/mission_start.png");
            
            // Gombok színeinek resetelése és az aktív kiemelése
            $(".btn").css({ backgroundColor: 'var(--green)', color: 'white', border: 'white 4px solid' });
            $(this).css({ backgroundColor: 'white', color: 'var(--green)', border: 'var(--green) 4px solid' });
        });

        // Start gomb
        $(".btn-start").click(function () { 
            if (gamemode === "none") {
                window.alert("Please select a gamemode!");
            } else {
                localStorage.setItem("selected_gamemode", gamemode);
                $("#content").fadeOut(1000, function() {
                    window.location.href = "game.html";
                });
            }
        });
    } 

    // Játéktér, stb.
    if (mode === "single" || mode === "cpu" || mode === "multi") {
        setupGame(mode);
    }

    function setupGame(gameMode) {
    const board = $("#game-board");
    let cards = [];
    let flippedCards = [];
    let lockBoard = false;
    
    let timerStarted = false;
    let seconds = 0;
    let timerInterval;
    let matchedPairs = 0;
    
    // Módok meghatározása
    let isMultiplayer = (gameMode === "multi");
    let isCPU = (gameMode === "cpu");
    let currentPlayer = 1; // 1 = Játékos, 2 = CPU/Másik Játékos
    let scores = {1: 0, 2: 0};

    // UI beállítása (Pontok és körök kijelzése)
    if (isMultiplayer || isCPU) {
        $("#timer-display").parent().hide();
        let p2Label = isCPU ? "CPU" : "P2";
        
        $("#status-container").append(`
            <div class="status-box" id="turn-box">
                <p class="status-label">TURN</p>
                <p id="turn-display" style="margin: 5px 0 0 0; font-size: 28px; color: var(--green); font-weight: bold;">YOU</p>
            </div>
            <div class="status-box">
                <p class="status-label">YOUR SCORE</p>
                <p id="p1-score" style="margin: 5px 0 0 0; font-size: 28px; color: var(--green); font-weight: bold;">0</p>
            </div>
            <div class="status-box">
                <p class="status-label">${p2Label} SCORE</p>
                <p id="p2-score" style="margin: 5px 0 0 0; font-size: 28px; color: var(--green); font-weight: bold;">0</p>
            </div>
        `);
    }

    // Kártyák generálása és keverése (marad az eredeti)
    for (let i = 1; i <= 18; i++) { cards.push(i, i); }
    cards.sort(() => Math.random() - 0.5);
    cards.forEach(num => {
        const cardHTML = `
            <div class="card" data-value="${num}">
                <div class="card-inner">
                    <div class="card-front"><img src="img/cards/${num}.png"></div>
                    <div class="card-back"><img src="img/cards/back.png"></div>
                </div>
            </div>`;
        board.append(cardHTML);
    });

    // Kattintás kezelése
    board.on("click", ".card", function() {
        if (lockBoard || $(this).hasClass("flipped")) return;
        // Ha CPU jön, a játékos nem kattinthat
        if (isCPU && currentPlayer === 2) return;

        handleFlip($(this));
    });

    function handleFlip(cardElement) {
        cardElement.addClass("flipped");
        flippedCards.push(cardElement);

        if (flippedCards.length === 2) {
            checkForMatch();
        }
    }

    function checkForMatch() {
        lockBoard = true;
        let isMatch = flippedCards[0].data("value") === flippedCards[1].data("value");

        if (isMatch) {
            matchedPairs++;
            if (isMultiplayer || isCPU) {
                scores[currentPlayer]++;
                updateScoreboard();
                flippedCards = [];
                lockBoard = false;

                if (matchedPairs === 18) {
                    endGame();
                } else if (isCPU && currentPlayer === 2) {
                    // Ha a CPU talált, vár egy kicsit és újra húz
                    setTimeout(cpuTurn, 1000);
                }
            } else {
                // Single player logic
                flippedCards = [];
                lockBoard = false;
                if (matchedPairs === 18) endGame();
            }
        } else {
            // Nincs találat
            setTimeout(() => {
                flippedCards[0].removeClass("flipped");
                flippedCards[1].removeClass("flipped");
                flippedCards = [];
                
                if (isMultiplayer || isCPU) {
                    switchTurn();
                }
                lockBoard = false;
            }, 1000);
        }
    }

    function switchTurn() {
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        let p2Name = isCPU ? "CPU" : "PLAYER 2";
        $("#turn-display").text(currentPlayer === 1 ? "YOU" : p2Name);

        // Ha CPU jön, indítjuk az automatikáját
        if (isCPU && currentPlayer === 2) {
            setTimeout(cpuTurn, 1000);
        }
    }

    function cpuTurn() {
        if (matchedPairs === 18) return;

        // Keresünk két kártyát, ami még nincs kint
        let availableCards = $(".card").not(".flipped");
        if (availableCards.length < 2) return;

        // Első választás
        let firstIndex = Math.floor(Math.random() * availableCards.length);
        let firstCard = $(availableCards[firstIndex]);
        handleFlip(firstCard);

        // Második választás (kicsit később, hogy látszódjon)
        setTimeout(() => {
            availableCards = $(".card").not(".flipped");
            let secondIndex = Math.floor(Math.random() * availableCards.length);
            let secondCard = $(availableCards[secondIndex]);
            handleFlip(secondCard);
        }, 800);
    }

    function updateScoreboard() {
        $("#p1-score").text(scores[1]);
        $("#p2-score").text(scores[2]);
    }

    function endGame() {
        let message = "MISSION ACCOMPLISHED\n";
        if (isMultiplayer || isCPU) {
            let p2Name = isCPU ? "CPU" : "PLAYER 2";
            if (scores[1] > scores[2]) message += "YOU WIN!";
            else if (scores[2] > scores[1]) message += p2Name + " WINS!";
            else message += "IT'S A DRAW!";
        } else {
            message += "Time: " + $("#timer-display").text();
        }
        alert(message);
    }
}

    // Cím, vissza a főmenübe
    $("#header").click(function () {
        localStorage.setItem("selected_gamemode", "none");
        $("#content").fadeOut(1000, function() {
            window.location.href = "index.html";
        });
    });

    // Cursor váltogatása hovernél
    let cursorImages = [
        "url(img/cursor/cursor_open.png), auto",
        "url(img/cursor/cursor_point.png), auto",
        "url(img/cursor/cursor_closed.png), auto"
    ];
    let cursorStep = 0;
    let cursorInterval;

    $(".btn-start, .btn, .card-back, #header").on("mouseenter", function() {
        cursorInterval = setInterval(() => {
            $(this).css("cursor", cursorImages[cursorStep]);
            cursorStep = (cursorStep + 1) % cursorImages.length;
        }, 75);
    }).on("mouseleave", function() {
        clearInterval(cursorInterval);
        $(this).css("cursor", "url(img/cursor/cursor_open.png), auto");
    });
});