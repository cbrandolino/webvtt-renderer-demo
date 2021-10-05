"use strict";
exports.__esModule = true;
var parseOptions_1 = require("./parseOptions");
var ParsingError_1 = require("./ParsingError");
var parseCue_1 = require("./parseCue");
var types_1 = require("../types");
;
/**
 * The main parser class.
 *
 * {@link IVTTParser}
 */
var VTTParser = /** @class */ (function () {
    /**
     *
     * @param settings
     */
    function VTTParser(_a) {
        var onError = _a.onError, onRegion = _a.onRegion, onCue = _a.onCue, onFlush = _a.onFlush, parseRegion = _a.parseRegion, decoder = _a.decoder;
        this._state = "INITIAL";
        this._buffer = "";
        this._regionList = [];
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
    VTTParser.prototype.parse = function (data) {
        var self = this;
        // If there is no data then we won't decode it, but will just try to parse
        // whatever is in buffer already. This may occur in circumstances, for
        // example when flush() is called.
        if (data) {
            // Try to decode the data that we received.
            self._buffer += (typeof data === 'string') ?
                data :
                self._decoder.decode(data, { stream: true });
        }
        function collectNextLine() {
            var buffer = self._buffer;
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
            self._buffer = buffer.substr(pos);
            return line;
        }
        // 3.2 WebVTT metadata header syntax
        function parseHeader(input) {
            (0, parseOptions_1["default"])(input, function (k, v) {
                switch (k) {
                    case "Region":
                        // 3.3 WebVTT region metadata header syntax
                        self.parseRegion && self.parseRegion({
                            input: v,
                            regionList: self._regionList,
                            onRegion: self.onRegion
                        });
                        break;
                }
            }, /:/);
        }
        // 5.1 WebVTT file parsing.
        try {
            var line = '';
            if (self._state === "INITIAL") {
                // We can't start parsing until we have the first line.
                if (!/\r\n|\n/.test(self._buffer)) {
                    return this;
                }
                line = collectNextLine();
                var m = line.match(/^WEBVTT([ \t].*)?$/);
                if (!m || !m[0]) {
                    throw new ParsingError_1["default"](ParsingError_1["default"].Errors.BadSignature);
                }
                self._state = "HEADER";
            }
            var alreadyCollectedLine = false;
            while (self._buffer) {
                // We can't parse a line until we have the full line.
                if (!/\r\n|\n/.test(self._buffer)) {
                    return this;
                }
                if (!alreadyCollectedLine) {
                    line = collectNextLine();
                }
                else {
                    alreadyCollectedLine = false;
                }
                switch (self._state) {
                    case "HEADER":
                        // 13-18 - Allow a header (metadata) under the WEBVTT line.
                        if (/:/.test(line)) {
                            parseHeader(line);
                        }
                        else if (!line) {
                            // An empty line terminates the header and starts the body (cues).
                            self._state = "ID";
                        }
                        continue;
                    case "NOTE":
                        // Ignore NOTE blocks.
                        if (!line) {
                            self._state = "ID";
                        }
                        continue;
                    // @ts-ignore-line
                    case "ID":
                        // Check for the start of NOTE blocks.
                        if (/^NOTE($|[ \t])/.test(line)) {
                            self._state = "NOTE";
                            break;
                        }
                        // 19-29 - Allow any number of line terminators, then initialize new cue values.
                        if (!line) {
                            continue;
                        }
                        self._cue = new types_1.XCue(0, 0, "").toJSON();
                        self._state = "CUE";
                        // 30-39 - Check if self line contains an optional identifier or timing data.
                        if (line.indexOf("-->") === -1) {
                            self._cue.id = line;
                            continue;
                        }
                    // Process line as start of a cue.
                    /*falls through*/
                    case "CUE":
                        // 40 - Collect cue timings and settings.
                        try {
                            (0, parseCue_1["default"])(line, self._cue, self._regionList);
                        }
                        catch (e) {
                            self.reportOrThrowError(e);
                            // In case of an error ignore rest of the cue.
                            self._cue = null;
                            self._state = "BADCUE";
                            continue;
                        }
                        self._state = "CUETEXT";
                        continue;
                    case "CUETEXT":
                        var hasSubstring = line.indexOf("-->") !== -1;
                        // 34 - If we have an empty line then report the cue.
                        // 35 - If we have the special substring '-->' then report the cue,
                        // but do not collect the line as we need to process the current
                        // one as a new cue.
                        if (!line || (hasSubstring && (alreadyCollectedLine = true))) {
                            // We are done parsing self cue.
                            self.onCue && self._cue && self.onCue(self._cue);
                            self._cue = null;
                            self._state = "ID";
                            continue;
                        }
                        if (self._cue.text) {
                            self._cue.text += "\n";
                        }
                        self._cue.text += line;
                        continue;
                    case "BADCUE": // BADCUE
                        // 54-62 - Collect and discard the remaining cue.
                        if (!line) {
                            self._state = "ID";
                        }
                        continue;
                }
            }
        }
        catch (e) {
            self.reportOrThrowError(e);
            // If we are currently parsing a cue, report what we have.
            if (self._state === "CUETEXT" && self._cue && self.onCue) {
                self.onCue(self._cue);
            }
            self._cue = null;
            // Enter BADWEBVTT state if header was not parsed correctly otherwise
            // another exception occurred so enter BADCUE state.
            self._state = self._state === "INITIAL" ? "BADWEBVTT" : "BADCUE";
        }
        return this;
    };
    VTTParser.prototype.flush = function () {
        var self = this;
        try {
            // Finish decoding the stream.
            self._buffer += self._decoder.decode();
            // Synthesize the end of the current cue or region.
            if (self._cue || self._state === "HEADER") {
                self._buffer += "\n\n";
                self.parse();
            }
            // If we've flushed, parsed, and we're still on the INITIAL state then
            // that means we don't have enough of the stream to parse the first
            // line.
            if (self._state === "INITIAL") {
                throw new ParsingError_1["default"](ParsingError_1["default"].Errors.BadSignature);
            }
        }
        catch (e) {
            self.reportOrThrowError(e);
        }
        self.onFlush && self.onFlush();
        return this;
    };
    return VTTParser;
}());
exports["default"] = VTTParser;
