import { IsEmail, IsString, Length } from 'class-validator';

export const MAIL_SUBJECT = {
  ACCOUNT_VERIFICATION: 'Account Verification',
};

export class ApplicantOtpMailDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsString()
  @Length(6)
  otp: string;
}
