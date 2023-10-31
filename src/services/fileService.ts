import { createReadStream, ReadStream } from 'node:fs';

export class FileReader {
  private readonly stream: ReadStream;

  constructor(public filename: string) {
    this.stream = createReadStream(this.filename, {
      highWaterMark: 16_000,
      encoding: 'utf-8',
    });
  }

  public async *readStrings(): AsyncGenerator<string> {
    let data = '';
    let nextLineBreak = -1;

    for await (const chunk of this.stream) {
      data += chunk.toString();
      while (true) {
        nextLineBreak = data.indexOf('\n');
        if (nextLineBreak == -1) {
          break;
        }
        yield data.slice(0, nextLineBreak + 1);
        data = data.slice(nextLineBreak + 1);
      }
    }
  }
}
