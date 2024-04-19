import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { CommentsService } from "./comments.service";
import { Auth } from "src/auth/decorators/auth.decorator";
import { CurrentUser } from "src/auth/decorators/user.decorator";
import { CommentCreateDto } from "./dto/comment-create.dto";
import { CommentUpdateDto } from "./dto/comment-update.dto";
import { CommentRemoveDto } from "./dto/comment-remove.dto";
import { CommentsGet } from "./dto/comments-get.dto";

@Controller("comments")
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}
  @Post("create")
  @Auth()
  async createComment(
    @Body() req: { text: string; postId: number },
    @CurrentUser("profileId") profileId: number,
  ) {
    const data: CommentCreateDto = {
      authorId: profileId,
      postId: Number(req.postId),
      text: req.text,
    };
    return await this.commentsService.createComment(data);
  }
  @Patch("update")
  @Auth()
  async updateComment(
    @Body() req: { commentId: string; text: string },
    @CurrentUser("profileId") profileId: number,
  ) {
    const data: CommentUpdateDto = {
      authorId: profileId,
      commentId: Number(req.commentId),
      newText: req.text,
    };
    return await this.commentsService.updateComment(data);
  }
  @Delete("id:id")
  @Auth()
  async deleteComment(
    @Param("id") commentId: string,
    @CurrentUser("profileId") profileId: number,
  ) {
    const data: CommentRemoveDto = { commentId: Number(commentId), profileId };
    return await this.commentsService.removeComment(data);
  }
  @Get("post:postId/:skip?")
  @Auth()
  async getComments(
    @Param("postId") postId: string,
    @Param("skip") skip?: string,
  ) {
    const data: CommentsGet = {
      postId: Number(postId),
      skip: skip ? Number(skip) : 0,
    };
    return await this.commentsService.getComments(data);
  }
}
