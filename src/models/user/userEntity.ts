import typegoose, { defaultClasses } from '@typegoose/typegoose';
import { UserType } from './userType.js';
import { UserLevel } from '../enums.js';
import { createSHA256Hash } from '../../utils/hashing.js';
import { ConfigRegistry } from '../../common/config/configRegistry.js';

const { prop, modelOptions } = typegoose;

export interface UserEntity extends defaultClasses.Base {}

@modelOptions({
  schemaOptions: {
    collection: 'users',
  },
})
export class UserEntity extends defaultClasses.TimeStamps implements UserType {
  @prop({ unique: true, required: true })
  public email: string;

  @prop({ required: false, default: '' })
  public avatar?: string;

  @prop({ required: true, default: '' })
  public name: string;

  @prop({ required: true, default: '' })
  public password: string;

  @prop({ required: true, default: UserLevel.STANDART })
  public type: UserLevel;

  constructor(
    userData: UserType,
    private readonly config?: ConfigRegistry,
  ) {
    super();
    this.email = userData.email;
    this.avatar = userData.avatar;
    this.name = userData.name;
    this.type = userData.type;
    this.password = createSHA256Hash(userData.password, this.config?.get('SALT'));
  }
}
