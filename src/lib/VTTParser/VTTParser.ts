import parseOptions from './parseOptions';
import ParsingError from './ParsingError';
import parseCue from './parseCue';
import { XCue, JsonCue } from '../types';
import { IParseRegion } from './parseRegion';

export type ParserCommon = {
  /**
   * Callback for parsing errors
   */
  onError?: (e:Error) => void;
  /**
   * Called with a {@link JsonCue} once each cue has been correctly parsed.
   * 
   */
  onCue?: (cue:JsonCue) => void;
  /**
   * Will be called called after:
   * 1. {@link VTTParser.flush} has been called;
   * 2. All cues have been parsed.
   */
  onFlush?: () => void;
  /**
   * Called once each region has been parsed. Only works 
   * if a {@link IParserOptions.parseRegion | parseRegion} function has been provided.
   */
  onRegion?: (region:VTTRegion) => void;
  /**
   * A parser for regions. Regions will only be parsed if this parser is provided.
   * As the feature is rarely used, we didn't include it by default.
   * You can simply import and pass down the provided {@link parseRegion} function.
   */
  parseRegion?: (regionProps:IParseRegion) => void;
}

export interface IParserOptions extends ParserCommon {
  /**
   * The decoder used for parsing BufferSources in {@link  IVTTParser.parse}
   * 
   * @default new TextDecoder("utf-8");
   */
  decoder?: TextDecoder
};

export interface IVTTParser extends ParserCommon {
  /**
   * Parses the provided string or buffer source
   */
  parse: (data?:BufferSource|string) => void,
  /**
   * Completes the remaining parsing operations and, once these are over, calls the
   * {@link IParserOptions.onFlush | onFlush} option if provided.
   */
  flush: () => void,
}

type ParserState = "INITIAL" | "HEADER" | "NOTE" | "ID" | "CUE" | "BADCUE" | "CUETEXT" | "BADWEBVTT";

/**
 * The main parser class.
 */
class VTTParser implements IVTTParser {
  onError;
  onRegion;
  onCue;
  onFlush;
  parseRegion?:(regionProps:IParseRegion) => void;

  private _state:ParserState = "INITIAL";
  private _buffer:string = "";
  private _decoder:TextDecoder;
  private _cue:JsonCue|null;
  private _regionList:Array<{ id:string, region: VTTRegion}> = [];

  /**
   * 
   * @param settings
   */
  constructor({ onError, onRegion, onCue, onFlush, parseRegion, decoder }:IParserOptions){
    this.onError = onError;
    this.onRegion = onRegion;
    this.onCue = onCue;
    this.onFlush = onFlush;
    this._cue = null;
    this.parseRegion = parseRegion;
    this._decoder = decoder || new TextDecoder("utf-8");
  }

  private reportOrThrowError(e:Error|unknown) {
    if (e instanceof ParsingError) {
      this.onError && this.onError(e);
    } else {
      throw e;
    }
  }

  /**
   * Parse header metadata (in this case, just regions)
   * 
   * @param input 
   */
  private _parseHeader = (input:string):void => {
    parseOptions(input, (k, v) => {
      switch (k) {
      case "Region":
        // 3.3 WebVTT region metadata header syntax
        this.parseRegion && this.parseRegion({
          input: v,
          regionList: this._regionList,
          onRegion: this.onRegion
        });
        break;
      }
    }, /:/);
  }

