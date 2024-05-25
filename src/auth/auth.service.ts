import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { AuthDto } from "./dto/auth.dto";
import { hash, verify } from "argon2";
import { JwtService } from "@nestjs/jwt";
import { User } from "@prisma/client";
import { UsersService } from "src/users/users.service";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private users: UsersService,
  ) {}

  async register(dto: AuthDto) {
    try {
      const oldUser = await this.users.findUserWithEmail(dto);
      if (oldUser) throw new BadRequestException("User already register!");
      const newUser = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: await hash(dto.password),
        },
      });
      const tokens = await this.genTokens(newUser.id);
      const profile = await this.prisma.profile.create({
        data: {
          userId: newUser.id,
        },
      });
      await this.prisma.user.update({
        where: {
          id: newUser.id,
        },
        data: {
          profileId: profile.id,
        },
      });

      return {
        User: {
          ...(await this.returnUserFields(newUser)),
          profileId: profile.id,
          name: profile.name,
        },
        tokens,
      };
    } catch (e) {
      console.log(dto, e);
      throw new BadRequestException(e);
    }
  }

  async login(dto: AuthDto) {
    const user = await this.validateUser(dto);
    const tokens = await this.genTokens(user.id);
    const profile = await this.prisma.profile.findUnique({
      where: {
        userId: user.id,
      },
    });
    return {
      User: {
        ...(await this.returnUserFields(user)),
        profileId: profile.id,
        name: profile.name,
      },
      tokens,
    };
  }

  async getNewTokens(refreshToken: string) {
    try {
      const res = await this.jwt.verifyAsync(refreshToken);
      if (!res) throw new UnauthorizedException("Invalid refresh token");
      const user = await this.users.findUserWithId(res);
      const tokens = await this.genTokens(user.id);
      return {
        user: await this.returnUserFields(user),
        ...tokens,
      };
    } catch (e) {
      throw new UnauthorizedException("Token is expired");
    }
  }

  private async genTokens(id: string) {
    const data = { id };
    const accessToken = this.jwt.sign(data, {
      expiresIn: "1d",
    });
    const refreshToken = this.jwt.sign(data, {
      expiresIn: "1d",
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  private async returnUserFields(user: { email: string; id: string }) {
    return {
      uid: user.id,
      email: user.email,
    };
  }

  private async validateUser(dto: AuthDto): Promise<User | null> {
    const user = await this.users.findUserWithEmail(dto);
    if (!user) throw new BadRequestException("User is not registered");
    if (await verify(user.password, dto.password)) {
      return user;
    } else throw new BadRequestException("Wrong password or email");
  }
}
