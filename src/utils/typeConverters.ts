import {ClassConstructor, plainToInstance} from 'class-transformer';

export function convertMaybeDbModelToDto<T>(someDto: ClassConstructor<T>, plainModel: any | null) {
  if (plainModel === null) {
    return null;
  }
  return _convertDbModelToDto(someDto, plainModel);
}

export function convertModelsArrayToDto<T>(someDto: ClassConstructor<T>, modelsArray: Array<any>) {
  return modelsArray.map((model) => _convertDbModelToDto(someDto, model));
}

function _convertDbModelToDto<T>(someDto: ClassConstructor<T>, plainModel: any) {
  return plainToInstance(
    someDto, {id: plainModel._id.toString(), ...plainModel._doc}, { excludeExtraneousValues: true }
  );
}
