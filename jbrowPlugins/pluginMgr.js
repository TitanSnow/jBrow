/**
 * Created by ts on 7/6/16.
 */
var fs = require("fs");
var events = require("events");
var emitter = new events.EventEmitter();
exports.onmessage = function (e) {
    emitter.emit(e.type, e);
};
emitter.addListener("aboutPagesHit", function (e) {
    if (e.page_name == "jbrow-plugins") {
        e.stopSpread();
        e.setReturnValue(false);
        var dir = fs.readdirSync("./jbrowPlugins");
        var enabled = [], disabled = [];
        dir.forEach(function (fn) {
            if (/\.js$/.test(fn)) {
                if (/^\./.test(fn)) {
                    disabled.push(fn);
                } else {
                    enabled.push(fn);
                }
            }
        });
        var doc = e.getContext().getDocument();
        var main_container = doc.createElement("div");
        var enabled_container = doc.createElement("div");
        var disabled_container = doc.createElement("div");
        var main_head = doc.createElement("h1");
        main_container.appendChild(main_head);
        main_container.appendChild(enabled_container);
        main_container.appendChild(disabled_container);
        main_head.appendChild(doc.createTextNode("jBrow Plugins"));
        var enabled_head = doc.createElement("h2");
        enabled_container.appendChild(enabled_head);
        enabled_head.appendChild(doc.createTextNode("Enabled Plugins"));
        var disabled_head = doc.createElement("h2");
        disabled_container.appendChild(disabled_head);
        disabled_head.appendChild(doc.createTextNode("Disabled Plugins"));
        var enabled_ul = doc.createElement("ul");
        enabled_container.appendChild(enabled_ul);
        var disabled_ul = doc.createElement("ul");
        disabled_container.appendChild(disabled_ul);
        enabled.forEach(function (item) {
            var li = doc.createElement("li");
            li.appendChild(doc.createTextNode(item));
            enabled_ul.appendChild(li);
        });
        disabled.forEach(function (item) {
            var li = doc.createElement("li");
            li.appendChild(doc.createTextNode(item));
            disabled_ul.appendChild(li);
        });
        e.target.contentDocument.body.appendChild(main_container);
        e.target.contentDocument.title = "jBrow Plugins";
    }
});