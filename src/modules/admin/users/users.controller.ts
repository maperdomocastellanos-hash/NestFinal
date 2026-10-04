import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { PermissionsGuard } from 'src/modules/auth/permissions.guard';
import { RequirePermissions } from 'src/modules/auth/require-permissions.decorator';

//@UseGuards(AuthGuard, PermissionsGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  //@RequirePermissions({ action: 'create', subject: 'user'})
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  //@RequirePermissions({ action: 'read', subject: 'user'})
  findAll() {
    return this.usersService.listarUsuario();
  }

  @Get(':id')
  //@RequirePermissions({ action: 'readbyone', subject: 'user'})
  findOne(@Param('id') id: string) {
    return this.usersService.mostrarUnUsuario(id);
  }

  @Patch(':id')
  //@RequirePermissions({ action: 'update', subject: 'user'})
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.actualizarUsuario(id, updateUserDto);
  }

  @Delete(':id')
  //@RequirePermissions({ action: 'delete', subject: 'user'})
  remove(@Param('id') id: string) {
    
  }
}
