$(document).ready(function(){
    var visualSwiper = new Swiper(".visualSwiper", {
        speed : 700,
        loop : true, 
        loopAdditionalSlides : 1, 
        effect: "fade",
        autoplay : {
            delay : 8000, 
            disableOnInteraction : false,
        },
        navigation: {
            prevEl: ".visualSwiper .swiper-button-prev",
            nextEl: ".visualSwiper .swiper-button-next",
        },
        pagination: {
            el: ".visualSwiper .swiper-pagination",
            clickable: true,
        },
    });
    $(window).on("resize", function(){
        visualSwiper.update();
    });
});
