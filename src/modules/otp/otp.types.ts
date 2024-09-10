import { IsDate, IsEmail, IsEnum, IsString, IsUUID } from 'class-validator';

export enum OTP_SUBJECT {
  APPLICANT_VERIFICATION = 'APPLICANT_VERIFICATION',
}

export class CreateOtpDto {
  @IsEmail()
  email: string;

  @IsUUID('4')
  userId: string;

  @IsString()
  subject: string;

  @IsDate()
  expiry: Date;
}

export class VerifyOtpDto {
  @IsString()
  id: string;

  @IsString()
  code: string;
}

export class FindOtpDto {
  @IsString()
  userId: string;

  @IsEnum(OTP_SUBJECT)
  subject: OTP_SUBJECT;
}
