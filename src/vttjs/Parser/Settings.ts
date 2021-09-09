import { CuePropValue } from './types';

// A settings object holds key/value pairs and will ignore anything but the first
// assignment to a specific key.
interface ISettings {
  values: Object;
  set: (k: string, v: unknown) => void;
}

type Defaults = Record<string, CuePropValue>|CuePropValue;

class Settings implements ISettings {
  values = Object.create(null);

  set(k:string, v:unknown) {
    if (!this.get(k) && v !== "") {
      this.values[k] = v;
    }
  }

  // Return the value for a key, or a default value.
  // If 'defaultKey' is passed then 'dflt' is assumed to be an object with
  // a number of possible default values as properties where 'defaultKey' is
  // the key of the property that will be chosen; otherwise it's assumed to be
  // a single value.
  get(k:string, dflt?:Defaults, defaultKey?:string) {
    const defaultValue = (defaultKey && (dflt instanceof Object)) ? dflt[defaultKey] : dflt;
    return this.has(k) ? this.values[k] : defaultValue;
  }

  // Check whether we have a value for a key.
  has(k:string) {
    return k in this.values;
  }

  // Accept a setting if its one of the given alternatives.
  alt(k:string, v:unknown, a:Array<unknown>) {
    for (var n = 0; n < a.length; ++n) {
      if (v === a[n]) {
        this.set(k, v);
        break;
      }
    }
  }

  // Accept a setting if its a valid (signed) integer.
  integer(k:string, v:string) {
    if (/^-?\d+$/.test(v)) { // integer
      this.set(k, parseInt(v, 10));
    }
  }

  // Accept a setting if its a valid percentage.
  percent(k:string, v:string) {
    if ((v.match(/^([\d]{1,3})(\.[\d]*)?%$/))) {
      const vFloat = parseFloat(v);
      if (vFloat >= 0 && vFloat <= 100) {
        this.set(k, vFloat);
        return true;
      }
    }
    return false;
  }
  
}

export default Settings;