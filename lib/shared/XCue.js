"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var types_1 = require("../types");
/**
 * Extends the native {@link VTTCue} to add a {@link XCue.toJSON | toJSON} method.
 *
 * A shim is available at {}
 */
var XCue = /** @class */ (function (_super) {
    __extends(XCue, _super);
    function XCue() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * @returns A {@link JsonCue} object for the current cue.
     */
    XCue.prototype.toJSON = function () {
        var _this = this;
        var json = {};
        types_1.jsonCuePropKeys.forEach(function (key) {
            json[key] = _this[key];
        });
        return json;
    };
    XCue.prototype.set = function (key, value) {
        this[key] = value;
    };
    return XCue;
}(VTTCue));
exports["default"] = XCue;
