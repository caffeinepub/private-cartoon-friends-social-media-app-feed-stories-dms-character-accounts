import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Storage "blob-storage/Storage";
import Principal "mo:core/Principal";

module {
  type OldConversation = {
    id : Text;
    participants : [Text];
    messages : [OldMessage];
    profileOwner : Principal.Principal;
  };

  type OldMessage = {
    id : Text;
    conversationId : Text;
    sender : Text;
    content : Text;
    timestamp : Int;
    profileOwner : Principal.Principal;
  };

  type OldActor = {
    conversations : Map.Map<Text, OldConversation>;
    userProfiles : Map.Map<Principal.Principal, { name : Text; bio : Text; avatar : ?Storage.ExternalBlob }>;
    posts : Map.Map<Text, { id : Text; author : Text; content : Text; image : ?Storage.ExternalBlob; timestamp : Int; likes : [Text]; profileOwner : Principal.Principal }>;
    comments : Map.Map<Text, { id : Text; postId : Text; author : Text; content : Text; timestamp : Int; profileOwner : Principal.Principal }>;
    stories : Map.Map<Text, { id : Text; author : Text; image : ?Storage.ExternalBlob; caption : Text; timestamp : Int; profileOwner : Principal.Principal }>;
    characterProfiles : Map.Map<Text, { id : Text; name : Text; bio : Text; avatar : ?Storage.ExternalBlob; followers : [Text]; owner : Principal.Principal; avatarTimestamp : Int }>;
  };

  type NewVideo = {
    id : Text;
    author : Text;
    video : Storage.ExternalBlob;
    caption : Text;
    timestamp : Int;
    profileOwner : Principal.Principal;
  };

  type NewActor = {
    conversations : Map.Map<Text, OldConversation>;
    userProfiles : Map.Map<Principal.Principal, { name : Text; bio : Text; avatar : ?Storage.ExternalBlob }>;
    posts : Map.Map<Text, { id : Text; author : Text; content : Text; image : ?Storage.ExternalBlob; timestamp : Int; likes : [Text]; profileOwner : Principal.Principal }>;
    comments : Map.Map<Text, { id : Text; postId : Text; author : Text; content : Text; timestamp : Int; profileOwner : Principal.Principal }>;
    stories : Map.Map<Text, { id : Text; author : Text; image : ?Storage.ExternalBlob; caption : Text; timestamp : Int; profileOwner : Principal.Principal }>;
    characterProfiles : Map.Map<Text, { id : Text; name : Text; bio : Text; avatar : ?Storage.ExternalBlob; followers : [Text]; owner : Principal.Principal; avatarTimestamp : Int }>;
    videos : Map.Map<Text, NewVideo>;
  };

  public func run(old : OldActor) : NewActor {
    let newVideos = Map.empty<Text, NewVideo>();
    { old with videos = newVideos };
  };
};
