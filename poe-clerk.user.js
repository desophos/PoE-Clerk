// ==UserScript==
// @name         PoE Clerk
// @namespace    http://github.com/desophos
// @description  Makes shopping easy at your friendly neighborhood poe.trade!
// @version      0.2.0
// @include      http://poe.trade/search/*
// @require      https://code.jquery.com/jquery-2.1.3.min.js
// @resource     sidebarCSS    poe-clerk.css
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_openInTab
// @noframes
// ==/UserScript==

'use strict';

function itemsEqual (item1, item2) {
    return item1.name === item2.name
        && item1.data_hash === item2.data_hash
        && item1.thread === item2.thread
        && item1.league === item2.league;
}

function itemToJson(itemContainer, league) {
    return {
        'name': $.trim($(itemContainer).find('.item-cell a.title').text()),
        'data_hash': $(itemContainer).find('span.requirements span.click-button').attr('data-hash'),
        'thread': $(itemContainer).find('span.requirements span.click-button').attr('data-thread'),
        // exclude implicit mod
        'mods': $(itemContainer).find('ul.mods:not(.withline) li').map(function () {
            return $(this).html();
        }),
        'league': league,
        //"search_url": window.location.href,
    };
}

function viewItem (item) {
    GM_openInTab(
        'http://poe.trade/search?league='
        + item.league
        + '&S='
        + item.data_hash
        + '&thread='
        + item.thread
    );
}

function addToCart (item) {
    if (loadCart().some(function (i) {
        return itemsEqual(i, item);
    })) {
        addedDuplicateToCart(item);
    } else {
        saveItem(item);
    }
}

function addAddToCart() {
    // append add button to each item
    for (var i = 0; i < $(itemContainerSelector).length; i++) {
        $('tbody#item-container-' + i.toString())
        .find('span.requirements')
        .append(' · <span class="click-button add-to-cart">Add to Cart</span>');
    };

    // emit add signal on button click
    $('.add-to-cart').click(function () {
        // store item data
        addToCart(itemToJson($(this).closest(itemContainerSelector), league));

        $(this).html('Item added to cart!');
        $(this).fadeOut(2000);
    });
}

function addedDuplicateToCart (item) {
    alert('This item is already in your cart.');
}

function makeItemRow(item) {
    var mods_div = '<div class="toggle"><ul class="mods">';
    for (var i = 0; i < item.mods.length; i++) {
        mods_div += '<li class="mod">' + item.mods[i] + '</li>';
    }
    mods_div += '</ul></div>';
    return '<tr class="item-row" '
        + 'data-hash="'
        + item.data_hash
        + '" thread="'
        + item.thread
        + '" league="'
        + item.league
        //+ '" search-url="'
        //+ item.search_url
        + '">'
        + '<td class="expander"><button>+</button></td>'
        + '<td class="item-name">'
        + item.name
        + '</td>'
        + '<td class="view-item"><button>view</button></td>'
        + '<td class="remove-item"><button>x</button></td>'
        + '</tr>'
        + '<tr class="mods-row"><td colspan="4">'
        + mods_div
        + '</td></tr>'
        + '<tr class="spacer-row"><td colspan="4"></td></tr>';
}

function refreshCart () {
    var cart = loadCart();
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

            $(item_tr).find('.expander button').off('click').on('click', function () {
                $(item_tr).next().find('.toggle').first().slideToggle(function () {
                    var expander = $(item_tr.find('.expander button'));
                    if ($(expander).html() === '+') {
                        $(expander).html('&ndash;');
                    } else {
                        $(expander).html('+');
                    }
                });
            });

            $(item_tr).find('.view-item button').off('click').on('click', function () {
                viewItem({
                        'league':    item_tr.attr('league'),
                        'data_hash': item_tr.attr('data-hash'),
                        'thread':    item_tr.attr('thread'),
                });
            });

            $(item_tr).find('.remove-item button').off('click').on('click', function () {
                $(item_tr).next('.mods').remove();
                $(item_tr).next('.spacer').remove();
                item_tr.remove();
                removeItem(cart[i]);
            });
        })(i);
    }

    //$('button').button();

    /*
    $('#items-table tbody').accordion({
        collapsible: true,
        header: '.item-row',
        heightStyle: 'content',
    });
    */
}

function removeItem (item) {
    saveCart(loadCart().filter(function (i) {
        return !(itemsEqual(item, i));
    }));
    refreshCart();
}

function saveItem (item) {
    var cart = loadCart();
    cart.push(item);
    saveCart(cart);
    refreshCart();
}

function loadCart () {
    return JSON.parse(GM_getValue('cart', '[]'));
}

function saveCart (cart) {
    GM_setValue('cart', JSON.stringify(cart));
}

function showSidebar () {
    $('body').append (''
        + '<div id="poe-clerk">'
        + '<table id="items-table">'
        + '</table></div>'
    );
/*
    $('#poe-clerk').resizable({
        handles: 'w',
        minWidth: 200,
        maxWidth: 500,
    })
*/
    refreshCart();
}

// wait until onLoad; earlier, league and .loader aren't there :/
$(window).load(function () {
    // save league at first so we get the one they actually searched in,
    // in case they change it afterward
    league = $('form#search select.league').siblings().find('a.chosen-single span').text();

    // add buttons on initial pageload
    addAddToCart();

    // add buttons on ajax item sort
    new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if ($(mutation.target).html() === '') {
                // done loading, so add buttons
                addAddToCart();
            }
        });
    }).observe($('.loader').get(0), {childList: true});

    showSidebar();
});

/*
// inject jQuery UI CSS
$("head").append (
    '<link ' +
    'href="https://code.jquery.com/ui/1.11.2/themes/ui-darkness/jquery-ui.css" ' +
    'rel="stylesheet" type="text/css">'
);
*/
GM_addStyle(GM_getResourceText('sidebarCSS'));

var itemContainerSelector = 'tbody[id^="item-container"]';
var league = ''; // initialized onLoad

/*
// wipe storage on install, enable, upgrade, or downgrade
// in case of object structure changes
exports.main = function (options) {
    var storage = require('sdk/simple-storage').storage;
    if (['install', 'enable', 'upgrade', 'downgrade'].indexOf(options.loadReason) !== -1) {
        for (var prop in storage) {
            delete storage[prop];
        }
    }
}
*/
