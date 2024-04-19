import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Profile, User } from "@prisma/client";
import { PrismaService } from "src/prisma.service";
import { updateProfileDto } from "./dto/update-profile.dto";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findUserWithEmail({ email }: Pick<User, "email">) {
    return await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async findUserWithId({ id }: Pick<User, "id">) {
    return await this.prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        email: true,
        password: false,
        profileId: true,
      },
    });
  }

  async getProfile(profileId: number) {
    try {
      const profile: Profile = await this.prisma.profile.findUnique({
        where: {
          id: profileId,
        },
      });
      if (!profile) {
        throw new BadRequestException("Profile not found");
      }
      return profile;
    } catch (e) {
      throw new NotFoundException("404");
    }
  }

  async updateProfile(
    newData: updateProfileDto,
    userId: string,
  ): Promise<updateProfileDto> {
    const profile = await this.prisma.profile.update({
      where: {
        userId,
      },
      data: {
        bio: newData.bio,
        name: newData.name,
        birthday: new Date(newData.birthday),
      },
      select: {
        id: true,
        bio: true,
        birthday: true,
        name: true,
        userId: false,
      },
    });
    return profile;
  }

  /**maybe create private func for get profile */
  // private async prof
  private async getProfilePrivate({
    id,
  }: Pick<Profile, "id">): Promise<Profile | null> {
    return await this.prisma.profile.findUnique({
      where: {
        id,
      },
    });
  }
}
