import { WebVTT } from 'vtt.js';
import { pick } from 'lodash';

import { Cue, cueKeys } from './types';

export const parseVtt = (vtt:string, onParsed:Function):void => {
  const parser = new WebVTT.Parser(window, WebVTT.StringDecoder());

  const parsedCues:Array<Cue> = [];
  const parsedRegions:Array<VTTRegion> = [];

  parser.onparsingerror = console.log;

  parser.onflush = () => onParsed({ parsedCues, parsedRegions })

  parser.oncue = (cue:VTTCue) => {
    parsedCues.push(pick(cue, cueKeys) as Cue);
  }
  parser.onregion = (region:VTTRegion) => parsedRegions.push(region);

  parser.parse(vtt);
  parser.flush();
}
