export type Cue =  {
  start: number,
  end: number,
  cue: {
    props: Object,
    text: string,
  }
} 

export default [
  {
    start: 0,
    end: 100,
    cue: {
      props: {},
      text: 'Just a basic subtitle'
    }
  }
]