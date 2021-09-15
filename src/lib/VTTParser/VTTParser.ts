import Settings from './Settings';

import parseOptions from './parseOptions';
import ParsingError from './ParsingError';
import parseCue from './parseCue';
import { XCue } from '..';
import { JsonCue } from '../types';
import { IParseRegion } from './parseRegion';

interface IParserConstructor {
  onError?: (e:Error) => void;
  onRegion?: (region:VTTRegion) => void;
  onCue?: (cue:JsonCue) => void;
  onFlush?: () => void;
  parseRegion?: (regionProps:IParseRegion) => void;
};

interface IVTTParser extends IParserConstructor {
  parse: (data?:BufferSource) => IVTTParser,
}

type ParserState = "INITIAL" | "HEADER" | "NOTE" | "ID" | "CUE" | "BADCUE" | "CUETEXT" | "BADWEBVTT";

class VTTParser implements IVTTParser {
  state:ParserState = "INITIAL";
  buffer:string = "";
  decoder:TextDecoder = new TextDecoder("utf8");
  cue:JsonCue|null;
  regionList:Array<{ id:string, region: VTTRegion}>
  onError;
  onRegion;
  onCue;
  onFlush;
  parseRegion?:(regionProps:IParseRegion) => void;

  constructor({ onError, onRegion, onCue, onFlush, parseRegion }:IParserConstructor){
    this.onError = onError;
    this.onRegion = onRegion;
    this.onCue = onCue;
    this.onFlush = onFlush;
    this.cue = null;
    this.regionList = [];
    this.parseRegion = parseRegion;
  }

  private reportOrThrowError(e:Error|unknown) {
    if (e instanceof ParsingError) {
      this.onError && this.onError(e);
    } else {
      throw e;
    }
  }

  public parse(data?:BufferSource|string) {
    var self = this;

    // If there is no data then we won't decode it, but will just try to parse
    // whatever is in buffer already. This may occur in circumstances, for
    // example when flush() is called.
    if (data) {
      // Try to decode the data that we received.
      self.buffer += (typeof data === 'string') ?
         data:
         self.decoder.decode(data, {stream: true});
    }

    function collectNextLine() {
      var buffer = self.buffer;
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
      self.buffer = buffer.substr(pos);
      return line;
    }

    // 3.2 WebVTT metadata header syntax
    function parseHeader(input:string) {
      parseOptions(input, function (k, v) {
        switch (k) {
        case "Region":
          // 3.3 WebVTT region metadata header syntax
          self.parseRegion && self.parseRegion({
            input: v,
            regionList: self.regionList,
            onRegion: self.onRegion
          });
          break;
        }
      }, /:/);
    }

    // 5.1 WebVTT file parsing.
    try {
      let line = '';
      if (self.state === "INITIAL") {
        // We can't start parsing until we have the first line.
        if (!/\r\n|\n/.test(self.buffer)) {
          return this;
        }

        line = collectNextLine();

        var m = line.match(/^WEBVTT([ \t].*)?$/);
        if (!m || !m[0]) {
          throw new ParsingError(ParsingError.Errors.BadSignature);
        }

        self.state = "HEADER";
      }

      var alreadyCollectedLine = false;
      while (self.buffer) {
        // We can't parse a line until we have the full line.
        if (!/\r\n|\n/.test(self.buffer)) {
          return this;
        }

        if (!alreadyCollectedLine) {
          line = collectNextLine();
        } else {
          alreadyCollectedLine = false;
        }

        switch (self.state) {
        case "HEADER":
          // 13-18 - Allow a header (metadata) under the WEBVTT line.
          if (/:/.test(line)) {
            parseHeader(line);
          } else if (!line) {
            // An empty line terminates the header and starts the body (cues).
            self.state = "ID";
          }
          continue;
        case "NOTE":
          // Ignore NOTE blocks.
          if (!line) {
            self.state = "ID";
          }
          continue;
        // @ts-ignore-line
        case "ID":
          // Check for the start of NOTE blocks.
          if (/^NOTE($|[ \t])/.test(line)) {
            self.state = "NOTE";
            break;
          }
          // 19-29 - Allow any number of line terminators, then initialize new cue values.
          if (!line) {
            continue;
          }
          self.cue = new XCue(0, 0, "").toJSON();
          self.state = "CUE";
          // 30-39 - Check if self line contains an optional identifier or timing data.
          if (line.indexOf("-->") === -1) {
            self.cue.id = line;
            continue;
          }
          // Process line as start of a cue.
          /*falls through*/
        case "CUE":
          // 40 - Collect cue timings and settings.
          try {
            parseCue(line, self.cue!, self.regionList);
          } catch (e:unknown) {
            self.reportOrThrowError(e);
            // In case of an error ignore rest of the cue.
            self.cue = null;
            self.state = "BADCUE";
            continue;
          }
          self.state = "CUETEXT";
          continue;
        case "CUETEXT":
          var hasSubstring = line.indexOf("-->") !== -1;
          // 34 - If we have an empty line then report the cue.
          // 35 - If we have the special substring '-->' then report the cue,
          // but do not collect the line as we need to process the current
          // one as a new cue.
          if (!line || (hasSubstring && (alreadyCollectedLine = true))) {
            // We are done parsing self cue.
            self.onCue && self.cue && self.onCue(self.cue);
            self.cue = null;
            self.state = "ID";
            continue;
          }
          if (self.cue!.text) {
            self.cue!.text += "\n";
          }
          self.cue!.text += line;
          continue;
        case "BADCUE": // BADCUE
          // 54-62 - Collect and discard the remaining cue.
          if (!line) {
            self.state = "ID";
          }
          continue;
        }
      }
    } catch (e) {
      self.reportOrThrowError(e);

      // If we are currently parsing a cue, report what we have.
      if (self.state === "CUETEXT" && self.cue && self.onCue) {
        self.onCue(self.cue as XCue);
      }
      self.cue = null;
      // Enter BADWEBVTT state if header was not parsed correctly otherwise
      // another exception occurred so enter BADCUE state.
      self.state = self.state === "INITIAL" ? "BADWEBVTT" : "BADCUE";
    }
    return this;
  }

  flush() {
    var self = this;
    try {
      // Finish decoding the stream.
      self.buffer += self.decoder.decode();
      // Synthesize the end of the current cue or region.
      if (self.cue || self.state === "HEADER") {
        self.buffer += "\n\n";
        self.parse();
      }
      // If we've flushed, parsed, and we're still on the INITIAL state then
      // that means we don't have enough of the stream to parse the first
      // line.
      if (self.state === "INITIAL") {
        throw new ParsingError(ParsingError.Errors.BadSignature);
      }
    } catch(e) {
      self.reportOrThrowError(e);
    }
    self.onFlush && self.onFlush();
    return this;
  }
}

export default VTTParser;