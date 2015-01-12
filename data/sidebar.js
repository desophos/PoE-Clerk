'use strict';

function makeItemRow(item) {
    return '<tr class="item-row" data-hash="'
        + item.data_hash
        + '" thread="'
        + item.thread
        + '" league="'
        + item.league
        //+ '" search-url="'
        //+ item.search_url
        + '">'
        + '<td class="item-name">'
        + item.name
        + '</td>'
        + '<td class="view-item"><span class="button">view</span></td>'
        + '<td class="remove-item"><span class="button">x</span></td>'
        + '</tr>'
        + '<tr class="spacer"><td></td></tr>';
}

addon.port.on("refreshCart", function(cart) {
    $('#items-table').html('');

    for (var i = 0; i < cart.length; i++) {
        (function (i) {
            $('#items-table').append(makeItemRow(cart[i]));

            var item_tr = $(
                'tr[data-hash="'
                + cart[i].data_hash
                + '"][thread="'
                + cart[i].thread
                + '"][league="'
                + cart[i].league
                + '"]'
            );

            $(item_tr).find('.view-item span').off('click').on('click', function() {
                addon.port.emit(
                    'viewItem',
                    {
                        'league':    item_tr.attr('league'),
                        'data_hash': item_tr.attr('data-hash'),
                        'thread':    item_tr.attr('thread'),
                    }
                );
            });

            $(item_tr).find('.remove-item span').off('click').on('click', function() {
                $(item_tr).next('tr.spacer').remove();
                item_tr.remove();
                addon.port.emit('removeItem', cart[i]);
            });
        })(i);
    }
});
