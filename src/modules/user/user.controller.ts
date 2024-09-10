import { Body, Controller, Get, Post } from '@nestjs/common';
import { Auth } from '../auth/decorators/auth.decorator';
import { UserService } from './user.service';
import { CreateApplicantDto } from './user.types';

@Controller('user')
export class UserController {
  constructor(private readonly user: UserService) {}

  @Post('applicant')
  async createApplicant(@Body() dto: CreateApplicantDto) {
    return await this.user.createApplicant(dto);
  }

  @Get()
  @Auth(['ALL'])
  async listUsers() {
    return await this.user.listUsers();
  }
}
