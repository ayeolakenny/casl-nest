import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { RoleModule } from './modules/role/role.module';
import { MailModule } from './modules/mail/mail.module';
import { OtpModule } from './modules/otp/otp.module';

@Module({
  imports: [
    OtpModule,
    AuthModule,
    UserModule,
    RoleModule,
    MailModule,
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
