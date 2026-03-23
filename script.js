$(document).ready(function () {
    // Kezdeti megjelenítés
    $("#content").fadeIn(1000);

    // Változók beállítása
    let mode = localStorage.getItem("selected_gamemode");
    let gamemode = "none"; // Ez a menüben való választáshoz kell
    console.log("Mentett mód: " + mode);

    // --- MENÜ (INDEX) LOGIKA ---
    if (mode === "none" || mode === null) {
        // Gombok animációja
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

    // --- JÁTÉK (GAME) LOGIKA ---
    // Ha a mód single, cpu vagy multi, generáljuk a táblát
    if (mode === "single" || mode === "cpu" || mode === "multi") {
        setupGame();
    }

    function setupGame() {
        const board = $("#game-board");
        let cards = [];

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

        // 4. Kattintás (Fordítás)
        board.on("click", ".card", function() {
            if ($(this).hasClass("flipped")) return;
            $(this).addClass("flipped");
            // Itt jön majd a checkMatch() logika a következő lépésben
        });
    }

    // --- HEADER (Vissza a menübe) ---
    $("#header").click(function () {
        localStorage.setItem("selected_gamemode", "none");
        $("#content").fadeOut(1000, function() {
            window.location.href = "index.html";
        });
    });
});