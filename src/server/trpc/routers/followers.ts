import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { router, privateProcedure } from '~/server/trpc/trpc';

export const followsRouter = router({
  getFollowerCount: privateProcedure.query(async ({ ctx }) => {
    const userId = ctx.userId;
    const follows = await ctx.db.follow.count({
      where: {
        followerId: userId
      }
    });

    return follows;
  }),
  getFollowingCount: privateProcedure.query(async ({ ctx }) => {
    const userId = ctx.userId;
    const follows = await ctx.db.follow.count({
      where: {
        followingId: userId
      }
    });

    return follows;
  }),
  isFollowingById: privateProcedure
    .input(
      z.object({
        followingUserId: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.userId;
      const follower = await ctx.db.follow.findFirst({
        where: {
          followerId: userId,
          followingId: input.followingUserId
        }
      });

      return follower != null;
    }),
  followUser: privateProcedure
    .input(
      z.object({
        followingUserId: z.string()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      const existingFollow = await ctx.db.follow.findFirst({
        where: {
          followerId: userId,
          followingId: input.followingUserId
        }
      });

      if (existingFollow != null)
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User is already following the other user.'
        });

      const follow = await ctx.db.follow.create({
        data: {
          followerId: userId,
          followingId: input.followingUserId
        }
      });

      return follow;
    }),
  unfollowUser: privateProcedure
    .input(
      z.object({
        followingUserId: z.string()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      const existingFollow = await ctx.db.follow.findFirst({
        where: {
          followerId: userId,
          followingId: input.followingUserId
        }
      });

      if (existingFollow == null)
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User is not following the other user.'
        });

      const follow = await ctx.db.follow.delete({
        where: {
          id: existingFollow.id
        }
      });

      return follow;
    })
});
