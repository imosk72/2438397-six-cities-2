import got from 'got';
import { MockData } from '../models/mock-data.js';

export class HttpService {
  public async getMockData(url: string): Promise<MockData> {
    try {
      return await got.get(url).json();
    } catch {
      return {
        titles: ['name1', 'name2'],
        descriptions: ['description1', 'description2'],
        images: ['image1.jpg', 'image2.jpg'],
        users: {
          names: ['name1', 'name2'],
          avatars: ['avatar1.jpg', 'avatar2.jpg'],
          emails: ['email1@gmail.com', 'email2@gmail.com'],
          passwords: ['123', '321']
        }
      };
    }
  }
}
