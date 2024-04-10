import {
  Body,
  Controller,
  HttpCode,
  Post,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthDto } from "./dto/auth.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { Auth } from "./decorators/auth.decorator";
// import { User as UserModel } from "@prisma/client";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(200)
  @UsePipes(new ValidationPipe())
  @Post("register")
  async register(@Body() userData: AuthDto) {
    return this.authService.register(userData);
  }
  @HttpCode(200)
  @UsePipes(new ValidationPipe())
  @Post("login")
  async login(@Body() userData: AuthDto) {
    return this.authService.login(userData);
  }
  @Auth()
  @HttpCode(200)
  @UsePipes(new ValidationPipe())
  @Post("login/refresh-token")
  async loginAccessToken(@Body() token: RefreshTokenDto) {
    return this.authService.getNewTokens(token.refreshToken);
  }
}
