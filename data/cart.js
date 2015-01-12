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

PoeClerk.cart = function () {
    var $jq = jQuery.noConflict();
    var itemContainerSelector = 'tbody[id^="item-container"]';

    function itemToJson(itemContainer, league) {
        return {
            'name': $jq.trim($jq(itemContainer).find('.item-cell a.title').text()),
            'data_hash': $jq(itemContainer).find('span.requirements span.click-button').attr('data-hash'),
            'thread': $jq(itemContainer).find('span.requirements span.click-button').attr('data-thread'),
            'league': league,
            //"search_url": window.location.href,
        };
    }

    // save league at first so we get the one they actually searched in,
    // in case they change it afterward
    var league = $jq('form#search select.league').siblings().find('a.chosen-single span').text();

    // append add button to each item
    for (var i = 0; i < $jq(itemContainerSelector).length; i++) {
        $jq('tbody#item-container-' + i.toString())
        .find('span.requirements')
        .append(' · <span class="click-button add-to-cart">Add to Cart</span>');
    };

    // emit add signal on button click
    $jq('.add-to-cart').click(function() {
        // store item data
        self.port.emit('addItem', itemToJson($jq(this).closest(itemContainerSelector), league));

        // refresh cart
        self.port.emit('refreshCart');

        $jq(this).html('Item added to cart!');
        $jq(this).fadeOut(2000);
    });

    self.port.on('addedDuplicateToCart', function(item) {
        alert('This item is already in your cart.');
    });
}();
