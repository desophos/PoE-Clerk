"use strict";

function makeItemRow(item) {
    return '<tr class="item-row" data-hash="'
        + item.data_hash
        + '" thread="'
        + item.thread
        + '" league="'
        + item.league
        //+ '" search-url="'
        //+ item.search_url
        + '"><td class="item-name">'
        + item.name
        + '</td>'
        + '<td class="view-item">View</td>'
        + '<td class="remove-item">X</td>'
        + '</tr>';
}

addon.port.on("addToCart", function(item) {
    //console.log(item);
    //console.log(makeItemRow(item));
    var newRow = makeItemRow(item)
    $("#items-table").append(newRow);
    $(".view-item").off("click").on("click", function() {
        addon.port.emit(
            "viewItem",
            {
                "league":    $(this).parent().attr("league"),
                "data_hash": $(this).parent().attr("data-hash"),
                "thread":    $(this).parent().attr("thread"),
            }
        );
    });
    $(".remove-item").off("click").on("click", function() {
        $(this).parent().remove();
    });
});
