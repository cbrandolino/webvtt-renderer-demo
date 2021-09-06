import { ReactFragment, Reducer, useReducer, useEffect } from 'react'
import { createCuesDiv } from './cuesHelper';
import cues, { Cue } from './data/cues';

interface ICueState {
  time:number,
  cues:Array<Cue>,
}

const initialState = {
  time: 0,
  cues: [],
};

const getCueArray = (time:number):Array<Cue> => cues.filter(({ startTime, endTime }) => time >= startTime && time < endTime);

const cueReducer:Reducer<ICueState, {type: string, payload: any}> = (state, action) => {
  switch (action.type) {
    case 'updateTime':
      const newState = {
        time: action.payload,
        cues: getCueArray(action.payload),
      };
      return newState;
    default:
      return state;
    }
}

const useCueTrigger = (element: HTMLDivElement | null) => {
  const [state, dispatch] = useReducer(cueReducer, initialState);
  const updateTime = (time:number) => dispatch({ type: 'updateTime', payload: time });
  useEffect(() => {
    if (element) {
      createCuesDiv(state.cues, element);
    }
  }, [state.cues, element])

  return { updateTime, state };
}

export default useCueTrigger;