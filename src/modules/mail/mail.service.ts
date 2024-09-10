import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ApplicantOtpMailDto, MAIL_SUBJECT } from './mail.types';

@Injectable()
export class MailService {
  constructor(private readonly mailer: MailerService) {}

  async sendApplicantOtpMail(dto: ApplicantOtpMailDto) {
    const { email, name, otp } = dto;
    await this.mailer.sendMail({
      to: email,
      subject: MAIL_SUBJECT.ACCOUNT_VERIFICATION,
      template: 'otp-verification',
      context: { name, otp },
    });
  }
}
