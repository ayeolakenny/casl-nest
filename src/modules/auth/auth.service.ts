import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthPayload, LoginDto } from './auth.types';
import { JwtService } from '@nestjs/jwt';
import { verify } from 'argon2';
import { bad, mustHave } from 'src/utils/error.util';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const { email, password } = dto;
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { auth: true, roles: true },
    });
    mustHave(user, 'Invalid Credentials', 401);

    const passHash = user.auth.passHash;
    if (!passHash) bad('Invalid Credentials', 401);

    const matched = await verify(passHash, password);
    if (!matched) bad('Invalid Credentials', 401);

    // Cant login if user has no roles and permissions
    if (!user.roles) bad('No roles assigned', 401);

    const payload: AuthPayload = {
      sub: user.id,
    };

    const token = await this.jwt.signAsync(payload);

    return { token };
  }

  async authUser(dto: AuthPayload) {
    return await this.prisma.user.findUnique({
      where: { id: dto.sub },
    });
  }
}
