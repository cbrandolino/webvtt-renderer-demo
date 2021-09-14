import '../shims/VTTCue.shim'
import { JsonCue } from '../types';
import XCue from './XCue';

const serialisedCue = {
  align: "center",
  endTime: 1,
  id: "",
  line: "auto",
  lineAlign: "start",
  pauseOnExit: false,
  position: 50,
  positionAlign: "center",
  region: null,
  size: 50,
  snapToLines: true,
  startTime: 0,
  text: "I am cue",
  track: undefined,
  vertical: "",
} as JsonCue;

describe('XCue', () => {
  let testCue:XCue;

  beforeEach(() => {
    testCue = new XCue(0, 1, 'I am cue');
  });

  it('creates an object of the expected type', () => {
    expect(testCue instanceof VTTCue).toBe(true);
    expect(testCue instanceof XCue).toBe(true);
  });

  describe('toJSON', () => {
    it('serialises the cue into a json object', () => {
      expect(testCue.toJSON()).toEqual(serialisedCue)
    });
  });
});