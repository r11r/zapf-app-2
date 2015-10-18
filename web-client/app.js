$(document).ready(function(){
    
    // Seite so schnell wie möglich befüllen
    if (localStorage.zapfAppData) refreshHTML();
    
    // und dann aktualisieren
    if (navigator.onLine) refreshData();
    else setStatus(setStatus.OFFLINE);

    // refresh button aktivieren
    $("#status").click(function(){
        if ($("#status").prop("disabled")) return;
        refreshData();    
    });

    // neuladen, wenn Internetverbindung neu hergestellt wird
    window.addEventListener("online", function(){
        // ändert selber den status ...
        refreshData();
    });

    // refresh button deaktivieren, wenn die seite offline ist
    window.addEventListener("offline", function(){
        setStatus(setStatus.OFFLINE);
    });
});


function setStatus(stat, msg) {
    if (stat == 0) {
        $("#status")
            .prop("disabled", false)
            .html("&#8635;");
    } else if (stat == 1) {
        $("#status")
            .prop("disabled", true)
            .text("offline");
    } else if (stat == 2) {
        $("#status")
            .prop("disabled", true)
            .text(".. lade ..");
    } else {
        $("#status")
            .prop("disabled", true)
            .text("Fehler");
        alert(msg);
    }
}
setStatus.ONLINE = 0;
setStatus.OFFLINE = 1;
setStatus.LOADING = 2;
setStatus.FAILURE = 3;


function refreshData(){
    setStatus(setStatus.LOADING);
    return $.ajax({
        url: "database.json",
        cache: false,
        dataType: "text",
        success: function(data){
            localStorage.zapfAppData = data;
            refreshHTML();
            setStatus(setStatus.ONLINE);
        },
        error: function(jqXHR, msg){
            setStatus(setStatus.FAILURE, msg);
        }
    });
}


function refreshHTML(){

    // daten auslesen
    var data;
    try {
        data = $.parseJSON(localStorage.zapfAppData);
    } catch (ex) {
        alert("Corrupted localStorage Data");
        return;
    }
    

    // html leeren
    $("#main").empty();

    // hilfsvariablen zur bestimmung des aktuellen/nächsten ak-slots
    var now = (new Date()).getTime();
    var current = Number.POSITIVE_INFINITY;
    var $current = null;

    $.each(data.slots, function(i, slot){

        // create Slot
        var $slot = $("<section />")
            .appendTo("#main")
            .append($("<h3/>").text(slot.name))
            .append("<p class='time'>"+formatTime(slot.begin,slot.end)+"</p>");

        // current?
        if( Date.parse(slot.end) > now && Date.parse(slot.end) < current ){
            current = Date.parse(slot.end);
            $current = $slot;
        }

        // fill AK-Slot
        if (slot.type === "ak") {
            var $akList = $("<ul/>")
                .appendTo($slot);
            $.each(slot.aks, function(i, ak){
                var $ak = $("<li />")
                    .appendTo($akList)
                    .text(ak.name)
                    .append("<span class='info' />");
                if (ak.responsible != "") 
                    $ak.find(".info")
                        .append(" von ")
                        .append($("<span class='responsible' />").text(ak.responsible));
                if (ak.room != "")
                    $ak.find(".info")
                        .append(" in ")
                        .append($("<span class='room' />").text(ak.room));
                if (ak.url != "")
                    $ak.append(
                        $("<span class='overlay'>")
                            .append($("<a>[Wiki]</a>").attr("href", ak.url))
                    );
            });
        }
    });

    if( $current )  $current.addClass("current");
}


function formatTime(begin, end) {
    var weekdays = new Array(7);
    weekdays[0] = "So";
    weekdays[1] = "Mo";
    weekdays[2] = "Di";
    weekdays[3] = "Mi";
    weekdays[4] = "Do";
    weekdays[5] = "Fr";
    weekdays[6] = "Sa";
    var b = new Date(begin);
    var e = new Date(end);
    return weekdays[b.getDay()] + " "
        + b.getHours() + ":" + ("0" + b.getMinutes()).slice(-2)
        + " - "
        + e.getHours() + ":" + ("0" + e.getMinutes()).slice(-2);
}

