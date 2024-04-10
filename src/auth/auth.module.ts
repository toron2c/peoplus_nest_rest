import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { PrismaService } from "src/prisma.service";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { getJwtConfig } from "src/config/jwt.config";
import { JwtStrategy } from "./jwt.strategy";
import { UsersService } from "src/users/users.service";

@Module({
  controllers: [AuthController],
  providers: [AuthService, PrismaService, JwtStrategy, UsersService],
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getJwtConfig,
    }),
  ],
})
export class AuthModule {}
