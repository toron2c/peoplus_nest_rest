import { Body, Controller, Get, Param, Put } from "@nestjs/common";
import { UsersService } from "./users.service";
import { updateProfileDto } from "./dto/update-profile.dto";
import { Auth } from "src/auth/decorators/auth.decorator";
import { CurrentUser } from "src/auth/decorators/user.decorator";
// import { User } from "@prisma/client";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get(":id")
  async getProfiler(@Param("id") id: string) {
    const profileId = Number(id);
    return this.usersService.getProfile(profileId);
  }
  @Put("/update-profile")
  @Auth()
  async updateProfile(
    @Body() data: updateProfileDto,
    @CurrentUser("id") id: string,
  ) {
    return this.usersService.updateProfile(data, id);
  }
}
