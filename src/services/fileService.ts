import { createReadStream, ReadStream, WriteStream, createWriteStream } from 'node:fs';

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
        if (nextLineBreak === -1) {
          break;
        }
        yield data.slice(0, nextLineBreak + 1);
        data = data.slice(nextLineBreak + 1);
      }
    }
  }
}

export class FileWriter {
  private readonly stream: WriteStream;

  constructor(public filename: string) {
    this.stream = createWriteStream(filename, {
      flags: 'w',
      encoding: 'utf8',
      highWaterMark: 16_000,
      autoClose: true,
    });
  }

  public async writeLine(line: string): Promise<void> {
    if (this.stream.write(`${line}\n`)) {
      return Promise.resolve();
    } else {
      return new Promise((resolve) => {
        this.stream.once('drain', () => resolve());
      });
    }
  }
}
