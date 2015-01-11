"use strict";

function makeItemRow(item) {
    return '<tr class="item-row" data-hash="'
        + item.data_hash
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
    $("#items-table").append(makeItemRow(item));
    $(".view-item").click(function() {
        addon.port.emit(
            "viewItem",
            {
                "league":    $(this).parent().attr("league"),
                "data_hash": $(this).parent().attr("data-hash"),
            }
        );
    });
    $(".remove-item").click(function() {
        $(this).parent().remove();
    });
});
