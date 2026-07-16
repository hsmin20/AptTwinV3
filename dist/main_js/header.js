
$(document).ready(function(){
    function hdOn(){
        if($(window).scrollTop() > 50){
            $("#header").addClass("on");
        } else {
            $("#header").removeClass("on");
        }
    }
    hdOn();
    $(window).on("scroll", hdOn);
});