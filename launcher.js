/**
 * Created by ts on 7/15/16.
 */
var fs = require("fs");
var cp = require("child_process");
try {
    fs.statSync("./pid");
    try {
        cp.execSync("chmod +x ./sender.py");
    } catch (err) {
    }
    try {
        cp.execFileSync("./sender.py");
    } catch (err) {
        // console.log("Failed to launch! ");
    }
} catch (err) {
}

try {
    cp.execSync("chmod +x ./nw");
} catch (err) {
}
try {
    cp.execFileSync("./nw");
} catch (err) {
    // console.log("Failed to launch! ");
}