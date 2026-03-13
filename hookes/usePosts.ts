import {
  useMutation,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { postService } from "../lib/api/services/post.service";
import {
  CreatePostRequest,
  UpdatePostRequest,
  PostCategory,
  PostType,
  PostSearchParams,
} from "../lib/api/types";
import toast from "react-hot-toast";

// Query keys for posts
export const postKeys = {
  all: ["posts"] as const,
  lists: () => [...postKeys.all, "list"] as const,
  list: (page?: number, size?: number) =>
    [...postKeys.lists(), { page, size }] as const,
  details: () => [...postKeys.all, "detail"] as const,
  detail: (id: number) => [...postKeys.details(), id] as const,
  category: (category: PostCategory, page?: number, size?: number) =>
    [...postKeys.all, "category", category, { page, size }] as const,
  popular: (page?: number, size?: number) =>
    [...postKeys.all, "popular", { page, size }] as const,
  trending: (page?: number, size?: number) =>
    [...postKeys.all, "trending", { page, size }] as const,
  user: (userId: number, page?: number, size?: number) =>
    [...postKeys.all, "user", userId, { page, size }] as const,
  search: (params: PostSearchParams) =>
    [...postKeys.all, "search", params] as const,
  infinite: (filter?: string) =>
    [...postKeys.all, "infinite", filter] as const,
};

/**
 * Hook to fetch all posts with pagination
 */
export function usePosts(page = 0, size = 20) {
  return useQuery({
    queryKey: postKeys.list(page, size),
    queryFn: () => postService.getAll(page, size),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to fetch posts with infinite scroll
 */
export function useInfinitePosts(filter?: "popular" | "trending") {
  return useInfiniteQuery({
    queryKey: postKeys.infinite(filter),
    queryFn: async ({ pageParam = 0 }) => {
      if (filter === "popular") {
        return postService.getPopular(pageParam, 20);
      }
      if (filter === "trending") {
        return postService.getTrending(pageParam, 20);
      }
      return postService.getAll(pageParam, 20);
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.last) return undefined;
      return lastPage.number + 1;
    },
    initialPageParam: 0,
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to fetch all community posts by loading every page.
 */
export function useAllPosts(size = 20) {
  const query = useInfiniteQuery({
    queryKey: postKeys.infinite("all"),
    queryFn: ({ pageParam = 0 }) => postService.getAll(pageParam, size),
    getNextPageParam: (lastPage) => {
      if (lastPage.last) return undefined;
      return lastPage.number + 1;
    },
    initialPageParam: 0,
    staleTime: 30 * 1000,
  });

  const posts = useMemo(
    () => query.data?.pages.flatMap((page) => page.content) ?? [],
    [query.data?.pages],
  );

  return {
    ...query,
    posts,
    totalElements: query.data?.pages[0]?.totalElements ?? 0,
    totalPages: query.data?.pages[0]?.totalPages ?? 0,
  };
}

/**
 * Hook to fetch a single post by ID
 */
export function usePost(postId: number | null) {
  return useQuery({
    queryKey: postKeys.detail(postId!),
    queryFn: () => postService.getById(postId!),
    enabled: !!postId,
  });
}

/**
 * Hook to fetch posts by category
 */
export function usePostsByCategory(
  category: PostCategory | null,
  page = 0,
  size = 20
) {
  return useQuery({
    queryKey: postKeys.category(category!, page, size),
    queryFn: () => postService.getByCategory(category!, page, size),
    enabled: !!category,
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to fetch popular posts
 */
export function usePopularPosts(page = 0, size = 20) {
  return useQuery({
    queryKey: postKeys.popular(page, size),
    queryFn: () => postService.getPopular(page, size),
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to fetch trending posts
 */
export function useTrendingPosts(page = 0, size = 20) {
  return useQuery({
    queryKey: postKeys.trending(page, size),
    queryFn: () => postService.getTrending(page, size),
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to fetch posts by user
 */
export function useUserPosts(userId: number | null, page = 0, size = 20) {
  return useQuery({
    queryKey: postKeys.user(userId!, page, size),
    queryFn: () => postService.getByUser(userId!, page, size),
    enabled: !!userId,
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to search posts with filters
 */
export function useSearchPosts(params: PostSearchParams) {
  return useQuery({
    queryKey: postKeys.search(params),
    queryFn: () => postService.search(params),
    enabled:
      !!params.keyword || !!params.category || !!params.type,
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to create a new post
 */
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePostRequest) => postService.create(data),
    onSuccess: () => {
      // Invalidate all post lists
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      queryClient.invalidateQueries({ queryKey: postKeys.all });
      toast.success("Post published successfully!");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to create post";
      toast.error(message);
    },
  });
}

/**
 * Hook to update a post
 */
export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      postId,
      data,
    }: {
      postId: number;
      data: UpdatePostRequest;
    }) => postService.update(postId, data),
    onSuccess: (updatedPost) => {
      // Update the cache for this specific post
      queryClient.setQueryData(postKeys.detail(updatedPost.id), updatedPost);
      // Invalidate lists to reflect changes
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      toast.success("Post updated successfully!");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to update post";
      toast.error(message);
    },
  });
}

/**
 * Hook to delete a post
 */
export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => postService.delete(postId),
    onSuccess: (_, postId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: postKeys.detail(postId) });
      // Invalidate all post lists
      queryClient.invalidateQueries({ queryKey: postKeys.all });
      toast.success("Post deleted successfully!");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to delete post";
      toast.error(message);
    },
  });
}

/**
 * Hook to like a post
 */
export function useLikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => postService.like(postId),
    onMutate: async (postId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: postKeys.detail(postId) });

      // Snapshot the previous value
      const previousPost = queryClient.getQueryData(postKeys.detail(postId));

      // Optimistically update the post
      queryClient.setQueryData(postKeys.detail(postId), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          likesCount: old.likesCount + 1,
          likedByCurrentUser: true,
        };
      });

      return { previousPost };
    },
    onError: (error, postId, context) => {
      // Rollback on error
      if (context?.previousPost) {
        queryClient.setQueryData(postKeys.detail(postId), context.previousPost);
      }
      toast.error("Failed to like post");
    },
    onSettled: (_, __, postId) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) });
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
}

/**
 * Hook to unlike a post
 */
export function useUnlikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => postService.unlike(postId),
    onMutate: async (postId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: postKeys.detail(postId) });

      // Snapshot the previous value
      const previousPost = queryClient.getQueryData(postKeys.detail(postId));

      // Optimistically update the post
      queryClient.setQueryData(postKeys.detail(postId), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          likesCount: Math.max(0, old.likesCount - 1),
          likedByCurrentUser: false,
        };
      });

      return { previousPost };
    },
    onError: (error, postId, context) => {
      // Rollback on error
      if (context?.previousPost) {
        queryClient.setQueryData(postKeys.detail(postId), context.previousPost);
      }
      toast.error("Failed to unlike post");
    },
    onSettled: (_, __, postId) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) });
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
}

/**
 * Combined hook to toggle like state
 */
export function useTogglePostLike() {
  const likeMutation = useLikePost();
  const unlikeMutation = useUnlikePost();

  return {
    toggle: (postId: number, isCurrentlyLiked: boolean) => {
      if (isCurrentlyLiked) {
        unlikeMutation.mutate(postId);
      } else {
        likeMutation.mutate(postId);
      }
    },
    isLoading: likeMutation.isPending || unlikeMutation.isPending,
  };
}
