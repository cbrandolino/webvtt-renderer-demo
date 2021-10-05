# vtt.ts

TypeScript reimplementation / extension of Mozilla's vtt.js.


## Demo

Run the demo with `npm start`.

The parsed result will be in the "Parsed" tab.

## Documentation

### Api documentation

[webvtt.js typedoc page](https://cbrandolino.github.io/webvtt.ts/docs).

### Development

The library source can be found in `/src/lib`, and a demo in `src/demo`.

Currently only the parser is implemented.

### Scripts

- `npm start`: runs the demo app;
- `npm run build`: builds the library to `/lib`;
- `npm run build:docs`: builds the typedoc documentation to `docs`;

### Dependencies

None.

## Examples

If your system does not provide the `VTTCue` or `VTTRegion`, you can include the shims in `lib/shims`.

### Basic usage

The most important options are `onFlush` (called after `parser.flush` is called, 
and all the vtt chunks have been parsed) and `onCue` (called as each cue is parsed).

[Full list of options](https://cbrandolino.github.io/webvtt.ts/docs/interfaces/types.IParserOptions.html)


```typescript
import { VTTParser, JsonCue } from '../lib/';

const vtt:string; // A string with a (part of) a vtt file
const parsedCues:Array<JsonCue> = [];
const parsedRegions:Array<VTTRegion> = [];

const parserSettings = {
    onFlush: () => console.log('Done! Result: ', parsedCues);
    onCue: (cue:JsonCue) => parsedCues.push(cue),
};

const parser = new VTTParser(parserSettings);

parser.parse(vtt);
parser.flush();
```

### Streaming

You can parse your vtt in chunks by calling `parser.parse` repeatedly before calling `parser.flush`.

In this case, if there are chunks still to be parsed / reordered, the `onFlush` callback will only
be called once all of these operations are done

```typescript
...

chunks.each((chunk) => parser.parse(chunk));
parser.flush();
```