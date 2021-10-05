"use strict";
exports.__esModule = true;
var ParsingError_1 = require("./ParsingError");
var parseOptions_1 = require("./parseOptions");
var Settings_1 = require("./Settings");
var parseTimestamp_1 = require("../shared/parseTimestamp");
function parseCue(input, cue, regionList) {
    // Remember the original input if we need to throw an error.
    var oInput = input;
    // 4.1 WebVTT timestamp
    function consumeTimeStamp() {
        var ts = (0, parseTimestamp_1["default"])(input);
        if (ts === null) {
            throw new ParsingError_1["default"](ParsingError_1["default"].Errors.BadTimeStamp, "Malformed timestamp: " + oInput);
        }
        // Remove time stamp from input.
        input = input.replace(/^[^\sa-zA-Z-]+/, "");
        return ts;
    }
    // 4.4.2 WebVTT cue settings
    function consumeCueSettings(input, cue) {
        var settings = new Settings_1["default"]();
        (0, parseOptions_1["default"])(input, function (k, v) {
            var _a;
            switch (k) {
                case "region":
                    // Find the last region we parsed with the same region id.
                    if (regionList) {
                        for (var i = regionList.length - 1; i >= 0; i--) {
                            if (regionList[i].id === v) {
                                settings.set(k, regionList[i].region);
                                break;
                            }
                        }
                    }
                    break;
                case "vertical":
                    settings.alt(k, v, ["rl", "lr"]);
                    break;
                case "line":
                    var vals = v.split(","), vals0 = vals[0];
                    settings.integer(k, vals0);
                    (_a = settings.percent(k, vals0)) !== null && _a !== void 0 ? _a : settings.set("snapToLines", false);
                    settings.alt(k, vals0, ["auto"]);
                    if (vals.length === 2) {
                        settings.alt("lineAlign", vals[1], ["start", "middle", "end"]);
                    }
                    break;
                case "position":
                    vals = v.split(",");
                    settings.percent(k, vals[0]);
                    if (vals.length === 2) {
                        settings.alt("positionAlign", vals[1], ["start", "middle", "end"]);
                    }
                    break;
                case "size":
                    settings.percent(k, v);
                    break;
                case "align":
                    settings.alt(k, v, ["start", "middle", "end", "left", "right"]);
                    break;
            }
        }, /:/, /\s/);
        console.log('parsing cue:', cue);
        // Apply default values for any missing fields.
        cue.region = settings.get("region", null);
        cue.vertical = settings.get("vertical", "");
        cue.line = settings.get("line", "auto");
        cue.lineAlign = settings.get("lineAlign", "center");
        cue.snapToLines = settings.get("snapToLines", true);
        cue.size = settings.get("size", 100);
        cue.align = settings.get("align", "middle");
        cue.position = settings.get("position", "auto");
        cue.positionAlign = settings.get("positionAlign", {
            start: "start",
            left: "start",
            center: "center",
            end: "end",
            right: "end"
        }, cue.align);
        console.log('defaults applied!', cue);
    }
    function skipWhitespace() {
        input = input.replace(/^\s+/, "");
    }
    // 4.1 WebVTT cue timings.
    skipWhitespace();
    cue.startTime = consumeTimeStamp(); // (1) collect cue start time
    skipWhitespace();
    if (input.substr(0, 3) !== "-->") { // (3) next characters must match "-->"
        throw new ParsingError_1["default"](ParsingError_1["default"].Errors.BadTimeStamp, "Malformed time stamp (time stamps must be separated by '-->'): " +
            oInput);
    }
    input = input.substr(3);
    skipWhitespace();
    cue.endTime = consumeTimeStamp(); // (5) collect cue end time
    // 4.1 WebVTT cue settings list.
    skipWhitespace();
    consumeCueSettings(input, cue);
}
exports["default"] = parseCue;
