/**
 * Created by ts on 7/13/16.
 */
var events = require("events");
var emitter = new events.EventEmitter();
exports.onmessage = function (e) {
    emitter.emit(e.type, e);
};

var lastSize = false;
emitter.addListener("selfStart", function (e) {
    var size = e.getContext().getWindow().localStorage.getItem("pluginLastSize_lastSize");
    if (size !== null) {
        lastSize = JSON.parse(size);
    }
});

emitter.addListener("beforeMaximize", function (e) {
    setTimeout(function () {
        if (lastSize) {
            var nw_win = e.getContext().getNWWindow();
            nw_win.width = lastSize.width;
            nw_win.height = lastSize.height;
            nw_win.x = lastSize.x;
            nw_win.y = lastSize.y;
            lastSize = false;
        }
    }, 0);
});

emitter.addListener("beforeClose", function (e) {
    var nw_win = e.getContext().getNWWindow();
    e.getContext().getWindow().localStorage.setItem("pluginLastSize_lastSize", JSON.stringify({
        width: nw_win.width,
        height: nw_win.height,
        x: nw_win.x,
        y: nw_win.y
    }));
});

emitter.addListener("pluginMgrOption", function (e) {
    e.window.alert("Here is NOTHING");
});

emitter.addListener("pluginMgrInfo", function (e) {
    e.setReturnValue("LastSize remembers the last window size and restore it when opening new window. ");
});