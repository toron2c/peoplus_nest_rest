import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { PostsService } from "./posts.service";
import { Auth } from "src/auth/decorators/auth.decorator";
import { CurrentUser } from "src/auth/decorators/user.decorator";
import { AllPostsDto } from "./dto/get-all-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { RemovePostDto } from "./dto/remove-post.dto";

@Controller("posts")
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post("create")
  @Auth()
  async createPost(
    @Body() req: { text: string },
    @CurrentUser("profileId") profileId: number,
  ) {
    const data = {
      authorId: profileId,
      text: req.text,
    };
    return await this.postsService.createPost(data);
  }

  @Get("id:id/:page?")
  @Auth()
  async getAllPosts(
    @Param("id") profileId: string,
    @Param("page") page?: string,
  ) {
    const data: AllPostsDto = {
      authorId: Number(profileId),
      page: page ? Number(page) : 0,
    };
    return await this.postsService.getPosts(data);
  }

  @Get("count/id:id")
  @Auth()
  async getCountPostsProfile(@Param("id") profileId: string) {
    const id = Number(profileId);
    return this.postsService.getCountPosts(id);
  }

  @Patch("edit/:id")
  @Auth()
  async updatePost(
    @Param("id") postId: string,
    @Body() req: { text: string },
    @CurrentUser("id") userId: string,
  ) {
    const data: UpdatePostDto = {
      userId: userId,
      postId: Number(postId),
      text: req.text,
    };
    return await this.postsService.editedPost(data);
  }

  @Delete("delete/:id")
  @Auth()
  async deletePost(
    @Param("id") postId: string,
    @CurrentUser("id") userId: string,
  ) {
    const data: RemovePostDto = {
      userId: userId,
      postId: Number(postId),
    };
    return await this.postsService.removePost(data);
  }
}
