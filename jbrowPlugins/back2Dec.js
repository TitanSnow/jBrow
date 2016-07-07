/**
 * Created by ts on 7/7/16.
 */
var events = require("events");
var emitter = new events.EventEmitter();
exports.onmessage = function (e) {
    emitter.emit(e.type, e);
};

emitter.addListener("ready", function (e) {
    var con = e.getContext();
    var win = con.getWindow();
    var doc = win.document;
    var url_wrapper = doc.getElementsByClassName("url-wrapper")[0];
    var forward_btn = doc.createElement("button");
    forward_btn.appendChild(doc.createTextNode("Forward"));
    forward_btn.classList.add("pluginBack2Dec-forward-btn");
    forward_btn.addEventListener("click", function () {
        var content = con.getContentById(con.getFocusedPageId());
        content.contentWindow.history.forward();
    });
    url_wrapper.insertBefore(forward_btn, url_wrapper.firstChild);
    var back_btn = doc.createElement("button");
    back_btn.appendChild(doc.createTextNode("Back"));
    back_btn.classList.add("pluginBack2Dec-back-btn");
    back_btn.addEventListener("click", function () {
        var content = con.getContentById(con.getFocusedPageId());
        content.contentWindow.history.back();
    });
    url_wrapper.insertBefore(back_btn, forward_btn);
    con.importCSS("./jbrowPlugins/back2Dec.css");
});