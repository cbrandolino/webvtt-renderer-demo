import { VTTParser, JsonCue } from '../../lib/';

export const parseVtt = (vtt:string, onParsed:Function):void => {
  const parsedCues:Array<JsonCue> = [];
  const parsedRegions:Array<VTTRegion> = [];

  const parserSettings = {
    onError: console.log,
    onFlush: () => onParsed({ parsedCues, parsedRegions }),
    onCue: (cue:JsonCue) => parsedCues.push(cue),
  };

  const parser = new VTTParser(parserSettings);

  parser.parse(vtt);
  parser.flush();
}
