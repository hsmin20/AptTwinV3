$(document).ready(function(){

    $(document).on("click", ".chart_btn", function() {
        $(".chart_layer").addClass("on");
        document.getElementById('popup').style.display = 'block';
        document.getElementById('graph').style.display = 'none';
    });
    
    // X 버튼을 클릭했을 때 그래프 레이어 닫기
    $(document).on("click", ".chart_layer .close-btn", function() {
        $(".chart_layer").removeClass("on");
        document.getElementById('graph').style.display = 'none';
        document.getElementById('popup').style.display = 'none';
    });

    // $(document).on("click", ".chart_btn", function(){
    //     $(".chart_layer").addClass("on");
    //     document.getElementById('popup').style.display = 'block'; 
    //     document.getElementById('graph').style.display = 'none';
    // });
    
    // $(document).mouseup(function (e){
    //     $(".chart_layer .cont").each(function(){
    //         if($(this).has(e.target).length === 0){
    //             $(this).not().closest(".chart_layer").removeClass("on");
    //         }
    //     })
    //     document.getElementById('graph').style.display = 'none';
    // });    

    function openFullscreen() {
        $(".comm_btn.full").each(function(){
            $(this).on("click", function(){
                var elem = $(this).closest(".cont").find("iframe").get(0);
                if (elem.requestFullscreen) {
                    elem.requestFullscreen();
                } else if (elem.webkitRequestFullscreen) { /* Safari */
                    elem.webkitRequestFullscreen();
                } else if (elem.msRequestFullscreen) { /* IE11 */
                    elem.msRequestFullscreen();
                }
                return false;
            });
        });
    }
    openFullscreen();

//실험 전 현장
    var thumbSwiper01 = new Swiper(".thumbSwiper01", {
        slidesPerView : 3, 
        spaceBetween : 40,
        slidesPerGroup : 3,
        watchOverflow : true,
        navigation: {
            prevEl: ".thumbSwiper01 .swiper-button-prev",
            nextEl: ".thumbSwiper01 .swiper-button-next",
        },
        pagination: {
            el: '.thumbSwiper01 .swiper-pagination-num',
            type: 'fraction',
            formatFractionCurrent: function (number) {
                return ('0' + number).slice(-2);
            },
            formatFractionTotal: function (number) {
                return ('0' + number).slice(-2);
            },
            renderFraction: function (currentClass, totalClass) {
                return '<span class="' + currentClass + '"></span>' + '<span class="' + totalClass + '"></span>';
            },
        },
    });
    var thumbSwiper01Add = new Swiper(".thumbSwiper01", {
        slidesPerView : 3, 
        spaceBetween : 40,
        slidesPerGroup : 3,
        watchOverflow : true,
        pagination: {
            el: ".thumbSwiper01 .swiper-pagination",
            type: "progressbar",
        },
    });
    thumbSwiper01Add.controller.control = thumbSwiper01;
    thumbSwiper01.controller.control = thumbSwiper01Add;

//폭발
    var thumbSwiper02 = new Swiper(".thumbSwiper02", {
        slidesPerView : 3, 
        spaceBetween : 40,
        slidesPerGroup : 3,
        watchOverflow : true,
        navigation: {
            prevEl: ".thumbSwiper02 .swiper-button-prev",
            nextEl: ".thumbSwiper02 .swiper-button-next",
        },
        pagination: {
            el: '.thumbSwiper02 .swiper-pagination-num',
            type: 'fraction',
            formatFractionCurrent: function (number) {
                return ('0' + number).slice(-2);
            },
            formatFractionTotal: function (number) {
                return ('0' + number).slice(-2);
            },
            renderFraction: function (currentClass, totalClass) {
                return '<span class="' + currentClass + '"></span>' + '<span class="' + totalClass + '"></span>';
            },
        },
    });
    var thumbSwiper02Add = new Swiper(".thumbSwiper02", {
        slidesPerView : 3, 
        spaceBetween : 40,
        slidesPerGroup : 3,
        watchOverflow : true,
        pagination: {
            el: ".thumbSwiper02 .swiper-pagination",
            type: "progressbar",
        },
    });
    thumbSwiper02Add.controller.control = thumbSwiper02;
    thumbSwiper02.controller.control = thumbSwiper02Add;

//실험 후 현장
    var thumbSwiper03 = new Swiper(".thumbSwiper03", {
        slidesPerView : 3, 
        spaceBetween : 40,
        slidesPerGroup : 3,
        watchOverflow : true,
        navigation: {
            prevEl: ".thumbSwiper03 .swiper-button-prev",
            nextEl: ".thumbSwiper03 .swiper-button-next",
        },
        pagination: {
            el: '.thumbSwiper03 .swiper-pagination-num',
            type: 'fraction',
            formatFractionCurrent: function (number) {
                return ('0' + number).slice(-2);
            },
            formatFractionTotal: function (number) {
                return ('0' + number).slice(-2);
            },
            renderFraction: function (currentClass, totalClass) {
                return '<span class="' + currentClass + '"></span>' + '<span class="' + totalClass + '"></span>';
            },
        },
    });
    var thumbSwiper03Add = new Swiper(".thumbSwiper03", {
        slidesPerView : 3, 
        spaceBetween : 40,
        slidesPerGroup : 3,
        watchOverflow : true,
        pagination: {
            el: ".thumbSwiper03 .swiper-pagination",
            type: "progressbar",
        },
    });
    thumbSwiper03Add.controller.control = thumbSwiper03;
    thumbSwiper03.controller.control = thumbSwiper03Add;

//캠코더 영상
    var thumbSwiper04 = new Swiper(".thumbSwiper04", {
        slidesPerView : 3, 
        spaceBetween : 40,
        slidesPerGroup : 3,
        watchOverflow : true,
        navigation: {
            prevEl: ".thumbSwiper04 .swiper-button-prev",
            nextEl: ".thumbSwiper04 .swiper-button-next",
        },
        pagination: {
            el: '.thumbSwiper04 .swiper-pagination-num',
            type: 'fraction',
            formatFractionCurrent: function (number) {
                return ('0' + number).slice(-2);
            },
            formatFractionTotal: function (number) {
                return ('0' + number).slice(-2);
            },
            renderFraction: function (currentClass, totalClass) {
                return '<span class="' + currentClass + '"></span>' + '<span class="' + totalClass + '"></span>';
            },
        },
    });
    var thumbSwiper04Add = new Swiper(".thumbSwiper04", {
        slidesPerView : 3, 
        spaceBetween : 40,
        slidesPerGroup : 3,
        watchOverflow : true,
        pagination: {
            el: ".thumbSwiper04 .swiper-pagination",
            type: "progressbar",
        },
    });
    thumbSwiper04Add.controller.control = thumbSwiper04;
    thumbSwiper04.controller.control = thumbSwiper04Add;

//초고속 캠코더 영상
    var thumbSwiper05 = new Swiper(".thumbSwiper05", {
        slidesPerView : 3, 
        spaceBetween : 40,
        slidesPerGroup : 3,
        watchOverflow : true,
        navigation: {
            prevEl: ".thumbSwiper05 .swiper-button-prev",
            nextEl: ".thumbSwiper05 .swiper-button-next",
        },
        pagination: {
            el: '.thumbSwiper05 .swiper-pagination-num',
            type: 'fraction',
            formatFractionCurrent: function (number) {
                return ('0' + number).slice(-2);
            },
            formatFractionTotal: function (number) {
                return ('0' + number).slice(-2);
            },
            renderFraction: function (currentClass, totalClass) {
                return '<span class="' + currentClass + '"></span>' + '<span class="' + totalClass + '"></span>';
            },
        },
    });
    var thumbSwiper05Add = new Swiper(".thumbSwiper05", {
        slidesPerView : 3, 
        spaceBetween : 40,
        slidesPerGroup : 3,
        watchOverflow : true,
        pagination: {
            el: ".thumbSwiper05 .swiper-pagination",
            type: "progressbar",
        },
    });
    thumbSwiper05Add.controller.control = thumbSwiper05;
    thumbSwiper05.controller.control = thumbSwiper05Add;

//Go Pro (KGS)
    var thumbSwiper06 = new Swiper(".thumbSwiper06", {
        slidesPerView : 3, 
        spaceBetween : 40,
        slidesPerGroup : 3,
        watchOverflow : true,
        navigation: {
            prevEl: ".thumbSwiper06 .swiper-button-prev",
            nextEl: ".thumbSwiper06 .swiper-button-next",
        },
        pagination: {
            el: '.thumbSwiper06 .swiper-pagination-num',
            type: 'fraction',
            formatFractionCurrent: function (number) {
                return ('0' + number).slice(-2);
            },
            formatFractionTotal: function (number) {
                return ('0' + number).slice(-2);
            },
            renderFraction: function (currentClass, totalClass) {
                return '<span class="' + currentClass + '"></span>' + '<span class="' + totalClass + '"></span>';
            },
        },
    });
    var thumbSwiper06Add = new Swiper(".thumbSwiper06", {
        slidesPerView : 3, 
        spaceBetween : 40,
        slidesPerGroup : 3,
        watchOverflow : true,
        pagination: {
            el: ".thumbSwiper06 .swiper-pagination",
            type: "progressbar",
        },
    });
    thumbSwiper06Add.controller.control = thumbSwiper06;
    thumbSwiper06.controller.control = thumbSwiper06Add;

//드론영상
    var thumbSwiper07 = new Swiper(".thumbSwiper07", {
        slidesPerView : 3, 
        spaceBetween : 40,
        slidesPerGroup : 3,
        watchOverflow : true,
        navigation: {
            prevEl: ".thumbSwiper07 .swiper-button-prev",
            nextEl: ".thumbSwiper07 .swiper-button-next",
        },
        pagination: {
            el: '.thumbSwiper07 .swiper-pagination-num',
            type: 'fraction',
            formatFractionCurrent: function (number) {
                return ('0' + number).slice(-2);
            },
            formatFractionTotal: function (number) {
                return ('0' + number).slice(-2);
            },
            renderFraction: function (currentClass, totalClass) {
                return '<span class="' + currentClass + '"></span>' + '<span class="' + totalClass + '"></span>';
            },
        },
    });
    var thumbSwiper07Add = new Swiper(".thumbSwiper07", {
        slidesPerView : 3, 
        spaceBetween : 40,
        slidesPerGroup : 3,
        watchOverflow : true,
        pagination: {
            el: ".thumbSwiper07 .swiper-pagination",
            type: "progressbar",
        },
    });
    thumbSwiper07Add.controller.control = thumbSwiper07;
    thumbSwiper07.controller.control = thumbSwiper07Add;

//레이어
    $(".thumbSwiper .swiper-slide:has(img)").on("click", function(){
        var thisSrc = $(this).find("img").attr("src");
        var thisLabel = $(this).attr("aria-label");
        $(".thumb_layer img").attr("src", thisSrc);
        $(".thumb_layer .paging").text(thisLabel);
        $(".thumb_layer").addClass("on");
    });
    $(".thumb_layer .layer_arw.next").on("click", function(){
        var nowSrc = $(".thumb_layer .thumb img").attr("src");
        var nextSrc = $(".thumbSwiper").find("img[src='" + nowSrc + "'").closest(".swiper-slide").next().find("img").attr("src");
        var nextLabel = $(".thumbSwiper").find("img[src='" + nowSrc + "'").closest(".swiper-slide").next().attr("aria-label");
        $(".thumb_layer img").attr("src", nextSrc);
        $(".thumb_layer .paging").text(nextLabel);
    });
    $(".thumb_layer .layer_arw.prev").on("click", function(){
        var nowSrc = $(".thumb_layer .thumb img").attr("src");
        var prevSrc = $(".thumbSwiper").find("img[src='" + nowSrc + "'").closest(".swiper-slide").prev().find("img").attr("src");
        var prevLabel = $(".thumbSwiper").find("img[src='" + nowSrc + "'").closest(".swiper-slide").prev().attr("aria-label");
        $(".thumb_layer img").attr("src", prevSrc);
        $(".thumb_layer .paging").text(prevLabel);
    });
    $(".thumb_layer .layer_arw.close").on("click", function() {
        $(".thumb_layer").removeClass("on"); // 'on' 클래스를 제거하여 레이어 닫기
    });
    // $(document).mouseup(function (e){
    //     $(".thumb_layer .cont").each(function(){
    //         if($(this).has(e.target).length === 0){
    //             $(this).not().closest(".thumb_layer").removeClass("on");
    //         }
    //     })
    // });

//데이터 체크박스
$(".data_table thead th:first-child input[type='checkbox']").on("change", function(){
    if($(this).is(":checked")){
        $(this).closest("table").find("input[type='checkbox']:not([disabled])").prop("checked", true);
    } else {
        $(this).closest("table").find("input[type='checkbox']:not([disabled])").prop("checked", false);
    }
});
$(".data_table thead th:not(:first-child) input[type='checkbox']").on("change", function(){
    if($(this).is(":checked")){
        $(this).closest("table").find("tbody tr td:nth-child(" + parseInt($(this).closest("th").index() + 1) + ") input[type='checkbox']:not([disabled])").prop("checked", true);
    } else {
        $(this).closest("table").find("tbody tr td:nth-child(" + parseInt($(this).closest("th").index() + 1) + ") input[type='checkbox']:not([disabled])").prop("checked", false);
    }
    $(".data_table tbody td input[type='checkbox']").trigger("change");
});
$(".data_table tbody th input[type='checkbox']").on("change", function(){
    if($(this).is(":checked")){
        $(this).closest("th").siblings().find("input[type='checkbox']:not([disabled])").prop("checked", true);
    } else {
        $(this).closest("th").siblings().find("input[type='checkbox']:not([disabled])").prop("checked", false);
    }
    $(".data_table tbody td input[type='checkbox']").trigger("change");
});
$(".data_table tbody td input[type='checkbox']").on("change", function(){
    var boxLength = $(this).closest("tbody").find("td input[type='checkbox']:not([disabled])").length;
    var chkLength = $(this).closest("tbody").find("td input[type='checkbox']:checked:not([disabled])").length;
    var trBoxLength = $(this).closest("tr").find("td input[type='checkbox']:not([disabled])").length;
    var trChkLength = $(this).closest("tr").find("td input[type='checkbox']:checked:not([disabled])").length;
    var verBoxLength = $(this).closest("tbody").find("tr:has(td:nth-child(" + parseInt($(this).closest("td").index() + 1) +") input[type='checkbox'])").length;
    var verChkLength = $(this).closest("tbody").find("tr:has(td:nth-child(" + parseInt($(this).closest("td").index() + 1) +") input[type='checkbox']:checked)").length;
    if(boxLength == chkLength){
        $(this).closest("table").find("thead th:first-child input[type='checkbox']").prop("checked", true);
    } else {
        $(this).closest("table").find("thead th:first-child input[type='checkbox']").prop("checked", false);
    }
    if(trBoxLength == trChkLength){
        $(this).closest("tr").find("th input[type='checkbox']:not([disabled])").prop("checked", true);
    } else {
        $(this).closest("tr").find("th input[type='checkbox']:not([disabled])").prop("checked", false);
    }
    if(verBoxLength == verChkLength){
        $(this).closest("table").find("thead").find("th").eq($(this).closest("td").index()).find("input[type='checkbox']:not([disabled])").prop("checked", true);
    } else {
        $(this).closest("table").find("thead").find("th").eq($(this).closest("td").index()).find("input[type='checkbox']:not([disabled])").prop("checked", false);
    }
});

$(".data_btn .clear").on("click", function(){
    $(this).siblings("input[type='text']").val("");
    return false;
});
});
