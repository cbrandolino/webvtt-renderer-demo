import { ReactFragment, Reducer, useReducer, ReducerAction } from 'react'
import cues, { Cue } from './data/cues';

interface ICueState {
  time:number,
  cues:Array<object>,
}

const initialState = {
  time: 0,
  cues: [],
};

const getCueArray = (time:number):Array<Cue> => cues.filter(({ start, end }) => time > start && time < end)

const cueReducer:Reducer<ICueState, {type: string, payload: any}> = (state, action) => {
  switch (action.type) {
    case 'updateTime':
      return {
        time: action.payload,
        cues: getCueArray(action.payload),
      };
    default:
      return state;
    }
}

const useCueTrigger = () => {
  const [state, dispatch] = useReducer(cueReducer, initialState);
  const updateTime = (time:number) => dispatch({ type: 'updateTime', payload: time });
  return { updateTime, state };
}

export default useCueTrigger;