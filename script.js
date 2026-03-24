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
        
        // Multiplayer variables
        let currentPlayer = 1;
        let scores = {1: 0, 2: 0};
        let isMultiplayer = (gameMode === "multi");

        // Setup UI based on mode
        if (isMultiplayer) {
            // Hide timer for multiplayer
            $("#timer-display").parent().hide();
            
            // Add turn indicator and scores
            $("#status-container").append(`
                <div class="status-box" id="turn-box">
                    <p class="status-label">TURN</p>
                    <p id="turn-display" style="margin: 5px 0 0 0; font-size: 28px; color: var(--green); font-weight: bold;">PLAYER 1</p>
                </div>
                <div class="status-box">
                    <p class="status-label">P1 SCORE</p>
                    <p id="p1-score" style="margin: 5px 0 0 0; font-size: 28px; color: var(--green); font-weight: bold;">0</p>
                </div>
                <div class="status-box">
                    <p class="status-label">P2 SCORE</p>
                    <p id="p2-score" style="margin: 5px 0 0 0; font-size: 28px; color: var(--green); font-weight: bold;">0</p>
                </div>
            `);
        }

        // 1. 18 pár generálása (36 kártya)
        for (let i = 1; i <= 18; i++) {
            cards.push(i, i);
        }

        // 2. Keverés
        cards.sort(() => Math.random() - 0.5);

        // 3. Kártyák létrehozása
        cards.forEach(num => {
            const cardHTML = `
                <div class="card" data-value="${num}">
                    <div class="card-inner">
                        <div class="card-front">
                            <img src="img/cards/${num}.png" alt="front">
                        </div>
                        <div class="card-back">
                            <img src="img/cards/back.png" alt="back">
                        </div>
                    </div>
                </div>`;
            board.append(cardHTML);
        });

        // 4. Kattintás (Fordítás és Logika)
        board.on("click", ".card", function() {
            if (lockBoard || $(this).hasClass("flipped")) return;

            // Only start timer for single player modes
            if (!timerStarted && !isMultiplayer) {
                timerStarted = true;
                startTimer();
            }

            $(this).addClass("flipped");
            flippedCards.push($(this));

            if (flippedCards.length === 2) {
                checkForMatch();
            }
        });

        function startTimer() {
            timerInterval = setInterval(() => {
                seconds++;
                let mins = Math.floor(seconds / 60);
                let secs = seconds % 60;
                $("#timer-display").text(
                    (mins < 10 ? "0" + mins : mins) + ":" + 
                    (secs < 10 ? "0" + secs : secs)
                );
            }, 1000);
        }

        function checkForMatch() {
            let isMatch = flippedCards[0].data("value") === flippedCards[1].data("value");

            if (isMatch) {
                matchedPairs++;
                
                if (isMultiplayer) {
                    // Award point to current player
                    scores[currentPlayer]++;
                    updateScoreboard();
                    flippedCards = [];
                    
                    // Check game end
                    if (matchedPairs === 18) {
                        endMultiplayerGame();
                    }
                    // Player keeps the turn on successful match
                } else {
                    // Single player logic
                    flippedCards = [];
                    if (matchedPairs === 18) {
                        clearInterval(timerInterval);
                        setTimeout(() => {
                            alert("MISSION ACCOMPLISHED\nTime: " + $("#timer-display").text());
                        }, 500);
                    }
                }
            } else {
                // No match - flip cards back
                lockBoard = true;
                board.addClass("locked");
                setTimeout(() => {
                    flippedCards[0].removeClass("flipped");
                    flippedCards[1].removeClass("flipped");
                    flippedCards = [];
                    lockBoard = false;
                    board.removeClass("locked");
                    
                    // Switch turn only in multiplayer mode when no match
                    if (isMultiplayer) {
                        switchTurn();
                    }
                }, 1000);
            }
        }

        function switchTurn() {
            currentPlayer = currentPlayer === 1 ? 2 : 1;
            $("#turn-display").text("PLAYER " + currentPlayer);
        }

        function updateScoreboard() {
            $("#p1-score").text(scores[1]);
            $("#p2-score").text(scores[2]);
        }

        function endMultiplayerGame() {
            let message;
            if (scores[1] > scores[2]) {
                message = `PLAYER 1 WINS!\nP1: ${scores[1]} | P2: ${scores[2]}`;
            } else if (scores[2] > scores[1]) {
                message = `PLAYER 2 WINS!\nP2: ${scores[2]} | P1: ${scores[1]}`;
            } else {
                message = `DRAW!\nP1: ${scores[1]} | P2: ${scores[2]}`;
            }
            
            setTimeout(() => {
                alert("MISSION ACCOMPLISHED\n" + message);
            }, 500);
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