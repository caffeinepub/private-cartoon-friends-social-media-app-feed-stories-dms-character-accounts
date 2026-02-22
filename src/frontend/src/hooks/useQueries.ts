import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { UserProfile, CharacterProfileView, PostView, CommentView, StoryView, ConversationView, VideoView, ExternalBlob } from '../backend';

// User Profile Queries
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

// Character Queries
export function useGetCharacterProfiles() {
  const { actor, isFetching } = useActor();

  return useQuery<CharacterProfileView[]>({
    queryKey: ['characters'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCharacterProfiles();
    },
    enabled: !!actor && !isFetching,
    staleTime: 0, // Treat data as immediately stale
    refetchOnMount: true,
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
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ['characters'] });
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
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ['characters'] });
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
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ['characters'] });
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
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ['characters'] });
    },
  });
}

// Post Queries
export function useGetPosts() {
  const { actor, isFetching } = useActor();

  return useQuery<PostView[]>({
    queryKey: ['posts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPosts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreatePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ authorId, content, image }: { authorId: string; content: string; image: ExternalBlob | null }) => {
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

// Comment Queries
export function useGetComments(postId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<CommentView[]>({
    queryKey: ['comments', postId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getComments(postId);
    },
    enabled: !!actor && !isFetching && !!postId,
  });
}

export function useCreateComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, authorId, content }: { postId: string; authorId: string; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createComment(postId, authorId, content);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.postId] });
    },
  });
}

// Story Queries
export function useGetStories() {
  const { actor, isFetching } = useActor();

  return useQuery<StoryView[]>({
    queryKey: ['stories'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getStories();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 60000, // Refetch every minute to update expired stories
  });
}

export function useCreateStory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ authorId, image, caption }: { authorId: string; image: ExternalBlob; caption: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createStory(authorId, image, caption);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    },
  });
}

// Video Queries
export function useGetVideos() {
  const { actor, isFetching } = useActor();

  return useQuery<VideoView[]>({
    queryKey: ['videos'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getVideos();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ authorId, video, caption }: { authorId: string; video: ExternalBlob; caption: string }) => {
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

// Conversation Queries
export function useGetConversations() {
  const { actor, isFetching } = useActor();

  return useQuery<ConversationView[]>({
    queryKey: ['conversations'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getConversations();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetConversation(conversationId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<ConversationView | null>({
    queryKey: ['conversation', conversationId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getConversation(conversationId);
    },
    enabled: !!actor && !isFetching && !!conversationId,
    refetchInterval: 3000, // Poll every 3 seconds for new messages
  });
}

export function useCreateConversation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (participants: string[]) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createConversation(participants);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ conversationId, senderId, content }: { conversationId: string; senderId: string; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.sendMessage(conversationId, senderId, content);
    },
    onSuccess: async (_, variables) => {
      // Immediately refetch the conversation to show the new message
      await queryClient.refetchQueries({ queryKey: ['conversation', variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
