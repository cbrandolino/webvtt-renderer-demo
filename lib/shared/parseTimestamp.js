"use strict";
exports.__esModule = true;
function parseTimeStamp(input) {
    function computeSeconds(h, m, s, f) {
        return (h | 0) * 3600 + (m | 0) * 60 + (s | 0) + (f | 0) / 1000;
    }
    var matches = input.match(/^(\d+):(\d{2})(:\d{2})?\.(\d{3})/);
    if (!matches) {
        return null;
    }
    var m = matches.map(function (x) { return parseInt(x.replace(':', '')); });
    if (m[3]) {
        // Timestamp takes the form of [hours]:[minutes]:[seconds].[milliseconds]
        return computeSeconds(m[1], m[2], m[3], m[4]);
    }
    else if (m[1] > 59) {
        // Timestamp takes the form of [hours]:[minutes].[milliseconds]
        // First position is hours as it's over 59.
        return computeSeconds(m[1], m[2], 0, m[4]);
    }
    else {
        // Timestamp takes the form of [minutes]:[seconds].[milliseconds]
        return computeSeconds(0, m[1], m[2], m[4]);
    }
}
exports["default"] = parseTimeStamp;
