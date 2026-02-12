import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface CommentView {
    id: string;
    content: string;
    author: string;
    timestamp: bigint;
    profileOwner: Principal;
    postId: string;
}
export interface CharacterProfileView {
    id: string;
    bio: string;
    owner: Principal;
    name: string;
    followers: Array<string>;
    avatar?: ExternalBlob;
}
export interface StoryView {
    id: string;
    author: string;
    timestamp: bigint;
    caption: string;
    image?: ExternalBlob;
    profileOwner: Principal;
}
export interface PostView {
    id: string;
    content: string;
    author: string;
    likes: Array<string>;
    timestamp: bigint;
    image?: ExternalBlob;
    profileOwner: Principal;
}
export interface MessageView {
    id: string;
    content: string;
    sender: string;
    conversationId: string;
    timestamp: bigint;
    profileOwner: Principal;
}
export interface ConversationView {
    id: string;
    participants: Array<string>;
    messages: Array<MessageView>;
    profileOwner: Principal;
}
export interface UserProfile {
    bio: string;
    name: string;
    avatar?: ExternalBlob;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCharacter(name: string, bio: string): Promise<string>;
    createComment(postId: string, authorId: string, content: string): Promise<string>;
    createConversation(participants: Array<string>): Promise<string>;
    createPost(authorId: string, content: string, image: ExternalBlob | null): Promise<string>;
    createStory(authorId: string, image: ExternalBlob, caption: string): Promise<string>;
    deleteCharacter(characterId: string): Promise<void>;
    deletePost(postId: string): Promise<void>;
    deleteStory(storyId: string): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCharacterProfiles(): Promise<Array<CharacterProfileView>>;
    getComments(postId: string): Promise<Array<CommentView>>;
    getConversation(conversationId: string): Promise<ConversationView | null>;
    getConversations(): Promise<Array<ConversationView>>;
    getPosts(): Promise<Array<PostView>>;
    getStories(): Promise<Array<StoryView>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    likePost(postId: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendMessage(conversationId: string, senderId: string, content: string): Promise<string>;
    updateCharacter(characterId: string, name: string, bio: string): Promise<void>;
    uploadAvatar(characterId: string, image: ExternalBlob): Promise<void>;
}
