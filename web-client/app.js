$(document).ready(function(){
    loadSlots();
});


function loadSlots(){

    return $.ajax({
        url: "database.json",
        cache: false,
        dataType: "json",
        success: function(data){

            $("#main").empty();
            $.each(data.slots, function(i, slot){

                // create Slot
                var $slot = $("<section />")
                    .appendTo("#main")
                    .append("<h3>"+slot.name+"</h3>")
                    .append("<p class='time'>"+formatTime(slot.begin,slot.end)+"</p>");

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
                    });
                }

            });
        }
    });
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

