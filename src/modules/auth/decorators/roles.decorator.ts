import { SetMetadata } from '@nestjs/common';
import { AppActions } from '@prisma/client';

export const ACTIONS_KEY = 'actions';
export const Roles = (...actions: AppActions[]) =>
  SetMetadata(ACTIONS_KEY, actions);
