$(window).on('scroll',function() {    
    var scroll = $(window).scrollTop();

    if (scroll >= 100) {
        $(".navbar-default").addClass("navbarScroll");
    } else {
        $(".navbar-default").removeClass("navbarScroll");
    }
});