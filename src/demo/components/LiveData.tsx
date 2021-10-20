import { Card } from "@material-ui/core";
import ReactJson from "react-json-view";
import { JsonCue } from "../../lib";


const LiveData = (
  { time, currentCues }:
  {time: number, currentCues:Array<JsonCue>}
) =>
  <Card className="meta-container">
    <p><strong>Time:</strong> {time}</p>
    <p><strong>Current cues:</strong></p>
    <ReactJson src={currentCues} />
  </Card>;

export default LiveData;