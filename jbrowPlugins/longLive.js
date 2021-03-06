/**
 * Created by ts on 7/14/16.
 */
var fs = require("fs");
var cp = require("child_process");
var events = require("events");
var emitter = new events.EventEmitter();
exports.onmessage = function (e) {
    emitter.emit(e.type, e);
};

emitter.on("beforeClose", function (e) {
    e.setReturnValue(false);
    var con = e.getContext();
    var nw_win = con.getNWWindow();
    nw_win.hide();
    var win = con.getWindow();
    var doc = win.document;
    var tabs = doc.getElementsByClassName("tab");
    tabs = Array.prototype.slice.call(tabs, 0);
    tabs.forEach(function (e) {
        con.removePage(con.getPageId(e));
    });
    tabs = null;
    con.focusPage(con.createPage("about:home"));
    setTimeout(function () {
        fs.writeFileSync("./pid", process.pid.toString());
        process.on("exit", function () {
            try {
                nw_win.hide();
            } catch (err) {
            }
            try {
                fs.unlinkSync("./pid");
            } catch (err) {
            }
        });
        try {
            cp.execSync("if [ ! -x './listener.py' ]; then chmod u+x ./listener.py; fi");  //Linux
        } catch (err) {
        }
        try {
            cp.execFileSync("./listener.py");   //Linux
        } catch (err) {
            try {
                cp.execSync("listener.py"); //Windows
            } catch (err) {
                process.exit();
                throw err;
            }
        }
        fs.unlink("./pid");
        nw_win.show();
        nw_win.setAlwaysOnTop(true);
        setTimeout(function(){nw_win.setAlwaysOnTop(false);},1000);
    }, 0);
});

emitter.addListener("pluginMgrOption", function (e) {
    e.window.alert("Here is NOTHING");
});

emitter.addListener("pluginMgrInfo", function (e) {
    e.setReturnValue("LongLive provides the feature of memory-resident. ");
});
