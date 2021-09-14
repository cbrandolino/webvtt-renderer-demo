import { WebVTT } from 'vtt.js';
import { JsonCue } from '../../lib/types';

export const createCuesDiv = (cues:Array<JsonCue>, element:HTMLDivElement):HTMLDivElement => {
  return WebVTT.processCues(window, cues, element);
}

export const getCuePositions = (element:HTMLDivElement | null) => {
  if (!element) return {};
  return {};
}