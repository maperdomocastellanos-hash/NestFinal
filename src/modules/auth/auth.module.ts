import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../admin/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../admin/users/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';

@Module({
   imports: [

    forwardRef(() => UsersModule),      //// exportamos en users.module.ts e importamos en --> auth.module.ts
    TypeOrmModule.forFeature([User]),
    JwtModule.register
    ({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
