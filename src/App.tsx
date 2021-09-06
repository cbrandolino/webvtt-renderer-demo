import './App.css';
import Player from 'react-player';
import ReactJson from 'react-json-view';
import useCues from './useCueTrigger';
import { useEffect, useRef, useState } from 'react';
import { parseVtt } from './cuesHelper';
import { rawVtt } from './data/cues';

const App = () => {
  const cueBox = useRef(null);
  const { updateTime, state } = useCues(cueBox.current, rawVtt);

  return (
    <div className="App">
      <div className="PlayerContainer">
        <Player
          playsInline
          poster="/assets/poster.png"
          url="https://media.w3.org/2010/05/sintel/trailer_hd.mp4"
          onProgress={({playedSeconds}) => updateTime(playedSeconds)}
          controls
        />
        <div id="cueBox" ref={cueBox} />
      </div>

      <ReactJson src={state} />
    </div>
  );
}

export default App;
