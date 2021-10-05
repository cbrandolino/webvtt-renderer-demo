import XCue from "./shared/XCue";
export type { IVTTParser, ParserCommon, IParserOptions } from "./VTTParser/VTTParser";
export type { IParseRegion } from './VTTParser/parseRegion';

export const cuePropKeys = ['align', 'endTime', 'id', 'line', 'lineAlign', 
    'pauseOnExit', 'position', 'positionAlign', 'startTime', 'region', 'size',
    'snapToLines', 'startTime', 'text', 'vertical'] as const;

export type CueKeys = typeof cuePropKeys[number]
export type JsonCue = Pick<VTTCue, CueKeys>;
export type CuePropValue = string | number | null | boolean;
export { XCue };
