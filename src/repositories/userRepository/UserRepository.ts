import { inject, injectable } from 'inversify';
import { DocumentType, types } from '@typegoose/typegoose';
import { UserEntity } from '../../models/user/userEntity.js';
import { UserDto } from '../../models/user/userDto.js';
import { AppTypes } from '../../application/appTypes.js';
import { IUserRepository } from './IUserRepository.js';
import { ILogger } from '../../common/logging/ILogger.js';
import { ConfigRegistry } from '../../common/config/configRegistry.js';
import { UserLevel } from '../../models/enums.js';

@injectable()
export class UserRepository implements IUserRepository {
  private readonly logger: ILogger;
  private readonly config: ConfigRegistry;
  private readonly userModel: types.ModelType<UserEntity>;

  constructor(
    @inject(AppTypes.LoggerInterface) logger: ILogger,
    @inject(AppTypes.ConfigRegistry) config: ConfigRegistry,
    @inject(AppTypes.UserModel) userModel: types.ModelType<UserEntity>,
  ) {
    this.logger = logger;
    this.config = config;
    this.userModel = userModel;
  }

  public async create(dto: UserDto): Promise<DocumentType<UserEntity>> {
    const user = new UserEntity({ ...dto, type: UserLevel.STANDART }, this.config);

    const model = await this.userModel.create(user);
    this.logger.info(`New user with id ${model.id} created`);

    return model;
  }

  public async findById(id: string): Promise<DocumentType<UserEntity> | null> {
    return this.userModel.findOne({ id });
  }

  public async findByEmail(email: string): Promise<DocumentType<UserEntity> | null> {
    return this.userModel.findOne({ email });
  }
}
