export type Cue =  {
  startTime: number,
  endTime: number,
  vertical?: string,
  text: string,
} 

export default [
  {
    startTime: 0,
    endTime: 2,
    text: 'Just a basic subtitle'
  },
  {
    startTime: 1,
    endTime: 3,
    text: 'here is another'
  },
]