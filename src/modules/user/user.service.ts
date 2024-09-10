import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash } from 'argon2';
import { add } from 'date-fns';
import { bad } from 'src/utils/error.util';
import { IAuthUser } from '../auth/auth.types';
import { MailService } from '../mail/mail.service';
import { OtpService } from '../otp/otp.service';
import { OTP_SUBJECT } from '../otp/otp.types';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicantDto, VerifyApplicantDto } from './user.types';

@Injectable()
export class UserService {
  constructor(
    private jwt: JwtService,
    private readonly otp: OtpService,
    private readonly mail: MailService,
    private readonly prisma: PrismaService,
  ) {}

  async createApplicant(dto: CreateApplicantDto) {
    const { password, email, ...rest } = dto;

    if (await this.isApplicantPhoneNumberTaken(dto.phoneNumber)) {
      bad('Phone number has been taken');
    }

    if (await this.isEmailTaken(email)) {
      bad('Email has been taken');
    }

    const applicant = await this.prisma.user.create({
      data: {
        email,
        isApplicant: true,
        applicant: {
          create: {
            ...rest,
          },
        },
        auth: {
          create: {
            passHash: await hash(password),
          },
        },
      },
    });

    const otp = await this.otp.create({
      email,
      expiry: add(new Date(), { minutes: 10 }),
      subject: OTP_SUBJECT.APPLICANT_VERIFICATION,
      userId: applicant.id,
    });

    await this.mail.sendApplicantOtpMail({
      email,
      name: `${dto.firstName} ${dto.lastName}`,
      otp: otp.code,
    });

    const token = await this.jwt.signAsync({
      sub: applicant.id,
      isOtp: true,
    });

    return { token };
  }

  async verifyApplicant(authUser: IAuthUser, dto: VerifyApplicantDto) {
    const code = dto.code;

    const otp = await this.otp.find({
      userId: authUser.sub,
      subject: OTP_SUBJECT.APPLICANT_VERIFICATION,
    });

    if (!otp) bad('Invalid OTP');

    const isOtpValid = await this.otp.verify({
      id: otp.id,
      code,
    });

    if (!isOtpValid) bad('Invalid OTP');

    await this.prisma.user.update({
      where: { id: authUser.sub },
      data: { verified: true },
    });

    return {
      statusCode: '200',
      success: true,
      message: 'Email verified',
    };
  }

  async listUsers() {
    return await this.prisma.user.findMany();
  }

  ////////////////
  /// Helpers ///
  ///////////////

  private async isApplicantPhoneNumberTaken(phoneNumber: string) {
    const exists = await this.prisma.applicant.findUnique({
      where: { phoneNumber },
    });
    return !!exists;
  }

  private async isEmailTaken(email: string) {
    const exists = await this.prisma.user.findUnique({ where: { email } });
    return !!exists;
  }
}
