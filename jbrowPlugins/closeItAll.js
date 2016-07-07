/**
 * Created by ts on 7/7/16.
 */
var events = require("events");
var emitter = new events.EventEmitter();
exports.onmessage = function (e) {
    emitter.emit(e.type, e);
};

emitter.addListener("URLChange", function (e) {
    e.target.contentWindow.close = function () {
        try {
            var con = e.getContext();
            var tab = con.getTabById(con.getPageId(e.target));
            tab.dispatchEvent(new MouseEvent("dblclick", {
                bubbles: true,
                cancelable: true,
                view: con.getWindow()
            }));
        } catch (err) {
        }
    }
});

emitter.addListener("pluginMgrOption", function (e) {
    e.window.alert("Here is NOTHING");
});

emitter.addListener("pluginMgrInfo", function (e) {
    e.setReturnValue("CloseItAll fixes the bug that web pages are unable to close themselves by \"window.close()\". ");
});