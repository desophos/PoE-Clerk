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

var ss = require('sdk/simple-storage');
var tabs = require('sdk/tabs');
var sidebarWorkers = [];

if (!ss.storage.cart) {
    ss.storage.cart = [];
}

function itemsEqual(item1, item2) {
    return item1.name === item2.name
        && item1.data_hash === item2.data_hash
        && item1.thread === item2.thread
        && item1.league === item2.league;
}

function detachWorker(worker, workerArray) {
    var index = workerArray.indexOf(worker);
    if (index > -1) {
        workerArray.splice(index, 1);
    }
}

var sidebar = require('sdk/ui/sidebar').Sidebar({
    id: 'sidebar',
    title: 'My Shopping Cart',
    url: './sidebar.html',
    onReady: function (worker) {
        sidebarWorkers.push(worker);

        worker.on('detach', function () {
            detachWorker(this, sidebarWorkers);
        });

        worker.port.on('viewItem', function (item) {
            tabs.open(
                'http://poe.trade/search?league='
                + item.league
                + '&S='
                + item.data_hash
                + '&thread='
                + item.thread
            );
        });

        worker.port.on('removeItem', function (item) {
            ss.storage.cart = ss.storage.cart.filter(function (i) {
                return !(itemsEqual(item, i));
            });
        });

        // populate sidebar with stored data
        worker.port.emit('refreshCart', ss.storage.cart);
    }
});

require('sdk/page-mod').PageMod({
    include: '*.poe.trade',
    contentScriptFile: ['./jquery-2.1.3.js', './cart.js'],
    contentScriptWhen: 'end', // wait for search form to load :/
    attachTo: 'top', // avoid reloading for frames
    onAttach: function (worker) {

        worker.port.on('addItem', function (item) {
            if (ss.storage.cart.some(function (i) {
                return itemsEqual(i, item);
            })) {
                worker.port.emit('addedDuplicateToCart', item);
            } else {
                ss.storage.cart.push(item);
            }
        });

        worker.port.on('refreshCart', function () {
            sidebar.show();
            sidebarWorkers.forEach(function (w) {
                w.port.emit('refreshCart', ss.storage.cart);
            });
        });
    }
});
