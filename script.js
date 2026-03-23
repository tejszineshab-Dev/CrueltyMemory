$(document).ready(function () {
    $("#content").fadeIn(1000);
    let mode = localStorage.getItem("selected_gamemode");
    if (mode == "none" || mode == null) {
        $(".btn").hover(function () {
        $(this).animate({
            width: '60vw'
        }, 100);
    }, function () {
        $(this).animate({
            width: '50vw'
        }, 100)
    });

    $(".btn").click(function () {
        gamemode = $(this).attr("id");
        $(".btn-start").attr(
            "src", "img/btns/mission_start.png");
        $(".btn").css({
            backgroundColor: 'var(--green)', 
            color: 'white',
            border: 'white 4px solid'
        });
            $(this).css({
                backgroundColor: 'white', 
                color: 'var(--green)',
            border: 'var(--green) 4px solid'
        });
    });

    $(".btn-start").click(function () { 
        if (gamemode == "none") {
            window.alert("Please select a gamemode!")
        }
        else {
            localStorage.setItem("selected_gamemode", gamemode);
            $("#content").fadeOut(1000, function() {
            window.location.href = "game.html";
            });
        }
    });
    }
    console.log("Selected gamemode" + mode);
    let gamemode = "none";
    

    $("#header").click(function () {
        let gamemode = "none";
        localStorage.setItem("selected_gamemode", gamemode);
        $("#content").fadeOut(1000, function() {
        window.location.href = "index.html";
        });
    });
});