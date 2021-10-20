import './App.css';
import '../lib/shims/VTTRegion.shim';

import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';

import FromFile from './components/FromFile';
import Player from './components/Player';
import LiveData from './components/LiveData';
import RenderExamples from './components/RenderExamples';
import useCues from './vtt/useCues';
import { rawVtt } from './data/cues';
import TabPanels from './components/TabPanels';
import { useState } from 'react';

const App = () => {
  const [source, setSource] = useState(rawVtt);
  const { updateTime, state, cueBoxRef } = useCues(source);

  const { time, currentCues, parsedCues, parsedRegions } = state;

  return (
    <Container>
      <Grid item xs={12}>
        <h1>vtt.js demo</h1>
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs={6}>
          <Player ref={cueBoxRef} updateTime={updateTime} />
        </Grid>
        <Grid item xs={6}>
          <LiveData time={time} currentCues={currentCues} />
        </Grid>
        <Grid item xs={12}>
          <TabPanels labels={['parser', 'render examples']}>
            <FromFile {...{ parsedCues, parsedRegions, rawVtt }} />
            <RenderExamples onSourceChange={setSource}></RenderExamples>
          </TabPanels>
        </Grid>
      </Grid>
    </Container>
  );
}

export default App;