  private _collectNextLine = ():string => {
    var buffer = this._buffer;
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
    this._buffer = buffer.substr(pos);
    return line;
  }

  
  public parse = (data?:BufferSource|string):void => {
    // If there is no data then we won't decode it, but will just try to parse
    // whatever is in buffer already. This may occur in circumstances, for
    // example when flush() is called.
    if (data) {
      // Try to decode the data that we received.
      this._buffer += (typeof data === 'string') ?
         data:
         this._decoder.decode(data, {stream: true});
    }

    // 5.1 WebVTT file parsing.
    try {
      let line = '';
      if (this._state === "INITIAL") {
        // We can't start parsing until we have the first line.
        if (!/\r\n|\n/.test(this._buffer)) {
          return;
        }

        line = this._collectNextLine();

        var m = line.match(/^WEBVTT([ \t].*)?$/);
        if (!m || !m[0]) {
          throw new ParsingError(ParsingError.Errors.BadSignature);
        }

        this._state = "HEADER";
      }

      var alreadyCollectedLine = false;
      while (this._buffer) {
        // We can't parse a line until we have the full line.
        if (!/\r\n|\n/.test(this._buffer)) {
          return;
        }

        if (!alreadyCollectedLine) {
          line = this._collectNextLine();
        } else {
          alreadyCollectedLine = false;
        }

        switch (this._state) {
        case "HEADER":
          // 13-18 - Allow a header (metadata) under the WEBVTT line.
          if (/:/.test(line)) {
            this._parseHeader(line);
          } else if (!line) {
            // An empty line terminates the header and starts the body (cues).
            this._state = "ID";
          }
          continue;
        case "NOTE":
          // Ignore NOTE blocks.
          if (!line) {
            this._state = "ID";
          }
          continue;
        // @ts-ignore-line
        case "ID":
          // Check for the start of NOTE blocks.
          if (/^NOTE($|[ \t])/.test(line)) {
            this._state = "NOTE";
            break;
          }

          // 19-29 - Allow any number of line terminators, then initialize new cue values.
          if (!line) continue;
          
          this._cue = new XCue(0, 0, "").toJSON();
          this._state = "CUE";

          // 30-39 - Check if self line contains an optional identifier or timing data.
          if (line.indexOf("-->") === -1) {
            this._cue.id = line;
            continue;
          }
          // Process line as start of a cue.
          
          /*falls through*/
        case "CUE":
          // 40 - Collect cue timings and settings.
          try {
            parseCue(line, this._cue!, this._regionList);
          } catch (e:unknown) {
            this.reportOrThrowError(e);
            // In case of an error ignore rest of the cue.
            this._cue = null;
            this._state = "BADCUE";
            continue;
          }
          this._state = "CUETEXT";
          continue;
        case "CUETEXT":
          var hasSubstring = line.indexOf("-->") !== -1;
          // 34 - If we have an empty line then report the cue.
          // 35 - If we have the special substring '-->' then report the cue,
          // but do not collect the line as we need to process the current
          // one as a new cue.
          if (!line || (hasSubstring && (alreadyCollectedLine = true))) {
            // We are done parsing self cue.
            this.onCue && this._cue && this.onCue(this._cue);
            this._cue = null;
            this._state = "ID";
            continue;
          }
          if (this._cue!.text) {
            this._cue!.text += "\n";
          }
          this._cue!.text += line;
          continue;
        case "BADCUE": // BADCUE
          // 54-62 - Collect and discard the remaining cue.
          if (!line) {
            this._state = "ID";
          }
          continue;
        }
      }
    } catch (e) {
      this.reportOrThrowError(e);

      // If we are currently parsing a cue, report what we have.
      if (this._state === "CUETEXT" && this._cue && this.onCue) {
        this.onCue(this._cue as XCue);
      }
      this._cue = null;
      // Enter BADWEBVTT state if header was not parsed correctly otherwise
      // another exception occurred so enter BADCUE state.
      this._state = this._state === "INITIAL" ? "BADWEBVTT" : "BADCUE";
    }
  }

  public flush = ():void => {
    try {
      // Finish decoding the stream.
      this._buffer += this._decoder.decode();
      // Synthesize the end of the current cue or region.
      if (this._cue || this._state === "HEADER") {
        this._buffer += "\n\n";
        this.parse();
      }
      // If we've flushed, parsed, and we're still on the INITIAL state then
      // that means we don't have enough of the stream to parse the first
      // line.
      if (this._state === "INITIAL") {
        throw new ParsingError(ParsingError.Errors.BadSignature);
      }
    } catch(e) {
      this.reportOrThrowError(e);
    }
    this.onFlush && this.onFlush();
  }
}

export default VTTParser;