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
        var win = e.target.contentWindow;
        var doc = win.document;
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
            var con = e.getContext();
            var pls = con.getPlugins();
            var has = con.hasPlugin;
            for (var i = 0; has(i); ++i) {
                if (pls[i].__jbrowName == item) {
                    break;
                }
            }
            var li = doc.createElement("li");
            li.appendChild(doc.createTextNode(item));
            var opt = doc.createElement("button");
            opt.appendChild(doc.createTextNode("OPT 选项"));
            opt.addEventListener("click", function () {
                con.sendMessageToPlugin(i, {type: "pluginMgrOption", window: win});
            });
            li.appendChild(opt);
            var dis = doc.createElement("button");
            dis.appendChild(doc.createTextNode("Disable 禁用"));
            dis.addEventListener("click", function disFn() {
                fs.rename("./jbrowPlugins/" + item, "./jbrowPlugins/." + item, function (err) {
                    if (err) {
                        win.alert("Fail! 失败！")
                    }
                });
                this.textContent = "Take effect after reopen 重启jBrow后起效";
                this.removeEventListener("click", disFn);
                disabled_ul.appendChild(li);
            });
            li.appendChild(dis);
            var del = doc.createElement("button");
            del.appendChild(doc.createTextNode("Del 删除"));
            del.addEventListener("click", function () {
                if (win.confirm("Really wanna DELETE this plugin? If so, it will be lost for a really long time! \n\n真的要删除这个插件？你将会失去它很长时间，真的很长！")) {
                    fs.unlink("./jbrowPlugins/" + item, function (err) {
                        if (err) {
                            win.alert("Fail! 失败！")
                        }
                    });
                    li.remove();
                }
            });
            li.appendChild(del);
            // li.appendChild(doc.createElement("br"));
            var info = con.sendMessageToPlugin(i, {type: "pluginMgrInfo"});
            if (typeof info == "string") {
                var p = doc.createElement("p");
                p.textContent = info;
                li.appendChild(p);
            }
            enabled_ul.appendChild(li);
        });
        if (enabled.length == 0) {
            enabled_head.appendChild(doc.createTextNode(" (none)"));
        }
        disabled.forEach(function (item) {
            var li = doc.createElement("li");
            li.appendChild(doc.createTextNode(item));
            var en = doc.createElement("button");
            en.appendChild(doc.createTextNode("Enable 启用"));
            en.addEventListener("click", function enFn() {
                fs.rename("./jbrowPlugins/" + item, "./jbrowPlugins/" + /^\.+(.*)$/.exec(item)[1], function (err) {
                    if (err) {
                        win.alert("Fail! 失败！")
                    }
                });
                this.textContent = "Take effect after reopen 重启jBrow后起效";
                this.removeEventListener("click", enFn);
                enabled_ul.appendChild(li);
            });
            li.appendChild(en);
            var del = doc.createElement("button");
            del.appendChild(doc.createTextNode("Del 删除"));
            del.addEventListener("click", function () {
                if (win.confirm("Really wanna DELETE this plugin? If so, it will be lost for a really long time! \n\n真的要删除这个插件？你将会失去它很长时间，真的很长！")) {
                    fs.unlink("./jbrowPlugins/" + item, function (err) {
                        if (err) {
                            win.alert("Fail! 失败！")
                        }
                    });
                    li.remove();
                }
            });
            li.appendChild(del);
            disabled_ul.appendChild(li);
        });
        if (disabled.length == 0) {
            disabled_head.appendChild(doc.createTextNode(" (none)"));
        }
        fs.readFile("./jbrowPlugins/pluginMgrPage.css", function (err, data) {
            if (err) throw err;
            doc.head.innerHTML = "<meta charset='UTF-8'/><style>" + data.toString() + "</style>";
        });
        doc.body.innerHTML = "";
        doc.body.appendChild(main_container);
        var tip = doc.createElement("p");
        tip.innerHTML = "You may think this page is ugly. Would you like to do something for it? <a href='https://github.com/TitanSnow/jBrow'>jBrow on GitHub</a>";
        doc.body.appendChild(tip);
        doc.title = "jBrow Plugins";
    }
});

emitter.addListener("pluginMgrOption", function (e) {
    e.window.alert("Here is NOTHING");
});

emitter.addListener("pluginMgrInfo", function (e) {
    e.setReturnValue("PluginMgr manages plugins like option, disabling/enabling and deleting. Strongly recommend NOT disabling it. ");
});