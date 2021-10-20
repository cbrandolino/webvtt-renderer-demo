import { Reducer, useReducer, useEffect, useRef } from 'react'
import { createCuesDiv } from './renderer';
import { parseVtt } from './parser';
import { JsonCue } from '../../lib/types';

interface ICueState {
  time:number,
  currentCues:Array<JsonCue>,
  parsedCues:Array<JsonCue>;
  parsedRegions:Array<VTTRegion>;
}

const initialState = {
  time: 0,
  currentCues: [],
  parsedCues: [],
  parsedRegions: [],
};

const getCurrentCues = (time:number, parsedCues:Array<JsonCue>):Array<JsonCue> => 
  parsedCues.filter(({ startTime, endTime }) => time >= startTime && time < endTime);

const cueReducer:Reducer<ICueState, {type: string, payload: any}> = (state, action) => {
  switch (action.type) {
    case 'updateTime':
      return {
        ...state,
        time: action.payload,
        currentCues: getCurrentCues(action.payload, state.parsedCues),
      };
    case 'loadData':
      return {
        ...state,
        ...action.payload
      };
    default:
      return state;
    }
}

const useCues = (source:string) => {
  const cueBoxRef = useRef<HTMLDivElement>(null);
  const [state, dispatch] = useReducer(cueReducer, initialState);
  const updateTime = (time:number) => dispatch({ type: 'updateTime', payload: time });
  const parserCallback = (data:{ parsedCues:Array<JsonCue> }) =>
    dispatch({ type: 'loadData', payload: data });

  useEffect(() => {
    console.log({ source })
    source && parseVtt(source, parserCallback);
  }, [source]);

  useEffect(() => {
    if (cueBoxRef.current) {
      createCuesDiv(state.currentCues, cueBoxRef.current);
    }
  }, [state.currentCues, source]);
 
  return { updateTime, state, cueBoxRef };
}

export default useCues;