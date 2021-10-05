import XCue from "./shared/XCue";
export type { IVTTParser, ParserCommon, IParserOptions } from "./VTTParser/VTTParser";

export const cueKeys = ['align', 'endTime', 'id', 'line', 'lineAlign', 
    'pauseOnExit', 'position', 'positionAlign', 'startTime', 'region', 'size',
    'snapToLines', 'startTime', 'text', 'vertical'] as const;

export type CueKeys = typeof cueKeys[number]
export type JsonCue = Pick<XCue, CueKeys>;
export type CuePropValue = string | number | null | boolean;
export { XCue };
