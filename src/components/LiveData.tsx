import { Card } from "@material-ui/core";
import ReactJson from "react-json-view";
import { Cue } from "../vtt/types";


const LiveData = (
  { time, currentCues }:
  {time: number, currentCues:Array<Cue>}
) =>
  <Card className="meta-container">
    <p><strong>Time:</strong> {time}</p>
    <p><strong>Current cues:</strong></p>
    <ReactJson src={currentCues} />
  </Card>;

export default LiveData;