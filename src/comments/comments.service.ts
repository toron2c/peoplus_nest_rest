import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { CommentCreateDto } from "./dto/comment-create.dto";
import { CommentUpdateDto } from "./dto/comment-update.dto";

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}
  async getComments(postId: number, skip: number) {
    const limit = {
      take: -3,
      skip: skip,
    };
    const comments = await this.prisma.comment.findMany({
      where: {
        postId: postId,
      },
      ...limit,
    });
    return comments;
  }

  async createComment(data: CommentCreateDto) {
    const comment = await this.prisma.comment.create({
      data: {
        postId: data.postId,
        authorId: data.authorId,
        text: data.text,
      },
    });
    return comment;
  }
  async updateComment(data: CommentUpdateDto) {
    await this.validateAuthor(data.authorId, data.commentId);
    const comment = await this.prisma.comment.update({
      where: {
        id: data.commentId,
      },
      data: {
        text: data.newText,
        edited: true,
      },
    });
    return comment;
  }

  async removeComment(data: CommentUpdateDto) {
    await this.validateAuthor(data.authorId, data.commentId);
    const comment = await this.prisma.comment.delete({
      where: {
        id: data.commentId,
      },
    });
    return comment.id;
  }

  private async validateAuthor(authorId: number, commentId: number) {
    try {
      const post = await this.prisma.comment.findUnique({
        where: {
          id: commentId,
        },
      });
      if (!post) throw new BadRequestException("Post not found!");
      if (post.authorId !== authorId) {
        throw new UnauthorizedException("Error authorization");
      }
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
