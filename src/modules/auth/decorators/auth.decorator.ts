import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { type Request } from 'express';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from './roles.decorator';
import { AppActions } from '@prisma/client';
import { OtpGuard } from '../guards/otp.guard';

export const Auth = (actions?: AppActions[]) => {
  if (!actions?.length) return applyDecorators(UseGuards(AuthGuard));
  return applyDecorators(Roles(...actions), UseGuards(AuthGuard, RolesGuard));
};

export const OtpOnly = () => applyDecorators(UseGuards(OtpGuard));

export function getAuthToken(req: Request) {
  const auth = req.headers.authorization;
  const bearer = auth && /^Bearer (.+)$/.exec(auth);
  if (bearer) return bearer[1];

  const header = req.get('X-Auth-Token');
  if (header) return header;

  return null;
}

export const AuthUser = createParamDecorator(
  async (_: unknown, ctx: ExecutionContext) => {
    const jwtService = new JwtService();
    const token = getAuthToken(ctx.switchToHttp().getRequest());
    if (!token) throw new UnauthorizedException();
    try {
      const payload = await jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      return payload;
    } catch {
      throw new UnauthorizedException();
    }
  },
);
