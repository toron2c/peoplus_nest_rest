import { IsEmail, IsString } from "class-validator";

export class AuthDto {
  @IsEmail()
  email: string;
  // @MinLength(8)
  @IsString()
  password: string;
}
