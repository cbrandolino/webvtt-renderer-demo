import './App.css';
import Player from 'react-player';
import ReactJson from 'react-json-view';
import useCueTrigger from './useCueTrigger';
import { useRef } from 'react';

const App = () => {
  const cueBox = useRef(null);
  const { updateTime, state } = useCueTrigger(cueBox.current);
  return (
    <div className="App">
      <div className="PlayerContainer">
        <Player
          playsInline
          poster="/assets/poster.png"
          url="https://media.w3.org/2010/05/sintel/trailer_hd.mp4"
          onProgress={({playedSeconds}) => updateTime(playedSeconds)}
          controls
          autoplay
        />
        <div id="cueBox" ref={cueBox} />
      </div>

      <ReactJson src={state} />
    </div>
  );
}

export default App;
