import { nanoid } from 'nanoid';
import multer, { diskStorage } from 'multer';
import { extension } from 'mime-types';
import { NextFunction, Request, Response } from 'express';
import { IMiddleware } from './middleware-interface.js';

export class UploadFileMiddleware implements IMiddleware {
  private readonly uploadDirectory: string;
  private readonly fieldName: string;

  constructor(
    uploadDirectory: string,
    fieldName: string,
  ) {
    this.uploadDirectory = uploadDirectory;
    this.fieldName = fieldName;
  }

  public async execute(request: Request, response: Response, next: NextFunction): Promise<void> {

    const storage = diskStorage({
      destination: this.uploadDirectory,
      filename: (_req, file, callback) => {
        const fileExtension = extension(file.mimetype);
        const filename = nanoid();
        callback(null, `${filename}.${fileExtension}`);
      },
    });

    const uploadSingleFileMiddleware = multer({ storage }).single(this.fieldName);
    uploadSingleFileMiddleware(request, response, next);
  }
}
