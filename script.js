$(document).ready(function () {
    $("#content").fadeIn(1000);
    let gamemode = "none";
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
            $("#content").fadeOut(1000, function() {
            window.location.href = "game.html";
            });
        }
    });
});