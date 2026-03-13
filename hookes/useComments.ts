import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { commentService } from "../lib/api/services/comment.service";
import { AddCommentRequest, PostCommentResponse } from "../lib/api/types";
import toast from "react-hot-toast";
import { postKeys } from "./usePosts";

// Query keys for comments
export const commentKeys = {
  all: ["comments"] as const,
  byPost: (postId: number) => ["comments", "post", postId] as const,
  byAnswer: (answerId: number) => ["comments", "answer", answerId] as const,
  detail: (commentId: number) => ["comments", "detail", commentId] as const,
};

/**
 * Fetch all comments for a post
 */
export function useComments(postId: number | null) {
  return useQuery({
    queryKey: commentKeys.byPost(postId!),
    queryFn: () => commentService.getByPost(postId!),
    enabled: !!postId,
    staleTime: 15 * 1000,
  });
}

/**
 * Fetch all comments for an answer
 */
export function useAnswerComments(answerId: number | null) {
  return useQuery({
    queryKey: commentKeys.byAnswer(answerId!),
    queryFn: () => commentService.getByAnswer(answerId!),
    enabled: !!answerId,
    staleTime: 15 * 1000,
  });
}

/**
 * Create a comment on a post. Also bumps the post's commentsCount in all post caches.
 */
export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, data }: { postId: number; data: AddCommentRequest }) =>
      commentService.createForPost(postId, data),
    onSuccess: (comment, { postId }) => {
      // Prepend to the comments list cache
      queryClient.setQueryData(
        commentKeys.byPost(postId),
        (old: PostCommentResponse[] | undefined) =>
          old ? [comment, ...old] : [comment],
      );

      // Bump commentsCount across every post cache entry
      queryClient.setQueriesData({ queryKey: postKeys.all }, (old: any) => {
        if (!old) return old;
        const patch = (post: any) =>
          post?.id === postId
            ? { ...post, commentsCount: (post.commentsCount ?? 0) + 1 }
            : post;

        if (old?.id === postId) return patch(old);
        if (Array.isArray(old?.content))
          return { ...old, content: old.content.map(patch) };
        if (Array.isArray(old?.pages))
          return {
            ...old,
            pages: old.pages.map((page: any) =>
              Array.isArray(page?.content)
                ? { ...page, content: page.content.map(patch) }
                : page,
            ),
          };
        return old;
      });

      toast.success("Comment added");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to add comment");
    },
  });
}

/**
 * Create a comment on an answer
 */
export function useCreateAnswerComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ answerId, data }: { answerId: number; data: AddCommentRequest }) =>
      commentService.createForAnswer(answerId, data),
    onSuccess: (comment, { answerId }) => {
      queryClient.setQueryData(
        commentKeys.byAnswer(answerId),
        (old: PostCommentResponse[] | undefined) =>
          old ? [comment, ...old] : [comment],
      );
      toast.success("Comment added");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to add comment");
    },
  });
}

/**
 * Update a comment
 */
export function useUpdateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      data,
    }: {
      commentId: number;
      data: AddCommentRequest;
    }) => commentService.update(commentId, data),
    onSuccess: (updated) => {
      // Update in detail cache
      queryClient.setQueryData(commentKeys.detail(updated.id), updated);

      // Patch in post comments list
      if (updated.postId !== null) {
        queryClient.setQueryData(
          commentKeys.byPost(updated.postId),
          (old: PostCommentResponse[] | undefined) =>
            old?.map((c) => (c.id === updated.id ? updated : c)) ?? [updated],
        );
      }
      if (updated.answerId !== null) {
        queryClient.setQueryData(
          commentKeys.byAnswer(updated.answerId),
          (old: PostCommentResponse[] | undefined) =>
            old?.map((c) => (c.id === updated.id ? updated : c)) ?? [updated],
        );
      }

      toast.success("Comment updated");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update comment");
    },
  });
}

/**
 * Delete a comment. Also decrements commentsCount in post caches.
 */
export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
    }: {
      commentId: number;
      postId?: number;
      answerId?: number;
    }) => commentService.delete(commentId),
    onSuccess: (_, { commentId, postId, answerId }) => {
      if (postId !== undefined) {
        queryClient.setQueryData(
          commentKeys.byPost(postId),
          (old: PostCommentResponse[] | undefined) =>
            old?.filter((c) => c.id !== commentId) ?? [],
        );

        // Decrement commentsCount in post caches
        queryClient.setQueriesData({ queryKey: postKeys.all }, (old: any) => {
          if (!old) return old;
          const patch = (post: any) =>
            post?.id === postId
              ? { ...post, commentsCount: Math.max(0, (post.commentsCount ?? 1) - 1) }
              : post;

          if (old?.id === postId) return patch(old);
          if (Array.isArray(old?.content))
            return { ...old, content: old.content.map(patch) };
          if (Array.isArray(old?.pages))
            return {
              ...old,
              pages: old.pages.map((page: any) =>
                Array.isArray(page?.content)
                  ? { ...page, content: page.content.map(patch) }
                  : page,
              ),
            };
          return old;
        });
      }

      if (answerId !== undefined) {
        queryClient.setQueryData(
          commentKeys.byAnswer(answerId),
          (old: PostCommentResponse[] | undefined) =>
            old?.filter((c) => c.id !== commentId) ?? [],
        );
      }

      toast.success("Comment deleted");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete comment");
    },
  });
}

/**
 * Like a comment (optimistic update on likesCount)
 */
export function useLikeComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: number) => commentService.like(commentId),
    onMutate: async (commentId) => {
      const patchComment = (old: PostCommentResponse[] | undefined) =>
        old?.map((c) =>
          c.id === commentId ? { ...c, likesCount: (c.likesCount ?? 0) + 1 } : c,
        );
      queryClient.setQueriesData({ queryKey: commentKeys.all }, (old: any) =>
        Array.isArray(old) ? patchComment(old) : old,
      );
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to like comment");
      queryClient.invalidateQueries({ queryKey: commentKeys.all });
    },
  });
}

/**
 * Unlike a comment (optimistic update on likesCount)
 */
export function useUnlikeComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: number) => commentService.unlike(commentId),
    onMutate: async (commentId) => {
      const patchComment = (old: PostCommentResponse[] | undefined) =>
        old?.map((c) =>
          c.id === commentId
            ? { ...c, likesCount: Math.max(0, (c.likesCount ?? 0) - 1) }
            : c,
        );
      queryClient.setQueriesData({ queryKey: commentKeys.all }, (old: any) =>
        Array.isArray(old) ? patchComment(old) : old,
      );
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to unlike comment");
      queryClient.invalidateQueries({ queryKey: commentKeys.all });
    },
  });
}
