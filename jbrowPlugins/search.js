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
    
    if (e.page_name!="search") return;
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
    myPrompt(e.window, "Current search engine is " + old_url + "\n\nPlease write down the URL of new search engine here\n\n\n当前的搜索引擎是：" + old_url + "\n\n请在这里写下新搜索引擎的网址", function (new_url) {
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
    function myPrompt(win, info, callback) {
        var doc = win.document;
        var dialog = doc.createElement("div");
        dialog.classList.add("pluginSearch-dialog");
        var tip = doc.createElement("div");
        tip.innerText = info;
        tip.classList.add("pluginSearch-dialog-info");
        dialog.appendChild(tip);
        var input = doc.createElement("input");
        input.type = "text";
        input.setAttribute("list", "pluginSearch-dialog-input-dataList");
        var button = doc.createElement("button");
        button.type = "submit";
        button.appendChild(doc.createTextNode("OK"));
        var form = doc.createElement("form");
        form.appendChild(input);
        form.appendChild(button);
        dialog.appendChild(form);
        var cancel = doc.createElement("button");
        cancel.type = "button";
        cancel.appendChild(doc.createTextNode("Cancel"));
        dialog.appendChild(cancel);
        var dataList = doc.createElement("datalist");
        dataList.id = "pluginSearch-dialog-input-dataList";
        dataList.innerHTML =
            `
<option value="https://www.bing.com/search?q=\$\{keyword\}">Bing</option>
<option value="https://www.baidu.com/s?wd=\$\{keyword\}">Baidu</option>
<option value="https://search.yahoo.com/yhs/search?p=\$\{keyword\}">Yahoo</option>
`;
        dialog.appendChild(dataList);
        doc.body.appendChild(dialog);

        form.addEventListener("submit", function (e) {
            e.preventDefault();
            dialog.remove();
            callback(input.value);
        });
        cancel.addEventListener("click", function () {
            dialog.remove();
            callback(null);
        });

        e.getContext().importCSS(doc, "./jbrowPlugins/search.css");
    }
});

emitter.addListener("pluginMgrInfo", function (e) {
    e.setReturnValue("Search makes you be able to change search engine. ");
});
