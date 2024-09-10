import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

export class CreateApplicantDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsPhoneNumber('NG')
  phoneNumber: string;

  @IsOptional()
  @IsPhoneNumber('NG')
  altPhoneNumber: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class VerifyApplicantDto {
  @IsString()
  code: string;
}
