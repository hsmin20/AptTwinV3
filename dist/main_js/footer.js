
$(document).ready(function(){
    //애니메이션
    AOS.init({
        offset: 200,
        duration: 1000,
        debounceDelay: 50,
        throttleDelay: 99,
        easing: 'ease-out-back',
    });
    onElementHeightChange(document.body, function(){
        AOS.refresh();
    });
    function onElementHeightChange(elm, callback) {
        var lastHeight = elm.clientHeight
        var newHeight;

        (function run() {
            newHeight = elm.clientHeight;      
            if (lastHeight !== newHeight) callback();
            lastHeight = newHeight;
            if (elm.onElementHeightChangeTimer) {
                    clearTimeout(elm.onElementHeightChangeTimer); 
            }
            elm.onElementHeightChangeTimer = setTimeout(run, 200);
        })();
    }
});
$(window).on('load', function () {
    //애니메이션
    AOS.refresh(true);
});
