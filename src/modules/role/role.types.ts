import { AppActions } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

enum Apps {
  GENERAL,
  CERTIFICATE,
  INSPECTION,
}

export class CreatePermissionDto {
  @IsString()
  name: string;

  @IsEnum(AppActions, { each: true })
  actions: AppActions[];
}

export class CreateRoleDto {
  @IsString()
  name: string;

  @ValidateNested()
  @Type(() => CreatePermissionDto)
  permissions: CreatePermissionDto;

  @IsEnum(Apps)
  apps: Apps[];
}

export class AssignRoleDto {
  @IsUUID('4')
  userId: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  roleIds: string[];
}
