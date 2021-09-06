import { Reducer, useReducer, useEffect } from 'react'
import { createCuesDiv, parseVtt } from './cuesHelper';
import { Cue } from './cuesHelper';

interface ICueState {
  time:number,
  currentCues:Array<Cue>,
  parsedCues:Array<Cue>;
}

const initialState = {
  time: 0,
  currentCues: [],
  parsedCues: [],
};

const getCurrentCues = (time:number, parsedCues:Array<Cue>):Array<Cue> => 
  parsedCues.filter(({ startTime, endTime }) => time >= startTime && time < endTime);

const cueReducer:Reducer<ICueState, {type: string, payload: any}> = (state, action) => {
  switch (action.type) {
    case 'updateTime':
      return {
        ...state,
        time: action.payload,
        currentCues: getCurrentCues(action.payload, state.parsedCues),
      };
    case 'loadCues':
      return {
        ...state,
        parsedCues: action.payload
      };
    default:
      return state;
    }
}

const useCues = (element: HTMLDivElement | null, source:string) => {
  const [state, dispatch] = useReducer(cueReducer, initialState);
  const updateTime = (time:number) => dispatch({ type: 'updateTime', payload: time });
  const parserCallback = (cues:Array<Cue>) => dispatch({ type: 'loadCues', payload: cues });

  useEffect(() => {
    parseVtt(source, parserCallback);
  }, []);

  useEffect(() => {
    if (element) {
      createCuesDiv(state.currentCues, element)
    }
  }, [state.currentCues]);

  return { updateTime, state };
}

export default useCues;