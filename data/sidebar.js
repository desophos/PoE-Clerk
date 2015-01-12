/*
    Copyright (C) 2015  Daniel Horowitz

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along
    with this program; if not, write to the Free Software Foundation, Inc.,
    51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
*/

'use strict';

if (typeof PoeClerk == "undefined") {
    var PoeClerk = {};
}

PoeClerk.sidebar = function () {
    var $jq = jQuery.noConflict();

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
        $jq('#items-table').html('');

        for (var i = 0; i < cart.length; i++) {
            (function (i) {
                $jq('#items-table').append(makeItemRow(cart[i]));

                var item_tr = $jq(
                    'tr[data-hash="'
                    + cart[i].data_hash
                    + '"][thread="'
                    + cart[i].thread
                    + '"][league="'
                    + cart[i].league
                    + '"]'
                );

                $jq(item_tr).find('.view-item span').off('click').on('click', function() {
                    addon.port.emit(
                        'viewItem',
                        {
                            'league':    item_tr.attr('league'),
                            'data_hash': item_tr.attr('data-hash'),
                            'thread':    item_tr.attr('thread'),
                        }
                    );
                });

                $jq(item_tr).find('.remove-item span').off('click').on('click', function() {
                    $jq(item_tr).next('tr.spacer').remove();
                    item_tr.remove();
                    addon.port.emit('removeItem', cart[i]);
                });
            })(i);
        }
    });
}();
