import { JsonCue, cueKeys, CueKeys } from "../types";

/**
 * Extends the native VTTCue to add a {@link XCue.toJSON | toJSON} method.
 * 
 * A shim is available at {}
 */
class XCue extends VTTCue {

  /**
   * @returns A {@link JsonCue} object for the current cue.
   */
  public toJSON():JsonCue {
    const json:Record<string, unknown> = {};
    cueKeys.forEach((key:CueKeys) => { 
      json[key] = this[key]
    });
    return json as JsonCue;
  }

  public set<K extends CueKeys>(key: K, value: this[K]): void {
    this[key] = value;
  }
}

export default XCue;