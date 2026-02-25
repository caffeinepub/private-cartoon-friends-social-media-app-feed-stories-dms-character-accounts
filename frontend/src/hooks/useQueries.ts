import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import {
  UserProfile,
  CharacterProfileView,
  PostView,
  CommentView,
  StoryView,
  VideoView,
  ConversationView,
  ExternalBlob,
} from '../backend';

// ─── User Profile ────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ─── Characters ──────────────────────────────────────────────────────────────

export function useGetCharacterProfiles() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<CharacterProfileView[]>({
    queryKey: ['characterProfiles'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCharacterProfiles();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateCharacter() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, bio }: { name: string; bio: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createCharacter(name, bio);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characterProfiles'] });
    },
  });
}

export function useUpdateCharacter() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ characterId, name, bio }: { characterId: string; name: string; bio: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateCharacter(characterId, name, bio);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characterProfiles'] });
    },
  });
}

export function useUploadAvatar() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ characterId, image }: { characterId: string; image: ExternalBlob }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.uploadAvatar(characterId, image);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characterProfiles'] });
    },
  });
}

export function useDeleteCharacter() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (characterId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteCharacter(characterId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characterProfiles'] });
    },
  });
}

// ─── Posts ───────────────────────────────────────────────────────────────────

export function useGetPosts() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PostView[]>({
    queryKey: ['posts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPosts();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreatePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      authorId,
      content,
      image,
    }: {
      authorId: string;
      content: string;
      image: ExternalBlob | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createPost(authorId, content, image);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useLikePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.likePost(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useDeletePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deletePost(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

// ─── Comments ────────────────────────────────────────────────────────────────

export function useGetComments(postId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<CommentView[]>({
    queryKey: ['comments', postId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getComments(postId);
    },
    enabled: !!actor && !actorFetching && !!postId,
  });
}

export function useCreateComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      authorId,
      content,
    }: {
      postId: string;
      authorId: string;
      content: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createComment(postId, authorId, content);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.postId] });
    },
  });
}

// ─── Stories ─────────────────────────────────────────────────────────────────

export function useGetStories() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<StoryView[]>({
    queryKey: ['stories'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getStories();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateStory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      authorId,
      image,
      caption,
    }: {
      authorId: string;
      image: ExternalBlob;
      caption: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createStory(authorId, image, caption);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    },
  });
}

export function useDeleteStory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (storyId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteStory(storyId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    },
  });
}

// ─── Videos ──────────────────────────────────────────────────────────────────

export function useGetVideos() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<VideoView[]>({
    queryKey: ['videos'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getVideos();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      authorId,
      video,
      caption,
    }: {
      authorId: string;
      video: ExternalBlob;
      caption: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createVideo(authorId, video, caption);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    },
  });
}

export function useDeleteVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (videoId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteVideo(videoId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    },
  });
}

// ─── Conversations ────────────────────────────────────────────────────────────

export function useGetConversations() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ConversationView[]>({
    queryKey: ['conversations'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getConversations();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 0,
    refetchOnMount: true,
  });
}

export function useGetConversation(conversationId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<ConversationView | null>({
    queryKey: ['conversation', conversationId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.getConversation(conversationId);
      return result ?? null;
    },
    enabled: !!actor && !actorFetching && !!conversationId,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchInterval: 3000,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isPending,
    isFetched: !!actor && !actorFetching && query.isFetched,
  };
}

export function useCreateConversation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (participants: string[]) => {
      if (!actor) throw new Error('Actor not available');
      const id = await actor.createConversation(participants);
      return id;
    },
    onSuccess: (newConvId) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      // Pre-populate the conversation query cache so MessageThread loads instantly
      queryClient.invalidateQueries({ queryKey: ['conversation', newConvId] });
    },
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      conversationId,
      senderId,
      content,
    }: {
      conversationId: string;
      senderId: string;
      content: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.sendMessage(conversationId, senderId, content);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['conversation', variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
