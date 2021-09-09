import { WebVTT } from 'vtt.js';
import { Cue } from './types';

export const createCuesDiv = (cues:Array<Cue>, element:HTMLDivElement):HTMLDivElement => {
  return WebVTT.processCues(window, cues, element);
}

export const getCuePositions = (element:HTMLDivElement | null) => {
  console.log(element);
  if (!element) return {};
  return {};
}