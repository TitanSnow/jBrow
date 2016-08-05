/**
 * Created by ts on 7/14/16.
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
    var url_form = doc.getElementById("url").parentNode;
    var button = doc.createElement("button");
    button.classList.add("pluginReload-reload-btn");
    button.appendChild(doc.createTextNode("Reload"));
    button.addEventListener("click", function () {
        var c=con.getContentById(con.getFocusedPageId());
        c.contentWindow.location.reload();
        setTimeout(function(){con.sendMessageToAllPlugins({type:"URLChange",target:c});},0);
    });
    url_wrapper.insertBefore(button, url_form);
    con.importCSS("./jbrowPlugins/reload.css");
});

emitter.addListener("pluginMgrOption", function (e) {
    e.window.alert("Here is NOTHING");
});

emitter.addListener("pluginMgrInfo", function (e) {
    e.setReturnValue("Reload adds the feature of reloading pages. ");
});
