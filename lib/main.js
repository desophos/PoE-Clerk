"use strict";

var tabs = require("sdk/tabs");
var pageMod = require("sdk/page-mod");
var sidebarWorkers = [];

function detachWorker(worker, workerArray) {
    var index = workerArray.indexOf(worker);
    if (index != -1) {
        workerArray.splice(index, 1);
    }
}

var sidebar = require("sdk/ui/sidebar").Sidebar({
    id: 'sidebar',
    title: 'Cart',
    url: "./sidebar.html",
    onAttach: function(worker) {
        sidebarWorkers.push(worker);
        worker.on('detach', function () {
            detachWorker(this, sidebarWorkers);
        });
        worker.port.on('viewItem', function(item) {
            console.log(item);
            tabs.open(
                'http://poe.trade/search?league='
                + item.league
                + '&S='
                + item.data_hash
            );
        });
    }
});

pageMod.PageMod({
    include: "*.poe.trade",
    contentScriptFile: ["./jquery-2.1.3.js", "./cart.js"],
    contentScriptWhen: "end",
    attachTo: "top",
    onAttach: function(worker) {
        worker.port.on('addToCart', function(item) {
            sidebar.show();
            sidebarWorkers.forEach(w => {
                w.port.emit('addToCart', item);
            })
        });
    },
});
