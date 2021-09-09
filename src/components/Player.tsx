import { forwardRef } from 'react';
import RPlayer from 'react-player';


const Player = forwardRef<HTMLDivElement, { updateTime: (seconds: number) => void}>((
  { updateTime },
  cueBoxRef
) =>
  <div className="PlayerContainer">
    <RPlayer
      playsInline
      poster="/assets/poster.png"
      url="https://media.w3.org/2010/05/sintel/trailer_hd.mp4"
      onProgress={({playedSeconds}) => updateTime(playedSeconds)}
      width="100%"
      height={300}
      controls
    />
    <div id="cueBox" ref={cueBoxRef} />
  </div>);

export default Player;