import { Grid } from "@material-ui/core";
import ReactJson from "react-json-view";
import { JsonCue } from "../../lib";

const ParserOutput = (
  {parsedCues, rawVtt }:
  {parsedCues:Array<JsonCue>, rawVtt:string}  
) =>
  <Grid container spacing={3}>
    <Grid item xs={6}>
      <h2>Source</h2>
      <pre className="source-container">{rawVtt}</pre>
    </Grid>
    <Grid item xs={6}>
      <h2>Parsed</h2>
      <ReactJson src={parsedCues} />
    </Grid>
  </Grid>;

export default ParserOutput;