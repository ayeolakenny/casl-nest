import { hash, verify } from 'argon2';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOtpDto, FindOtpDto, VerifyOtpDto } from './otp.types';
import { isAfter } from 'date-fns';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class OtpService {
  constructor(private prisma: PrismaService) {}

  private readonly logger = new Logger(OtpService.name);

  public async find(dto: FindOtpDto) {
    return this.prisma.otp.findFirst({
      where: { AND: [{ userId: dto.userId }, { subject: dto.subject }] },
      select: {
        id: true,
        userId: true,
        code: true,
      },
    });
  }

  public async create(dto: CreateOtpDto) {
    const { email, expiry, subject, userId } = dto;
    return await this.prisma.otp.create({
      data: {
        email,
        code: await hash(this.generateOtp(6)),
        expiry,
        subject,
        validity: true,
        userId,
      },
    });
  }

  public async verify(dto: VerifyOtpDto) {
    const { code, id } = dto;

    const otp = await this.prisma.otp.findUnique({
      where: { id },
    });

    if (!otp) return false;

    const isValid = await verify(otp.code, code);

    if (!isValid) return false;

    const isExpired = isAfter(new Date(), otp.expiry);

    if (isExpired) {
      await this.delete(otp.id);
      return false;
    }

    await this.delete(otp.id);

    return true;
  }

  private async delete(id: string) {
    await this.prisma.otp.delete({
      where: { id },
    });
  }

  // Delete all expired OTPs every 24hrs
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async deleteExpiredOtps() {
    this.logger.verbose('Deleting expired OTPs');
    const otps = await this.prisma.otp.findMany();

    for (let otp of otps) {
      if (isAfter(new Date(), otp.expiry)) {
        await this.delete(otp.id);
      }
    }
  }

  ///////////////
  //  HELPERS  //
  //////////////

  private generateOtp(length: number) {
    const digits = '1234567890';
    let otp = '';

    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * digits.length)];
    }

    return otp;
  }
}
