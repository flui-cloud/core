import { ValidationResultDto } from '../dto/validation-result.dto';

export class ValidationResultMapper {
  static createSuccess(
    details?: any,
    availableRegions?: Array<{ id: string; name: string; location: string }>,
  ): ValidationResultDto {
    return {
      success: true,
      details,
      availableRegions,
    };
  }

  static createError(message: string, details?: any): ValidationResultDto {
    return {
      success: false,
      message,
      details,
    };
  }
}
