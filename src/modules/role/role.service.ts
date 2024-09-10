import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AssignRoleDto, CreateRoleDto } from './role.types';
import { bad } from 'src/utils/error.util';

@Injectable()
export class RoleService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRoleDto) {
    // use dto.apps to vaidate the actions

    const exists = await this.findByName(dto.name);
    if (exists) bad('Role with same name exitst');

    return await this.prisma.role.create({
      data: {
        name: dto.name,
        permission: {
          create: {
            name: dto.permissions.name,
            actions: dto.permissions.actions,
          },
        },
      },
    });
  }

  async findByName(name: string) {
    return await this.prisma.role.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });
  }

  async assign(dto: AssignRoleDto) {
    const { roleIds, userId } = dto;

    const roles = await this.prisma.role.findMany({
      where: { id: { in: roleIds } },
    });

    if (roles.length !== roleIds.length) {
      bad('Some roles do not exist');
    }

    // Get user's current roles
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { roles: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Filter out roles that the user is already assigned to
    const newRoleIds = dto.roleIds.filter(
      (roleId) => !user.roles.some((role) => role.id === roleId),
    );

    if (newRoleIds.length === 0) {
      bad('User is already assigned specified roles');
    }

    return await this.prisma.user.update({
      where: { id: userId },
      data: {
        roles: {
          connect: roleIds.map((rid) => ({ id: rid })),
        },
      },
    });
  }
}
