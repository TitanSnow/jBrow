/**
 * Created by ts on 7/12/16.
 */
var events = require("events");
var emitter = new events.EventEmitter();
exports.onmessage = function (e) {
    emitter.emit(e.type, e);
};

emitter.addListener("aboutPagesHit", function (e) {
    if (e.page_name == "history") {
        e.stopSpread();
        e.setReturnValue(false);
        var win = e.target.contentWindow;
        var doc = win.document;
        var con = e.getContext();
        var history = con.sendMessageToAllPlugins({type: "pluginHistoryViewGetHistory"});
        if (history instanceof Array) {
            history = history.slice(0);
            history.reverse();
            var today_ul = doc.createElement("ul");
            for (var i = 0; i < history.length; ++i)if ((function (o) {
                    var date = new Date(Number(o.time));
                    if (Math.abs(+date - +new Date()) > 24 * 60 * 60 * 1000 || date.getDate() != new Date().getDate()) return false;
                var li = doc.createElement("li");
                    li.textContent = date.toLocaleString();
                var a = doc.createElement("a");
                a.href = o.url;
                a.textContent = o.url;
                li.appendChild(a);
                    li.dataset.time = o.time;
                    today_ul.appendChild(li);
                })(history[i]) === false) break;
            var clear = doc.createElement("button");
            doc.body.appendChild(clear);
            var today = doc.createElement("details");
            today.open = true;
            var today_summary = doc.createElement("summary");
            today_summary.appendChild(doc.createTextNode("Today"));
            today.appendChild(today_summary);
            today.appendChild(today_ul);
            doc.body.appendChild(today);

            var yesterday_ul = doc.createElement("ul");
            for (; i < history.length; ++i)if ((function (o) {
                    var date = new Date(Number(o.time));
                    var now = new Date();
                    var yesterday_date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
                    if (Math.abs(+date - +now) > 2 * 24 * 60 * 60 * 1000 || date.getDate() != yesterday_date.getDate()) return false;
                    var li = doc.createElement("li");
                    li.textContent = date.toLocaleString();
                    var a = doc.createElement("a");
                    a.href = o.url;
                    a.textContent = o.url;
                    li.appendChild(a);
                    li.dataset.time = o.time;
                    yesterday_ul.appendChild(li);
                })(history[i]) === false) break;
            var yesterday = doc.createElement("details");
            var yesterday_summary = doc.createElement("summary");
            yesterday_summary.appendChild(doc.createTextNode("Yesterday"));
            yesterday.appendChild(yesterday_summary);
            yesterday.appendChild(yesterday_ul);
            doc.body.appendChild(yesterday);

            var more_ul = doc.createElement("ul");
            for (; i < history.length; ++i)if ((function (o) {
                    var date = new Date(Number(o.time));
                    var li = doc.createElement("li");
                    li.textContent = date.toLocaleString();
                    var a = doc.createElement("a");
                    a.href = o.url;
                    a.textContent = o.url;
                    li.appendChild(a);
                    li.dataset.time = o.time;
                    more_ul.appendChild(li);
                })(history[i]) === false) break;
            var more = doc.createElement("details");
            var more_summary = doc.createElement("summary");
            more_summary.appendChild(doc.createTextNode("More"));
            more.appendChild(more_summary);
            more.appendChild(more_ul);
            doc.body.appendChild(more);

            clear.appendChild(doc.createTextNode("Clear 清除"));
            clear.addEventListener("click", function () {
                var form = doc.createElement("form");
                form.classList.add("pluginHistoryView-dialog");
                form.innerHTML = 'Clear history from <input type="datetime-local"/> to <input type="datetime-local"/><br/><button type="submit">Do it</button><button type="button">Cancel</button>';
                var now = new Date();
                var after13 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() + 13);
                var before1h = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() - 1, now.getMinutes());

                function print2(num) {
                    var str = num + "";
                    while (str.length < 2) str = "0" + str;
                    return str;
                }

                form.getElementsByTagName("input")[1].value = `${after13.getFullYear()}-${print2(after13.getMonth())}-${print2(after13.getDate())}T${print2(after13.getHours())}:${print2(after13.getMinutes())}`;
                form.getElementsByTagName("input")[0].value = `${before1h.getFullYear()}-${print2(before1h.getMonth())}-${print2(before1h.getDate())}T${print2(before1h.getHours())}:${print2(before1h.getMinutes())}`;
                form.addEventListener("submit", function (e) {
                    form.remove();
                    e.preventDefault();
                    var d0 = form.getElementsByTagName("input")[0];
                    var d1 = form.getElementsByTagName("input")[1];
                    if (!d0.checkValidity() || !d1.checkValidity()) win.alert("Incorrect datetime! 非法的时间！");
                    var re = /^(\w\w\w\w)-(\w\w)-(\w\w)T(\w\w):(\w\w)/;
                    var m0 = re.exec(d0.value);
                    var m1 = re.exec(d1.value);
                    var from = new Date(Number(m0[1]), Number(m0[2]), Number(m0[3]), Number(m0[4]), Number(m0[5]));
                    var to = new Date(Number(m1[1]), Number(m1[2]), Number(m1[3]), Number(m1[4]), Number(m1[5]));
                    if (isNaN(+from) || isNaN(+to) || +from > +to) win.alert("Incorrect datetime! 非法的时间！");
                    else {
                        win.console.log([+from, +to]);
                        var history = con.sendMessageToAllPlugins({type: "pluginHistoryViewGetHistory"});
                        for (var i = 0; i < history.length; ++i) {
                            if (history[i].time >= +from && history[i].time <= +to) {
                                history.splice(i--, 1);
                            }
                        }
                        win.alert("Succeed 成功");
                        win.console.log(history);
                    }
                });
                form.getElementsByTagName("button")[1].addEventListener("click", function () {
                    form.remove();
                });
                doc.body.appendChild(form);
            });
            con.importCSS(doc, "./jbrowPlugins/historyView.css")
        }
    }
});

emitter.addListener("pluginMgrOption", function (e) {
    e.window.location = "about:history";
});

emitter.addListener("pluginMgrInfo", function (e) {
    e.setReturnValue("HistoryView can show you history list. ");
});
