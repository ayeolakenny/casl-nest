import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export type AuthPayload = {
  sub: string;
  isOtp?: boolean;
};

export type IAuthUser = AuthPayload;
