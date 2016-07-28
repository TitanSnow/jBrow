/**
 * Created by Titan Snow on 2016/7/5.
 */
var fs = require("fs");
var events = require("events");
var emitter = new events.EventEmitter();
exports.onmessage = function (e) {
    emitter.emit(e.type, e);
};

var knownPages = {};

emitter.addListener("URLChange", function (e) {
    var c = e.target;
    var win = c.contentWindow;
    var doc = win.document;
    if (doc.readyState == "interactive" || doc.readyState == "complete") doit();
    else doc.addEventListener("DOMContentLoaded", doit);
    function doit() {
        var id = e.getContext().getPageId(c);
        if (/^about:.+/.test(win.location.href)) {
            var page_name = /^about:(.+?)(?:\?.*)?$/.exec(win.location.href)[1];
            if (!knownPages.hasOwnProperty(id) || knownPages[id] != page_name) {
                knownPages[id] = page_name;
                if (e.getContext().sendMessageToAllPlugins({type: "aboutPagesHit", page_name: page_name, target: c}))
                    fs.exists("./jbrowAboutpages/" + page_name + ".html", function (exists) {
                        if (exists) {
                            loadCSS();
                            fs.readFile("./jbrowAboutpages/" + page_name + ".html", function (err, data) {
                                if (err) throw err;
                                setSrcdoc(data.toString());
                            })
                        }
                    });
            }
        } else {
            if (knownPages.hasOwnProperty(id)) {
                delete knownPages[id];
            }
        }
        function loadCSS() {
            fs.readFile("./jbrowAboutpages/aboutPages.css", function (err, data) {
                if (err) throw err;
                var style_ele = doc.createElement("style");
                style_ele.textContent = data.toString();
                doc.head.innerHTML = "";
                doc.head.appendChild(style_ele);
            });
        }

        function setSrcdoc(str) {
            var iframe_ele = doc.createElement("iframe");
            iframe_ele.setAttribute("srcdoc", str);
            iframe_ele.setAttribute("onload", "(" + (function () {
                    var c = document.getElementsByTagName("iframe")[0];
                    document.title = c.contentDocument.title;
                }).toString() + ")()");
            doc.body.innerHTML = "";
            doc.body.appendChild(iframe_ele);
            setTimeout(function () {
                iframe_ele.contentWindow.close = win.close;
            }, 0);
        }
    }
});

emitter.addListener("pluginMgrOption", function (e) {
    e.window.alert("Here is NOTHING");
});

emitter.addListener("pluginMgrInfo", function (e) {
    e.setReturnValue("AboutPages makes about pages (pages with URL about:*) be shown. Some setting require it. Strongly recommend NOT disabling it. ");
});
