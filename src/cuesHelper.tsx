import {WebVTT} from 'vtt.js';
import { Cue } from './data/cues';

const setDefaults = (cues:Array<Cue>):Array<Cue> =>
  cues.map(cue => ({
    vertical: '',
    ...cue,
  }))

export const createCuesDiv = (cues:Array<Cue>, element:HTMLDivElement):HTMLDivElement => {
  console.log('creating cues div', cues)
  if (!cues.length) {
    element.innerHTML = "";
    return element;
  }
  const processedCues = setDefaults(cues);
  return WebVTT.processCues(window, processedCues, element);
}

