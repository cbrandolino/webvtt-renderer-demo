import './App.css';
import Player from 'react-player';
import ReactJson from 'react-json-view';
import useCueTrigger from './useCueTrigger';

const App = () => {
  const { updateTime, state } = useCueTrigger();
  return (
    <div className="App">
      <Player
        playsInline
        poster="/assets/poster.png"
        url="https://media.w3.org/2010/05/sintel/trailer_hd.mp4"
        onProgress={({playedSeconds}) => updateTime(playedSeconds)}
        controls
      />
      <ReactJson src={state} />
    </div>
  );
}

export default App;
