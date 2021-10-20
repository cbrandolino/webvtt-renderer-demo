import { Button, Card, Grid, TextField } from "@material-ui/core";
import ReactJson from "react-json-view";
import { JsonCue } from "../../lib";
import exampleCues from "../data/exampleCues";
import TabPanels from "./TabPanels";

const titles = exampleCues.map(({ title }) => title);

const prepareVtt = (index) => 
`WEBVTT

${exampleCues[index].content}
`;

const RenderExamples = (
  { onSourceChange }:
  { onSourceChange: (string) => void }  
) => {
  const handleSourceChange = (index) => onSourceChange(prepareVtt((index)));
  
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <TabPanels orientation="vertical" labels={titles} onChange={handleSourceChange}>
          {
            exampleCues.map(({ content }) => <pre>{content}</pre>)
          }
        </TabPanels>
      </Grid>
    </Grid>
  );
}
  
export default RenderExamples;