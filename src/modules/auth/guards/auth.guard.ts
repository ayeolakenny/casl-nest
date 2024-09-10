import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { bad } from 'src/utils/error.util';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwt: JwtService, private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwt.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      if (payload.isOtp) bad('Forbidden', 401);

      const roles = await this.prisma.role.findMany({
        where: { user: { some: { id: payload.sub } } },
        include: { permission: true },
      });

      const mappedRoles = roles.map((r) => r.permission.actions).flat();

      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request['user'] = payload;
      request['actions'] = [...new Set(mappedRoles)];
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
