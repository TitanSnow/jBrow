/**
 * Created by ts on 7/12/16.
 */
var events = require("events");
var emitter = new events.EventEmitter();
exports.onmessage = function (e) {
    emitter.emit(e.type, e);
};

emitter.addListener("aboutPagesHit", function (e) {
    if (e.page_name == "history") {
        var win = e.target.contentWindow;
        var doc = win.document;
        var con = e.getContext();
        var history = con.sendMessageToAllPlugins({type: "pluginHistoryViewGetHistory"});
        if (history instanceof Array) {
            history = history.slice(0);
            history.reverse();
            var ul = doc.createElement("ul");
            history.forEach(function (o) {
                var li = doc.createElement("li");
                li.textContent = new Date(Number(o.time)).toLocaleString();
                var a = doc.createElement("a");
                a.href = o.url;
                a.textContent = o.url;
                li.appendChild(a);
                ul.appendChild(li);
            });
            doc.body.appendChild(ul);
        }
    }
});

emitter.addListener("pluginMgrOption", function (e) {
    e.window.location = "about:history";
});

emitter.addListener("pluginMgrInfo", function (e) {
    e.setReturnValue("HistoryView can show you history list. ");
});