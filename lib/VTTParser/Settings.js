"use strict";
exports.__esModule = true;
var Settings = /** @class */ (function () {
    function Settings() {
        this.values = Object.create(null);
    }
    Settings.prototype.set = function (k, v) {
        if (!this.get(k) && v !== "") {
            this.values[k] = v;
        }
    };
    // Return the value for a key, or a default value.
    // If 'defaultKey' is passed then 'dflt' is assumed to be an object with
    // a number of possible default values as properties where 'defaultKey' is
    // the key of the property that will be chosen; otherwise it's assumed to be
    // a single value.
    Settings.prototype.get = function (k, dflt, defaultKey) {
        var defaultValue = (defaultKey && (dflt instanceof Object)) ? dflt[defaultKey] : dflt;
        return this.has(k) ? this.values[k] : defaultValue;
    };
    // Check whether we have a value for a key.
    Settings.prototype.has = function (k) {
        return k in this.values;
    };
    // Accept a setting if its one of the given alternatives.
    Settings.prototype.alt = function (k, v, a) {
        for (var n = 0; n < a.length; ++n) {
            if (v === a[n]) {
                this.set(k, v);
                break;
            }
        }
    };
    // Accept a setting if its a valid (signed) integer.
    Settings.prototype.integer = function (k, v) {
        if (/^-?\d+$/.test(v)) { // integer
            this.set(k, parseInt(v, 10));
        }
    };
    // Accept a setting if its a valid percentage.
    Settings.prototype.percent = function (k, v) {
        if ((v.match(/^([\d]{1,3})(\.[\d]*)?%$/))) {
            var vFloat = parseFloat(v);
            if (vFloat >= 0 && vFloat <= 100) {
                this.set(k, vFloat);
                return true;
            }
        }
        return false;
    };
    return Settings;
}());
exports["default"] = Settings;
