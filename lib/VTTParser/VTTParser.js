"use strict";
exports.__esModule = true;
var parseOptions_1 = require("./parseOptions");
var ParsingError_1 = require("./ParsingError");
var parseCue_1 = require("./parseCue");
var types_1 = require("../types");
;
/**
 * The main parser class.
 */
var VTTParser = /** @class */ (function () {
    /**
     *
     * @param settings
     */
    function VTTParser(_a) {
        var _this = this;
        var onError = _a.onError, onRegion = _a.onRegion, onCue = _a.onCue, onFlush = _a.onFlush, parseRegion = _a.parseRegion, decoder = _a.decoder;
        this._state = "INITIAL";
        this._buffer = "";
        this._regionList = [];
        /**
         * Parse header metadata (in this case, just regions)
         *
         * @param input
         */
        this._parseHeader = function (input) {
            (0, parseOptions_1["default"])(input, function (k, v) {
                switch (k) {
                    case "Region":
                        // 3.3 WebVTT region metadata header syntax
                        _this.parseRegion && _this.parseRegion({
                            input: v,
                            regionList: _this._regionList,
                            onRegion: _this.onRegion
                        });
                        break;
                }
            }, /:/);
        };
        this._collectNextLine = function () {
            var buffer = _this._buffer;
            var pos = 0;
            while (pos < buffer.length && buffer[pos] !== '\r' && buffer[pos] !== '\n') {
                ++pos;
            }
            var line = buffer.substr(0, pos);
            // Advance the buffer early in case we fail below.
            if (buffer[pos] === '\r') {
                ++pos;
            }
            if (buffer[pos] === '\n') {
                ++pos;
            }
            _this._buffer = buffer.substr(pos);
            return line;
        };
        this.parse = function (data) {
            // If there is no data then we won't decode it, but will just try to parse
            // whatever is in buffer already. This may occur in circumstances, for
            // example when flush() is called.
            if (data) {
                // Try to decode the data that we received.
                _this._buffer += (typeof data === 'string') ?
                    data :
                    _this._decoder.decode(data, { stream: true });
            }
            // 5.1 WebVTT file parsing.
            try {
                var line = '';
                if (_this._state === "INITIAL") {
                    // We can't start parsing until we have the first line.
                    if (!/\r\n|\n/.test(_this._buffer)) {
                        return;
                    }
                    line = _this._collectNextLine();
                    var m = line.match(/^WEBVTT([ \t].*)?$/);
                    if (!m || !m[0]) {
                        throw new ParsingError_1["default"](ParsingError_1["default"].Errors.BadSignature);
                    }
                    _this._state = "HEADER";
                }
                var alreadyCollectedLine = false;
                while (_this._buffer) {
                    // We can't parse a line until we have the full line.
                    if (!/\r\n|\n/.test(_this._buffer)) {
                        return;
                    }
                    if (!alreadyCollectedLine) {
                        line = _this._collectNextLine();
                    }
                    else {
                        alreadyCollectedLine = false;
                    }
                    switch (_this._state) {
                        case "HEADER":
                            // 13-18 - Allow a header (metadata) under the WEBVTT line.
                            if (/:/.test(line)) {
                                _this._parseHeader(line);
                            }
                            else if (!line) {
                                // An empty line terminates the header and starts the body (cues).
                                _this._state = "ID";
                            }
                            continue;
                        case "NOTE":
                            // Ignore NOTE blocks.
                            if (!line) {
                                _this._state = "ID";
                            }
                            continue;
                        // @ts-ignore-line
                        case "ID":
                            // Check for the start of NOTE blocks.
                            if (/^NOTE($|[ \t])/.test(line)) {
                                _this._state = "NOTE";
                                break;
                            }
                            // 19-29 - Allow any number of line terminators, then initialize new cue values.
                            if (!line)
                                continue;
                            _this._cue = new types_1.XCue(0, 0, "").toJSON();
                            _this._state = "CUE";
                            // 30-39 - Check if self line contains an optional identifier or timing data.
                            if (line.indexOf("-->") === -1) {
                                _this._cue.id = line;
                                continue;
                            }
                        // Process line as start of a cue.
                        /*falls through*/
                        case "CUE":
                            // 40 - Collect cue timings and settings.
                            try {
                                (0, parseCue_1["default"])(line, _this._cue, _this._regionList);
                            }
                            catch (e) {
                                _this.reportOrThrowError(e);
                                // In case of an error ignore rest of the cue.
                                _this._cue = null;
                                _this._state = "BADCUE";
                                continue;
                            }
                            _this._state = "CUETEXT";
                            continue;
                        case "CUETEXT":
                            var hasSubstring = line.indexOf("-->") !== -1;
                            // 34 - If we have an empty line then report the cue.
                            // 35 - If we have the special substring '-->' then report the cue,
                            // but do not collect the line as we need to process the current
                            // one as a new cue.
                            if (!line || (hasSubstring && (alreadyCollectedLine = true))) {
                                // We are done parsing self cue.
                                _this.onCue && _this._cue && _this.onCue(_this._cue);
                                _this._cue = null;
                                _this._state = "ID";
                                continue;
                            }
                            if (_this._cue.text) {
                                _this._cue.text += "\n";
                            }
                            _this._cue.text += line;
                            continue;
                        case "BADCUE": // BADCUE
                            // 54-62 - Collect and discard the remaining cue.
                            if (!line) {
                                _this._state = "ID";
                            }
                            continue;
                    }
                }
            }
            catch (e) {
                _this.reportOrThrowError(e);
                // If we are currently parsing a cue, report what we have.
                if (_this._state === "CUETEXT" && _this._cue && _this.onCue) {
                    _this.onCue(_this._cue);
                }
                _this._cue = null;
                // Enter BADWEBVTT state if header was not parsed correctly otherwise
                // another exception occurred so enter BADCUE state.
                _this._state = _this._state === "INITIAL" ? "BADWEBVTT" : "BADCUE";
            }
        };
        this.flush = function () {
            try {
                // Finish decoding the stream.
                _this._buffer += _this._decoder.decode();
                // Synthesize the end of the current cue or region.
                if (_this._cue || _this._state === "HEADER") {
                    _this._buffer += "\n\n";
                    _this.parse();
                }
                // If we've flushed, parsed, and we're still on the INITIAL state then
                // that means we don't have enough of the stream to parse the first
                // line.
                if (_this._state === "INITIAL") {
                    throw new ParsingError_1["default"](ParsingError_1["default"].Errors.BadSignature);
                }
            }
            catch (e) {
                _this.reportOrThrowError(e);
            }
            _this.onFlush && _this.onFlush();
        };
        this.onError = onError;
        this.onRegion = onRegion;
        this.onCue = onCue;
        this.onFlush = onFlush;
        this._cue = null;
        this.parseRegion = parseRegion;
        this._decoder = decoder || new TextDecoder("utf-8");
    }
    VTTParser.prototype.reportOrThrowError = function (e) {
        if (e instanceof ParsingError_1["default"]) {
            this.onError && this.onError(e);
        }
        else {
            throw e;
        }
    };
    return VTTParser;
}());
exports["default"] = VTTParser;
