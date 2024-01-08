import { OfferType } from '../models/offer/offer-type.js';
import { City, Facilities, HousingType, UserLevel } from '../models/enums.js';
import { MockData } from '../models/mock-data.js';
import { generateRandomInt, getRandomItem } from '../utils/random.js';

export class OfferService {
  public parseOffer(line: string): OfferType {
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
      images: images.slice(1, images.length - 1).split(','),
      isPremium: premium as unknown as boolean,
      isFavourite: favorite as unknown as boolean,
      rating: parseFloat(rating),
      housingType: housingType as unknown as HousingType,
      roomCount: parseInt(roomCount, 10),
      guestCount: parseInt(guestCount, 10),
      cost: parseInt(cost, 10),
      facilities: facilities.slice(1, facilities.length - 1).split(',').map((x) => x as unknown as Facilities),
      author: {
        name: authorName,
        avatar: authorAvatar,
        type: authorType as unknown as UserLevel,
        email: authorEmail,
        password: authorPassword,
      },
      commentsCount: parseInt(commentsCount, 10),
      coordinates: {latitude: parseFloat(latitude), longitude: parseFloat(longitude)},
    };
  }

  public generateOffer(initialData: MockData): OfferType {
    return {
      title: getRandomItem<string>(initialData.titles),
      description: getRandomItem<string>(initialData.descriptions),
      date: new Date(),
      city: City.AMSTERDAM,
      preview: getRandomItem<string>(initialData.images),
      images: [getRandomItem<string>(initialData.images), getRandomItem<string>(initialData.images)],
      isPremium: getRandomItem<boolean>([true, false]),
      isFavourite: getRandomItem<boolean>([true, false]),
      rating: generateRandomInt(0, 10),
      housingType: HousingType.HOTEL,
      roomCount: generateRandomInt(1, 5),
      guestCount: generateRandomInt(1, 10),
      cost: generateRandomInt(1, 100500),
      facilities: [Facilities.BREAKFAST, Facilities.WASHER],
      author: {
        name: getRandomItem<string>(initialData.users.names),
        avatar: getRandomItem<string>(initialData.users.avatars),
        type: UserLevel.STANDART,
        email: getRandomItem<string>(initialData.users.emails),
        password: getRandomItem<string>(initialData.users.passwords),
      },
      commentsCount: generateRandomInt(0, 100),
      coordinates: {latitude: generateRandomInt(-90, 90), longitude: generateRandomInt(-180, 180)},
    };
  }

  public offerToTsvString(offer: OfferType): string {
    return [
      offer.title,
      offer.description,
      offer.date.toISOString(),
      offer.city,
      offer.preview,
      `[${offer.images}]`,
      offer.isPremium,
      offer.isFavourite,
      offer.rating,
      offer.housingType,
      offer.roomCount,
      offer.guestCount,
      `[${offer.facilities}]`,
      offer.author.name,
      offer.author.avatar,
      offer.author.type,
      offer.author.email,
      offer.author.password,
      offer.commentsCount,
      offer.coordinates.latitude,
      offer.coordinates.longitude,
      offer.cost,
    ].join('\t');
  }
}
