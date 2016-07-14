/**
 * Created by ts on 7/9/16.
 */
var fs = require("fs");
exports.onmessage = function (e) {
    if (e.type == "selfStart") {
        var con = e.getContext();
        var XMLHttpRequest = con.getWindow().XMLHttpRequest;
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "https://raw.githubusercontent.com/TitanSnow/jBrow/trois/upgrade.json");
        xhr.send();
        xhr.onreadystatechange = function () {
            if (this.readyState == 4) {
                if (this.status == 200) {
                    doit("new", JSON.parse(this.responseText));
                } else throw this.status;
            }
        };
        fs.readFile("upgrade.json", function (err, data) {
            if (err) throw err;
            var obj = JSON.parse(data.toString());
            doit("old", obj)
        });
        var doit = (function (cTh) {
            var objs = {};
            return function (name, obj) {
                objs[name] = obj;
                if (--cTh == 0) {
                    var ls = con.getWindow().localStorage;
                    var cannel = ls.getItem("pluginUpgrade_cannel");
                    if (cannel === null) {
                        ls.setItem("pluginUpgrade_cannel", "alpha");
                        cannel = ls.getItem("pluginUpgrade_cannel");
                    }
                    if (objs.old.lastestVersions[cannel].version != objs.new.lastestVersions[cannel].version) {
                        var doc = con.getDocument();
                        var tip = doc.createElement("div");
                        tip.classList.add("pluginUpgrade-upgradeTip");
                        var span = doc.createElement("span");
                        span.classList.add("info");
                        span.appendChild(doc.createTextNode("There is a new version 有新版本"));
                        tip.appendChild(span);

                        var button = doc.createElement("button");
                        button.classList.add("ok");
                        button.appendChild(doc.createTextNode("Go for a look 去看看"));
                        button.addEventListener("click", function () {
                            con.focusPage(con.createPage(objs.new.lastestVersions[cannel].link));
                        });
                        button.addEventListener("click", hideTip);
                        tip.appendChild(button);

                        span = doc.createElement("span");
                        span.classList.add("no");
                        span.appendChild(doc.createTextNode("Put it off"));
                        span.addEventListener("click", hideTip);
                        tip.appendChild(span);

                        span = doc.createElement("span");
                        span.classList.add("noForever");
                        span.appendChild(doc.createTextNode("Ignore this version"));
                        span.addEventListener("click", hideTip);
                        span.addEventListener("click", function () {
                            fs.writeFile("./upgrade.json", JSON.stringify(objs.new));
                        });
                        tip.appendChild(span);

                        doc.body.appendChild(tip);

                        con.importCSS("./jbrowPlugins/upgrade_tip.css");

                        function hideTip() {
                            tip.remove();
                        }
                    }
                }
            }
        })(2)
    } else if (e.type == "pluginMgrOption") {
        var cannel = e.window.prompt("Please type new upgrade cannel here. ");
        if (cannel !== null) {
            e.getContext().getWindow().localStorage.setItem("pluginUpgrade_cannel", cannel);
        }
    } else if (e.type == "pluginMgrInfo") {
        e.setReturnValue("Upgrade will remind you when new version come out. ");
    }
};