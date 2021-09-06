import { WebVTT } from 'vtt.js';
import { pick } from 'lodash';

export type Cue =  {
  id: string,
  startTime: number,
  endTime: number,
  align: string,
  line: string,
  lineAlign: string,
  position: string,
  positionAlign: string,
  size: number,
  snapToLines: boolean,
  vertical: string,
  text: string,
} 

const cueProps = [ 'id', 'startTime', 'endTime', 'align', 'line', 'lineAlign', 'position', 'positionAlign', 'size', 'vertical', 'text' ]

export const parseVtt = (vtt:string, onParsed:Function):void => {
  const parser = new WebVTT.Parser(window, WebVTT.StringDecoder());
  const cueObjects:Array<Cue> = [];
  parser.onparsingerror = console.log;
  parser.onflush = () => {
    onParsed(cueObjects);
  }
  parser.oncue = (cue:VTTCue) => {
    console.log(cue)
    cueObjects.push(pick(cue, cueProps) as Cue);
  }
  parser.parse(vtt);
  parser.flush();
}


export const createCuesDiv = (cues:Array<Cue>, element:HTMLDivElement):HTMLDivElement => {
  return WebVTT.processCues(window, cues, element);
}

