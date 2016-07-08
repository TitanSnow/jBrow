/**
 * Created by ts on 7/7/16.
 */
var events = require("events");
var emitter = new events.EventEmitter();
exports.onmessage = function (e) {
    emitter.emit(e.type, e);
};

emitter.addListener("aboutPagesHit", function (e) {
    function getQueryStringByName(qs, name) {
        var result = qs.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));
        if (result == null || result.length < 1) {
            return "";
        }
        return result[1];
    }
    
    if (!/^search\?/.test(e.page_name)) return;
    e.stopSpread();
    e.setReturnValue(false);
    var ls = e.getContext().getWindow().localStorage;
    if (ls.getItem("pluginSearch_searchEngine") === null) {
        ls.setItem("pluginSearch_searchEngine", "https://www.bing.com/search?q=${keyword}");
    }
    var srcTemp = ls.getItem("pluginSearch_searchEngine");
    var keyword = getQueryStringByName(e.target.contentWindow.location.search, "q");
    e.target.src = Function("keyword", `return \`${srcTemp.replace(/`/g, "\\`")}\``)(keyword);
});

emitter.addListener("pluginMgrOption", function (e) {
    var old_url = e.getContext().getWindow().localStorage.getItem("pluginSearch_searchEngine");
    var new_url = e.window.prompt("Current search engine is " + old_url + "\n\nPlease write down the URL of new search engine here\n\n\n当前的搜索引擎是：" + old_url + "\n\n请在这里写下新搜索引擎的网址");
    if (typeof new_url == "string") {
        var doc = e.window.document;
        var u = doc.createElement("input");
        u.type = "url";
        u.value = new_url;
        if (!u.checkValidity()) {
            var _new_url = "http://" + new_url;
            u.value = _new_url;
            if (u.checkValidity() && /^\S+?\.\S+$/.test(new_url)) {
                new_url = _new_url;
            } else {
                e.window.alert("Incorrect URL! \n\n非法的网址！");
                return;
            }
        }
        e.getContext().getWindow().localStorage.setItem("pluginSearch_searchEngine", new_url);
        e.window.alert("Succeed 成功");
    } else e.window.alert("Abort 操作终止");
});

emitter.addListener("pluginMgrInfo", function (e) {
    e.setReturnValue("Search makes you be able to change search engine. ");
});