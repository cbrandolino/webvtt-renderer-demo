import { JsonCue, cueKeys, CueKeys } from "../types";

class XCue extends VTTCue {
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

//@ts-ignore-next
window.XCue = XCue;

export default XCue;