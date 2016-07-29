/**
 * Created by ts on 7/29/16.
 */
var events = require("events");
var emitter = new events.EventEmitter();
exports.onmessage = function (e) {
    emitter.emit(e.type, e);
};

emitter.on("pluginRebooter_reboot", function (e) {
    var con=e.getContext();
    con.getWindow().location.reload(true);
    e.stopSpread();
    e.setReturnValue(false);
});

emitter.on("aboutPagesHit",function (e) {
    if(e.page_name == "reboot"){
        e.stopSpread();
        e.setReturnValue(false);
        e.getContext().sendMessageToAllPlugins({type: "pluginRebooter_reboot"});
        e.target.contentDocument.body.innerHTML="You shouldn't see this at all<br/><a href='https://github.com/TitanSnow/jBrow'>jBrow on GitHub</a>";
    }
});

emitter.addListener("pluginMgrOption", function (e) {
    e.window.alert("Here is NOTHING");
});

emitter.addListener("pluginMgrInfo", function (e) {
    e.setReturnValue("Rebooter helps developers reboot jBrow. ");
});
