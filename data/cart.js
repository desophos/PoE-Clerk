'use strict';

var itemContainerSelector = 'tbody[id^="item-container"]';

function itemToJson(itemContainer, league) {
    return {
        'name': $.trim($(itemContainer).find('.item-cell a.title').text()),
        'data_hash': $(itemContainer).find('span.requirements span.click-button').attr('data-hash'),
        'thread': $(itemContainer).find('span.requirements span.click-button').attr('data-thread'),
        'league': league,
        //"search_url": window.location.href,
    };
}

// save league at first so we get the one they actually searched in,
// in case they change it afterward
var league = $('form#search select.league').siblings().find('a.chosen-single span').text();

// append add button to each item
for (var i = 0; i < $(itemContainerSelector).length; i++) {
    $('tbody#item-container-' + i.toString())
    .find('span.requirements')
    .append(' · <span class="click-button add-to-cart">Add to Cart</span>');
};

// emit add signal on button click
$('.add-to-cart').click(function() {
    // store item data
    self.port.emit('addItem', itemToJson($(this).closest(itemContainerSelector), league));

    // refresh cart
    self.port.emit('refreshCart');

    $(this).html('Item added to cart!');
    $(this).fadeOut(2000);
});

self.port.on('addedDuplicateToCart', function(item) {
    alert('This item is already in your cart.');
});
