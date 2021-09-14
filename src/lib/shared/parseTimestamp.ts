function parseTimeStamp(input:string):number|null {

  function computeSeconds(h:number, m:number, s:number, f:number) {
    return (h | 0) * 3600 + (m | 0) * 60 + (s | 0) + (f | 0) / 1000;
  }

  var matches = input.match(/^(\d+):(\d{2})(:\d{2})?\.(\d{3})/);
  if (!matches) {
    return null;
  }

  const m = matches.map(x => parseInt(x.replace(':', '')))

  if (m[3]) {
    // Timestamp takes the form of [hours]:[minutes]:[seconds].[milliseconds]
    return computeSeconds(m[1], m[2], m[3], m[4]);
  } else if (m[1] > 59) {
    // Timestamp takes the form of [hours]:[minutes].[milliseconds]
    // First position is hours as it's over 59.
    return computeSeconds(m[1], m[2], 0,  m[4]);
  } else {
    // Timestamp takes the form of [minutes]:[seconds].[milliseconds]
    return computeSeconds(0, m[1], m[2], m[4]);
  }
}

export default parseTimeStamp;
