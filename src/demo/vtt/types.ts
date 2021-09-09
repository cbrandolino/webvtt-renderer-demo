export type Cue =  {
  id: string,
  startTime: number,
  endTime: number,
  align: string,
  line: string,
  lineAlign: string,
  position: string,
  positionAlign: string,
  size: number,
  snapToLines: boolean,
  vertical: string,
  text: string,
  region: VTTRegion,
} 

export const cueKeys = [ 'id', 'startTime', 'endTime', 'align', 'line', 'lineAlign', 'position', 'positionAlign', 'size', 'vertical', 'text', 'region' ]
