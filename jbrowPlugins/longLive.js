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
    con.focusPage(con.createPage("about:home"));
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
        cp.execSync("chmod +x ./listener.py");
    } catch (err) {
    }
    try {
        cp.execFileSync("./listener.py");
    } catch (err) {
        process.exit();
        throw err;
    }
    fs.unlink("./pid");
    nw_win.show();
});