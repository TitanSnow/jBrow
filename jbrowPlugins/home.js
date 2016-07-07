/**
 * Created by ts on 7/7/16.
 */
var events = require("events");
var emitter = new events.EventEmitter();
exports.onmessage = function (e) {
    emitter.emit(e.type, e);
};

emitter.addListener("aboutPagesHit", function (e) {
    if (e.page_name != "home") return;
    e.stopSpread();
    e.setReturnValue(false);
    var ls = e.getContext().getWindow().localStorage;
    if (ls.getItem("pluginHome_Homepage") === null) {
        ls.setItem("pluginHome_Homepage", "https://www.bing.com");
    }
    e.target.src = ls.getItem("pluginHome_Homepage");
});

emitter.addListener("pluginMgrOption", function (e) {
    var old_url = e.getContext().getWindow().localStorage.getItem("pluginHome_Homepage");
    var new_url = e.window.prompt("Current homepage is " + old_url + "\n\nPlease write down the URL of new homepage here\n\n\n当前的主页是：" + old_url + "\n\n请在这里写下新主页的网址");
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
        e.getContext().getWindow().localStorage.setItem("pluginHome_Homepage", new_url);
        e.window.alert("Succeed 成功");
    } else e.window.alert("Abort 操作终止");
});

emitter.addListener("pluginMgrInfo", function (e) {
    e.setReturnValue("Home makes you be able to set the homepage");
});