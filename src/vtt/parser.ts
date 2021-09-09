import Parser from '../vttjs/Parser';
import { pick } from 'lodash';

import { Cue, cueKeys } from './types';

export const parseVtt = (vtt:string, onParsed:Function):void => {
  const parsedCues:Array<Cue> = [];
  const parsedRegions:Array<VTTRegion> = [];

  const parserSettings = {
    onError: console.log,
    onFlush: () => onParsed({ parsedCues, parsedRegions }),
    onCue: (cue:VTTCue) => parsedCues.push(pick(cue, cueKeys) as Cue),
    onRegion: (region:VTTRegion) => parsedRegions.push(region),
  };

  const parser = new Parser(parserSettings);

  parser.parse(vtt);
  parser.flush();
}
