import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AppActions } from '@prisma/client';
import { ACTIONS_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredActions = this.reflector.getAllAndOverride<AppActions[]>(
      ACTIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredActions) {
      return true;
    }

    // You can also get user from this {user, actions}
    const { actions } = context.switchToHttp().getRequest();

    return (actions ?? []).some((a: AppActions) => requiredActions.includes(a));
  }
}
