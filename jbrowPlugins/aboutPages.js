/**
 * Created by Titan Snow on 2016/7/5.
 */
var fs = require("fs");
var events = require("events");
var emitter = new events.EventEmitter();
exports.onmessage = function (e) {
    emitter.emit(e.type, e);
};
emitter.addListener("URLChange", function (e) {
    var c = e.target;
    var win = c.contentWindow;
    var doc = win.document;
    if (doc.readyState == "interactive" || doc.readyState == "complete") doit();
    doc.addEventListener("DOMContentLoaded", doit);
    function doit() {
        if (/^about:[\w-]+$/.test(win.location.href)) {
            var page_name = /^about:([\w-]+)$/.exec(win.location.href)[1];
            fs.exists("./jbrowAboutpages/" + page_name + ".html", function (exists) {
                if (exists) {
                    fs.readFile("./jbrowAboutpages/aboutPages.css", function (err, data) {
                        if (err) throw err;
                        var style_ele = doc.createElement("style");
                        style_ele.textContent = data.toString();
                        doc.head.innerHTML = "";
                        doc.head.appendChild(style_ele);
                    });
                    fs.readFile("./jbrowAboutpages/" + page_name + ".html", function (err, data) {
                        if (err) throw err;
                        var iframe_ele = doc.createElement("iframe");
                        iframe_ele.setAttribute("srcdoc", data.toString());
                        doc.body.innerHTML = "";
                        doc.body.appendChild(iframe_ele);
                    })
                }
            })
        }
    }
});