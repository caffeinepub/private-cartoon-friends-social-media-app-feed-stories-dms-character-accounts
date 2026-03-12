import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";

import Principal "mo:core/Principal";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";


// Run migration as specified in with clause

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // User Profile type
  public type UserProfile = {
    name : Text;
    bio : Text;
    avatar : ?Storage.ExternalBlob;
  };

  // Internal persistent data type
  type Post = {
    id : Text;
    author : Text; // Character id or "user" for main user
    content : Text;
    image : ?Storage.ExternalBlob;
    timestamp : Int;
    likes : [Text];
    profileOwner : Principal;
  };

  public type PostView = {
    id : Text;
    author : Text; // Character id or "user" for main user
    content : Text;
    image : ?Storage.ExternalBlob;
    timestamp : Int;
    likes : [Text];
    profileOwner : Principal;
  };

  // Internal persistent data type
  type Comment = {
    id : Text;
    postId : Text;
    author : Text;
    content : Text;
    timestamp : Int;
    profileOwner : Principal;
  };

  public type CommentView = {
    id : Text;
    postId : Text;
    author : Text;
    content : Text;
    timestamp : Int;
    profileOwner : Principal;
  };

  // Internal persistent data type
  type Story = {
    id : Text;
    author : Text;
    image : ?Storage.ExternalBlob;
    caption : Text;
    timestamp : Int;
    profileOwner : Principal;
  };

  public type StoryView = {
    id : Text;
    author : Text;
    image : ?Storage.ExternalBlob;
    caption : Text;
    timestamp : Int;
    profileOwner : Principal;
  };

  // Internal persistent data type
  public type Video = {
    id : Text;
    author : Text;
    video : Storage.ExternalBlob;
    caption : Text;
    timestamp : Int;
    profileOwner : Principal;
  };

  public type VideoView = {
    id : Text;
    author : Text;
    video : Storage.ExternalBlob;
    caption : Text;
    timestamp : Int;
    profileOwner : Principal;
  };

  // Internal persistent data type
  type Message = {
    id : Text;
    conversationId : Text;
    sender : Text;
    content : Text;
    timestamp : Int;
    profileOwner : Principal;
  };

  public type MessageView = {
    id : Text;
    conversationId : Text;
    sender : Text;
    content : Text;
    timestamp : Int;
    profileOwner : Principal;
  };

  // Internal persistent data type
  type Conversation = {
    id : Text;
    participants : [Text];
    messages : [Message];
    profileOwner : Principal;
  };

  public type ConversationView = {
    id : Text;
    participants : [Text];
    messages : [MessageView];
    profileOwner : Principal;
  };

  // Updated persistent data type with avatarTimestamp field
  type CharacterProfile = {
    id : Text;
    name : Text;
    bio : Text;
    avatar : ?Storage.ExternalBlob;
    followers : [Text];
    owner : Principal;
    avatarTimestamp : Int; // Added field
  };

  public type CharacterProfileView = {
    id : Text;
    name : Text;
    bio : Text;
    avatar : ?Storage.ExternalBlob;
    followers : [Text];
    owner : Principal;
    avatarTimestamp : Int; // Added field
  };

  // Persistent state with persistent arrays
  let userProfiles = Map.empty<Principal, UserProfile>();
  let characterProfiles = Map.empty<Text, CharacterProfile>();
  let posts = Map.empty<Text, Post>();
  let comments = Map.empty<Text, Comment>();
  let stories = Map.empty<Text, Story>();
  let videos = Map.empty<Text, Video>();
  let conversations = Map.empty<Text, Conversation>();

  // User Profile API (required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Persistent Character Directory API
  public shared ({ caller }) func createCharacter(name : Text, bio : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create characters");
    };

    let id = "char_" # caller.toText() # "_" # "" # name # "" # Time.now().toText();
    let character = {
      id;
      name;
      bio;
      avatar = null;
      followers = [];
      owner = caller;
      avatarTimestamp = Time.now();
    };

    characterProfiles.add(id, character);
    id;
  };

  public shared ({ caller }) func updateCharacter(characterId : Text, name : Text, bio : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update characters");
    };

    let character = characterProfiles.get(characterId);
    switch (character) {
      case (?c) {
        if (c.owner != caller) {
          Runtime.trap("Unauthorized: Can only update your own characters");
        };
        let updated = { c with name; bio };
        characterProfiles.add(characterId, updated);
      };
      case (null) { Runtime.trap("Character not found") };
    };
  };

  public shared ({ caller }) func uploadAvatar(characterId : Text, image : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can upload avatars");
    };

    let character = characterProfiles.get(characterId);
    switch (character) {
      case (?c) {
        if (c.owner != caller) {
          Runtime.trap("Unauthorized: Can only update your own characters");
        };
        let updated = { c with avatar = ?image; avatarTimestamp = Time.now() };
        characterProfiles.add(characterId, updated);
      };
      case (null) { Runtime.trap("Character not found") };
    };
  };

  public shared ({ caller }) func deleteCharacter(characterId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete characters");
    };

    let character = characterProfiles.get(characterId);
    switch (character) {
      case (?c) {
        if (c.owner != caller) {
          Runtime.trap("Unauthorized: Can only delete your own characters");
        };
        characterProfiles.remove(characterId);
      };
      case (null) { Runtime.trap("Character not found") };
    };
  };

  // Social Feed API
  public shared ({ caller }) func createPost(authorId : Text, content : Text, image : ?Storage.ExternalBlob) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create posts");
    };

    // Verify author ownership: either "user" or a character owned by caller
    if (authorId != "user") {
      let character = characterProfiles.get(authorId);
      switch (character) {
        case (?c) {
          if (c.owner != caller) {
            Runtime.trap("Unauthorized: Can only post as yourself or your own characters");
          };
        };
        case (null) { Runtime.trap("Character not found") };
      };
    };

    let id = "post_" # caller.toText() # "_" # Time.now().toText();
    let post = {
      id;
      author = authorId;
      content;
      image;
      timestamp = Time.now();
      likes = [];
      profileOwner = caller;
    };
    posts.add(id, post);
    id;
  };

  public shared ({ caller }) func likePost(postId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can like posts");
    };

    let post = posts.get(postId);
    switch (post) {
      case (?p) {
        // Users can only like posts in their own profile (their own posts or their characters' posts)
        if (p.profileOwner != caller) {
          Runtime.trap("Unauthorized: Can only like posts in your own profile");
        };
        let updatedLikes = p.likes.concat([caller.toText()]);
        let updatedPost = { p with likes = updatedLikes };
        posts.add(postId, updatedPost);
      };
      case (null) { Runtime.trap("Post not found") };
    };
  };

  public shared ({ caller }) func deletePost(postId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete posts");
    };

    let post = posts.get(postId);
    switch (post) {
      case (?p) {
        if (p.profileOwner != caller) {
          Runtime.trap("Unauthorized: Can only delete your own posts");
        };
        posts.remove(postId);
      };
      case (null) { Runtime.trap("Post not found") };
    };
  };

  public shared ({ caller }) func createComment(postId : Text, authorId : Text, content : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create comments");
    };

    let post = posts.get(postId);
    switch (post) {
      case (?p) {
        // Users can only comment on posts in their own profile
        if (p.profileOwner != caller) {
          Runtime.trap("Unauthorized: Can only comment on posts in your own profile");
        };

        // Verify author ownership
        if (authorId != "user") {
          let character = characterProfiles.get(authorId);
          switch (character) {
            case (?c) {
              if (c.owner != caller) {
                Runtime.trap("Unauthorized: Can only comment as yourself or your own characters");
              };
            };
            case (null) { Runtime.trap("Character not found") };
          };
        };

        let id = "comment_" # caller.toText() # "_" # Time.now().toText();
        let comment = {
          id;
          postId;
          author = authorId;
          content;
          timestamp = Time.now();
          profileOwner = caller;
        };
        comments.add(id, comment);
        id;
      };
      case (null) { Runtime.trap("Post not found") };
    };
  };

  // Stories API
  public shared ({ caller }) func createStory(authorId : Text, image : Storage.ExternalBlob, caption : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create stories");
    };

    // Verify author ownership
    if (authorId != "user") {
      let character = characterProfiles.get(authorId);
      switch (character) {
        case (?c) {
          if (c.owner != caller) {
            Runtime.trap("Unauthorized: Can only create stories as yourself or your own characters");
          };
        };
        case (null) { Runtime.trap("Character not found") };
      };
    };

    let id = "story_" # caller.toText() # "_" # Time.now().toText();
    let story = {
      id;
      author = authorId;
      image = ?image;
      caption;
      timestamp = Time.now();
      profileOwner = caller;
    };
    stories.add(id, story);
    id;
  };

  public shared ({ caller }) func deleteStory(storyId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete stories");
    };

    let story = stories.get(storyId);
    switch (story) {
      case (?s) {
        if (s.profileOwner != caller) {
          Runtime.trap("Unauthorized: Can only delete your own stories");
        };
        stories.remove(storyId);
      };
      case (null) { Runtime.trap("Story not found") };
    };
  };

  // Videos API
  public shared ({ caller }) func createVideo(authorId : Text, video : Storage.ExternalBlob, caption : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create videos");
    };

    // Verify author ownership
    if (authorId != "user") {
      let character = characterProfiles.get(authorId);
      switch (character) {
        case (?c) {
          if (c.owner != caller) {
            Runtime.trap("Unauthorized: Can only create videos as yourself or your own characters");
          };
        };
        case (null) { Runtime.trap("Character not found") };
      };
    };

    let id = "video_" # caller.toText() # "_" # Time.now().toText();
    let videoObj = {
      id;
      author = authorId;
      video = video;
      caption;
      timestamp = Time.now();
      profileOwner = caller;
    };
    videos.add(id, videoObj);
    id;
  };

  public shared ({ caller }) func deleteVideo(videoId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete videos");
    };

    let video = videos.get(videoId);
    switch (video) {
      case (?v) {
        if (v.profileOwner != caller) {
          Runtime.trap("Unauthorized: Can only delete your own videos");
        };
        videos.remove(videoId);
      };
      case (null) { Runtime.trap("Video not found") };
    };
  };

  // Messaging API
  public shared ({ caller }) func createConversation(participants : [Text]) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create conversations");
    };

    // Verify all participants are owned by caller
    for (participantId in participants.values()) {
      if (participantId != "user") {
        let character = characterProfiles.get(participantId);
        switch (character) {
          case (?c) {
            if (c.owner != caller) {
              Runtime.trap("Unauthorized: Can only create conversations with your own characters");
            };
          };
          case (null) { Runtime.trap("Character not found: " # participantId) };
        };
      };
    };

    let id = "conv_" # caller.toText() # "_" # Time.now().toText();
    let conversation = {
      id;
      participants;
      messages = [];
      profileOwner = caller;
    };
    conversations.add(id, conversation);
    id;
  };

  public shared ({ caller }) func sendMessage(conversationId : Text, senderId : Text, content : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };

    let conv = conversations.get(conversationId);
    switch (conv) {
      case (?c) {
        if (c.profileOwner != caller) {
          Runtime.trap("Unauthorized: Can only send messages in your own conversations");
        };

        // Verify sender ownership
        if (senderId != "user") {
          let character = characterProfiles.get(senderId);
          switch (character) {
            case (?ch) {
              if (ch.owner != caller) {
                Runtime.trap("Unauthorized: Can only send messages as yourself or your own characters");
              };
            };
            case (null) { Runtime.trap("Character not found") };
          };
        };

        let messageId = "msg_" # caller.toText() # "_" # Time.now().toText();
        let message = {
          id = messageId;
          conversationId;
          sender = senderId;
          content;
          timestamp = Time.now();
          profileOwner = caller;
        };
        let updatedMessages = c.messages.concat([message]);
        let updated = { c with messages = updatedMessages };
        conversations.add(conversationId, updated);
        messageId;
      };
      case (null) { Runtime.trap("Conversation not found") };
    };
  };

  // Query functions - all filtered by caller ownership
  public query ({ caller }) func getCharacterProfiles() : async [CharacterProfileView] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view character profiles");
    };

    characterProfiles.values().toArray().filter(
      func(c : CharacterProfile) : Bool { c.owner == caller }
    ).map(
      func(c) {
        {
          id = c.id;
          name = c.name;
          bio = c.bio;
          avatar = c.avatar;
          followers = c.followers;
          owner = c.owner;
          avatarTimestamp = c.avatarTimestamp;
        };
      }
    );
  };

  public query ({ caller }) func getPosts() : async [PostView] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view posts");
    };

    posts.values().toArray().filter(
      func(p : Post) : Bool { p.profileOwner == caller }
    ).map(
      func(p) {
        {
          id = p.id;
          author = p.author;
          content = p.content;
          image = p.image;
          timestamp = p.timestamp;
          likes = p.likes;
          profileOwner = p.profileOwner;
        };
      }
    );
  };

  public query ({ caller }) func getComments(postId : Text) : async [CommentView] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view comments");
    };

    comments.values().toArray().filter(
      func(c : Comment) : Bool { c.profileOwner == caller and c.postId == postId }
    ).map(
      func(c) {
        {
          id = c.id;
          postId = c.postId;
          author = c.author;
          content = c.content;
          timestamp = c.timestamp;
          profileOwner = c.profileOwner;
        };
      }
    );
  };

  public query ({ caller }) func getStories() : async [StoryView] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view stories");
    };

    let now = Time.now();
    let ttl = 24 * 60 * 60 * 1_000_000_000; // 24 hours in nanoseconds

    stories.values().toArray().filter(
      func(s : Story) : Bool {
        s.profileOwner == caller and (now - s.timestamp) < ttl
      }
    ).map(
      func(s) {
        {
          id = s.id;
          author = s.author;
          image = s.image;
          caption = s.caption;
          timestamp = s.timestamp;
          profileOwner = s.profileOwner;
        };
      }
    );
  };

  public query ({ caller }) func getVideos() : async [VideoView] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view videos");
    };

    videos.values().toArray().filter(
      func(v : Video) : Bool { v.profileOwner == caller }
    ).map(
      func(v) {
        {
          id = v.id;
          author = v.author;
          video = v.video;
          caption = v.caption;
          timestamp = v.timestamp;
          profileOwner = v.profileOwner;
        };
      }
    );
  };

  public query ({ caller }) func getConversations() : async [ConversationView] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view conversations");
    };

    conversations.values().toArray().filter(
      func(c : Conversation) : Bool { c.profileOwner == caller }
    ).map(
      func(c) {
        {
          id = c.id;
          participants = c.participants;
          messages = c.messages.map(
            func(m) {
              {
                id = m.id;
                conversationId = m.conversationId;
                sender = m.sender;
                content = m.content;
                timestamp = m.timestamp;
                profileOwner = m.profileOwner;
              };
            }
          );
          profileOwner = c.profileOwner;
        };
      }
    );
  };

  public query ({ caller }) func getConversation(conversationId : Text) : async ?ConversationView {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view conversations");
    };

    let conv = conversations.get(conversationId);
    switch (conv) {
      case (?c) {
        if (c.profileOwner != caller) {
          Runtime.trap("Unauthorized: Can only view your own conversations");
        };
        ?{
          id = c.id;
          participants = c.participants;
          messages = c.messages.map(
            func(m) {
              {
                id = m.id;
                conversationId = m.conversationId;
                sender = m.sender;
                content = m.content;
                timestamp = m.timestamp;
                profileOwner = m.profileOwner;
              };
            }
          );
          profileOwner = c.profileOwner;
        };
      };
      case (null) { null };
    };
  };
};
