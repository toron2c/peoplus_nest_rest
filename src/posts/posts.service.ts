import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Post } from "@prisma/client";
import { PrismaService } from "src/prisma.service";
import { UsersService } from "src/users/users.service";
import { CreatePostDto } from "./dto/create-post.dto";
import { AllPostsDto } from "./dto/get-all-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { RemovePostDto } from "./dto/remove-post.dto";
import { UpdateLikeOnPostDto } from "./dto/update-like-on-post.dto";

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
  ) {}

  /**
   * func get posts user
   * @param data all posts dto: {
	 * authorId: author Id
  	page?: page
	} 
   * @returns Post[]
   */
  async getPosts(data: AllPostsDto): Promise<Post[]> {
    const count: number = 10;
    const limit = {
      take: count,
      skip: data.page ? data.page * count : 0,
    };
    const posts = await this.getAllPosts(data.authorId, limit);
    return posts;
  }

  /**
   * func create post
   * @param data create post dto
   * @returns post
   */
  async createPost(data: CreatePostDto): Promise<Post> {
    const post = await this.prisma.post.create({
      data: {
        authorId: data.authorId,
        text: data.text,
      },
      include: {
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });
    return post;
  }
  /**
   *	function get count posts
   * @param profileId profile id
   * @returns count post profile
   */
  async getCountPosts(profileId: number): Promise<number> {
    const postsCount = await this.prisma.post.count({
      where: {
        authorId: profileId,
      },
    });
    return postsCount;
  }

  /**
   *
   * @param data update post data transfer object
   * @returns Post object
   */
  async editedPost(data: UpdatePostDto): Promise<Post> {
    await this.validateAuthor(data.postId, data.userId);
    return await this.updatePost(data.postId, data.text);
  }

  /**
   * func delete post on id
   * @param data have a postId and userId
   */
  async removePost(data: RemovePostDto) {
    await this.validateAuthor(data.postId, data.userId);
    await this.prisma.post.delete({
      where: {
        id: data.postId,
      },
    });
  }

  async changeStateLikeOnPost(data: UpdateLikeOnPostDto) {
    const like = await this.prisma.likes.findUnique({
      where: {
        userId_postId: {
          userId: data.profileId,
          postId: data.postId,
        },
      },
    });
    if (like) {
      await this.prisma.likes.delete({
        where: {
          userId_postId: {
            userId: data.profileId,
            postId: data.postId,
          },
        },
      });
      return 0;
    } else {
      await this.prisma.likes.create({
        data: {
          userId: data.profileId,
          postId: data.postId,
        },
      });
      return 1;
    }
  }

  /**
   *func get all posts an profileId
   * @param profileId Id profile
   * @param limit limit get list
   * @returns Post[]
   */
  private async getAllPosts(
    profileId: number,
    limit?: { take: number; skip: number },
  ): Promise<Post[]> {
    const posts = await this.prisma.post.findMany({
      where: {
        authorId: profileId,
      },
      ...limit,
      include: {
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });
    if (posts.length === 0) throw new BadRequestException("Posts not found");
    return posts;
  }

  /**
   *	func update post
   * @param postId post id
   * @param text new posttext
   * @returns
   */
  private async updatePost(postId: number, text: string): Promise<Post> {
    const post = await this.prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        text: text,
        edited: true,
      },
      include: {
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });
    return post;
  }
  /**
   * func checking userid and author id from post
   * @param postId post id
   * @param userId userId
   */
  private async validateAuthor(postId: number, userId: string) {
    try {
      const user = await this.users.findUserWithId({ id: userId });
      const post = await this.prisma.post.findUnique({
        where: {
          id: postId,
        },
      });
      if (!post) throw new BadRequestException("Post not found!");
      if (post.authorId !== user.profileId) {
        throw new UnauthorizedException("Error authorization");
      }
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
