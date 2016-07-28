/**
 * Created by ts on 7/28/16.
 */
var events = require("events");
var emitter = new events.EventEmitter();
exports.onmessage = function (e) {
    emitter.emit(e.type, e);
};

emitter.on("pluginShutdown_shutdown", function (e) {
    var con=e.getContext();
    var nw_win=con.getNWWindow();
    con.sendMessageToAllPlugins({type:"beforeClose"});
    con.sendMessageToAllPlugins({type:"close"});
    nw_win.close(true);
    process.exit();
    e.stopSpread();
    e.setReturnValue(false);
});

emitter.on("aboutPagesHit",function (e) {
    if(e.page_name == "shutdown"){
        e.stopSpread();
        e.setReturnValue(false);
        e.type="pluginShutdown_shutdown";
        emitter.emit(e.type, e);
        e.target.contentDocument.body.innerHTML="You shouldn't see this at all<br/><a href='https://github.com/TitanSnow/jBrow'>jBrow on GitHub</a>";
    }
});

emitter.addListener("pluginMgrOption", function (e) {
    e.window.alert("Here is NOTHING");
});

emitter.addListener("pluginMgrInfo", function (e) {
    e.setReturnValue("Shutdown makes it possible to truly shutdown jBrow manually instead of keeping it in memory. ");
});
