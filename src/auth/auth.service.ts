import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { AuthDto } from "./dto/auth.dto";
import { hash } from "argon2";
import { JwtService } from "@nestjs/jwt";
import { User } from "@prisma/client";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(dto: AuthDto) {
    const oldUser = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (oldUser) throw new BadRequestException("User already register!");
    const newUser = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: await hash(dto.password),
      },
    });

    const tokens = await this.genTokens(newUser.id);

    return {
      user: this.returnUserFields(newUser),
      ...tokens,
    };
  }

  private async genTokens(id: string) {
    const data = { id };
    const accessToken = this.jwt.sign(data, {
      expiresIn: "1h",
    });
    const refreshToken = this.jwt.sign(data, {
      expiresIn: "7d",
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  private returnUserFields(user: User) {
    return {
      id: user.id,
      email: user.email,
    };
  }
}
