import {Offer} from '../models/offer.js';
import {City, Facilities, HousingType, UserType} from '../models/enums.js';

export class OfferService {
  public parseOffer(line: string): Offer {
    const [
      title,
      description,
      date,
      city,
      preview,
      images,
      premium,
      favorite,
      rating,
      housingType,
      roomCount,
      guestCount,
      facilities,
      authorName,
      authorAvatar,
      authorType,
      authorEmail,
      authorPassword,
      commentsCount,
      latitude,
      longitude,
      cost,
    ] = line.split('\t');

    return {
      title: title,
      description: description,
      date: new Date(date),
      city: city as unknown as City,
      preview: preview,
      images: images.split(','),
      isPremium: premium as unknown as boolean,
      isFavourite: favorite as unknown as boolean,
      rating: parseFloat(rating),
      housingType: housingType as unknown as HousingType,
      roomCount: parseInt(roomCount, 10),
      guestCount: parseInt(guestCount, 10),
      cost: parseInt(cost, 10),
      facilities: facilities.split(',').map((x) => x as unknown as Facilities),
      author: {
        name: authorName,
        avatar: authorAvatar,
        type: authorType as unknown as UserType,
        email: authorEmail,
        password: authorPassword,
      },
      commentsCount: parseInt(commentsCount, 10),
      coordinates: {latitude: parseFloat(latitude), longitude: parseFloat(longitude)},
    };
  }
}
