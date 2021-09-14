import Parser from '../../lib/VTTParser';
import { JsonCue } from '../../lib/types';

export const parseVtt = (vtt:string, onParsed:Function):void => {
  const parsedCues:Array<JsonCue> = [];
  const parsedRegions:Array<VTTRegion> = [];

  const parserSettings = {
    onError: console.log,
    onFlush: () => onParsed({ parsedCues, parsedRegions }),
    onCue: (cue:JsonCue) => parsedCues.push(cue),
    onRegion: (region:VTTRegion) => parsedRegions.push(region),
  };

  const parser = new Parser(parserSettings);

  parser.parse(vtt);
  parser.flush();
}
