import { Grid } from "@material-ui/core";
import ReactJson from "react-json-view";
import { Cue } from "../vtt/types";

const ParserOutput = (
  {parsedCues, parsedRegions}:
  {parsedCues:Array<Cue>, parsedRegions:Array<VTTRegion>}  
) =>
  <Grid container spacing={3}>
    <Grid item xs={6}>
      <h2>Cues</h2>
      <ReactJson src={parsedCues} />
    </Grid>
    <Grid item xs={6}>
      <h2>Regions</h2>
      <ReactJson src={parsedRegions} />
    </Grid>
  </Grid>;

export default ParserOutput;