/**
 * Created by ts on 7/9/16.
 */
var events = require("events");
var emitter = new events.EventEmitter();
exports.onmessage = function (e) {
    emitter.emit(e.type, e);
};

emitter.addListener("navigation", doit);
emitter.addListener("createPage", doit);

var history = [];
function doit(e) {
    history.push({
        time: +new Date(),
        url: e.url
    });
}

var flushDataList;
emitter.addListener("selfStart", function (e) {
    var ls = e.getContext().getWindow().localStorage;
    var doc = e.getContext().getDocument();
    var store = ls.getItem("pluginHistory_history");
    if (store !== null) {
        store = JSON.parse(store);
        history = store.list;
        if (!history instanceof Array)history = [];
    }
    flushDataList = function () {
        var dl = doc.createElement("datalist");
        dl.id = "pluginHistory-urlDataList";
        var list = [];
        history.forEach(function (o) {
            var url = o.url;
            var pos = url.indexOf("?");
            if (pos == -1) pos = url.length;
            url = url.substr(0, pos);
            pos = url.indexOf("://");
            if (pos != -1) {
                url = url.substr(pos + 3);
            }
            pos = list.indexOf(url);
            if (pos != -1) {
                list.splice(pos, 1);
            }
            list.push(url);
        });
        list.reverse();
        list.forEach(function (u) {
            dl.innerHTML += '<option value="' + u.replace(/"/g, "&quot;") + '">';
        });
        var old_dl = doc.getElementById("pluginHistory-urlDataList");
        if (old_dl) old_dl.remove();
        doc.body.appendChild(dl);
    };
    Object.defineProperty(history, "push", {
        configurable: true,
        enumerable: false,
        writable: true,
        value: function () {
            Array.prototype.push.apply(this, arguments);
            setTimeout(flushDataList, 0);
        }
    });
});

emitter.addListener("beforeClose", function (e) {
    var ls = e.getContext().getWindow().localStorage;
    ls.setItem("pluginHistory_history", JSON.stringify({list: history}));
});

emitter.addListener("ready", function (e) {
    var con = e.getContext();
    var doc = con.getDocument();
    flushDataList();
    doc.getElementById("url").setAttribute("list", "pluginHistory-urlDataList");
    doc.getElementById("url").parentNode.addEventListener("submit", function () {
        history.push({
            time: +new Date(),
            url: con.getContentById(con.getFocusedPageId()).src
        });
    });
});

emitter.addListener("pluginMgrOption", function (e) {
    if (e.window.confirm("Would you really like to clean all history? \n\n你真的要删除所有历史记录吗？")) {
        history.splice(0);
        e.window.alert("Succeed 成功");
    }
});

emitter.addListener("pluginMgrInfo", function (e) {
    e.setReturnValue("History provides you with URL prediction from history when typing URL in URL bar. (But it doesn't support display of history) ");
});

emitter.addListener("pluginHistoryViewGetHistory", function (e) {
    e.stopSpread();
    e.setReturnValue(history);
});