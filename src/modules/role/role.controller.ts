import { Body, Controller, Post } from '@nestjs/common';
import { RoleService } from './role.service';
import { AssignRoleDto, CreateRoleDto } from './role.types';

@Controller('role')
export class RoleController {
  constructor(private readonly role: RoleService) {}

  @Post()
  create(@Body() dto: CreateRoleDto) {
    return this.role.create(dto);
  }

  @Post('assign')
  assign(@Body() dto: AssignRoleDto) {
    return this.role.assign(dto);
  }
}
