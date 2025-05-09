declare module 'segmentit' {
  export default class Segment {
    useDefault(): void;
    doSegment(text: string, options?: { simple?: boolean }): string[];
  }
} 