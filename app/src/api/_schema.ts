/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface paths {
  "/_prometheus": {
    get: operations["get_prometheus"];
  };
  "/api/public-feed": {
    get: operations["getPublicFeed"];
  };
  "/api/feed": {
    get: operations["getUserFeed"];
  };
  "/api/playlists/{userName}": {
    get: operations["getUserPlaylist"];
  };
  "/api/playlists/{userName}/liked": {
    get: operations["getUserLikesPlaylist"];
  };
  "/api/mixtapes": {
    post: operations["postApiMixtapes"];
  };
  "/api/mixtapes/{id}": {
    get: operations["getApiMixtapesWithId"];
    delete: operations["deleteApiMixtapesWithId"];
  };
  "/api/mixtapes/{mixtapeId}/songs": {
    post: operations["postApiMixtapesWithMixtapeidSongs"];
  };
  "/api/mixtapes/{mixtapeId}/songs/{songId}": {
    delete: operations["deleteApiMixtapesWithMixtapeidSongsWithSongid"];
  };
  "/api/mixtapes/{mixtapeId}/order": {
    post: operations["postApiMixtapesWithMixtapeidOrder"];
  };
  "/api/mixtapes/{mixtapeId}/title": {
    post: operations["postApiMixtapesWithMixtapeidTitle"];
  };
  "/api/mixtapes/{mixtapeId}/publish": {
    post: operations["postApiMixtapesWithMixtapeidPublish"];
  };
  "/api/draft-mixtapes": {
    get: operations["getApiDraftMixtapes"];
  };
  "/api/search": {
    get: operations["getApiSearch"];
  };
  "/api/search-details/songs": {
    get: operations["getApiSearchDetailsSongs"];
  };
  "/api/search-details/albums": {
    get: operations["getApiSearchDetailsAlbums"];
  };
  "/api/posts": {
    post: operations["postApiPosts"];
  };
  "/api/posts/{postId}": {
    delete: operations["deleteApiPostsWithPostid"];
  };
  "/api/posts/{postId}/report": {
    put: operations["putApiPostsWithPostidReport"];
  };
  "/api/likes/{type}/{itemId}": {
    put: operations["createLike"];
    delete: operations["deleteLike"];
  };
  "/api/me": {
    get: operations["getApiMe"];
  };
  "/api/friend-suggestions": {
    get: operations["getApiFriendSuggestions"];
  };
  "/api/users/{userName}": {
    get: operations["getApiUsersWithUsername"];
  };
  "/api/users/{userName}/following": {
    get: operations["getApiUsersWithUsernameFollowing"];
  };
  "/api/users/{userName}/followers": {
    get: operations["getApiUsersWithUsernameFollowers"];
  };
  "/api/following/{followName}": {
    put: operations["putApiFollowingWithFollowname"];
    delete: operations["deleteApiFollowingWithFollowname"];
  };
  "/api/notifications": {
    get: operations["getApiNotifications"];
  };
  "/api/notifications/mark-all-read": {
    post: operations["postApiNotificationsMarkAllRead"];
  };
  "/api/notifications/{id}/read": {
    post: operations["postApiNotificationsWithIdRead"];
  };
  "/api/sign-in-token": {
    post: operations["postApiSignInToken"];
  };
  "/api/validate-sign-in-code": {
    post: operations["postApiValidateSignInCode"];
  };
  "/api/registration": {
    post: operations["postApiRegistration"];
  };
  "/api/sign-in": {
    post: operations["postApiSignIn"];
  };
  "/api/sign-out": {
    post: operations["postApiSignOut"];
  };
  "/api/settings/email-subscription": {
    get: operations["getApiSettingsEmailSubscription"];
    post: operations["postApiSettingsEmailSubscription"];
    delete: operations["deleteApiSettingsEmailSubscription"];
  };
  "/api/settings/color-scheme": {
    post: operations["postApiSettingsColorScheme"];
  };
  "/api/settings/go-public": {
    post: operations["postApiSettingsGoPublic"];
  };
  "/api/settings/go-private": {
    post: operations["postApiSettingsGoPrivate"];
  };
  "/api/songs/{songId}/listened": {
    put: operations["putApiSongsWithSongidListened"];
    delete: operations["deleteApiSongsWithSongidListened"];
  };
}

export interface components {
  schemas: {
    Album: {
      id: number;
      title: string;
      artists: string[];
      albumArt?: string;
      spotifyId?: string;
      appleMusicId?: string;
      appleMusicUrl?: string;
      bandcampId?: string;
      bandcampUrl?: string;
      meta?: components["schemas"]["ItemMeta"];
    };
    ColorScheme: {
      backgroundGradientName: string;
      textColor: string;
    };
    FeedPlaylistEntry: {
      timestamp: number;
      song?: components["schemas"]["SongWithMeta"];
      mixtape?: components["schemas"]["MixtapePreview"];
      album?: components["schemas"]["Album"];
      type: "song" | "mixtape" | "album";
      posts: components["schemas"]["FeedPlaylistPost"][];
    };
    FeedPlaylistPost: {
      postId: number;
      userName: string;
      noteText?: string;
      timestamp: number;
    };
    FeedPlaylistResponse: {
      items: components["schemas"]["FeedPlaylistEntry"][];
      limit: number;
      profiles: components["schemas"]["UserProfile"][];
    };
    ItemMeta: {
      likeCount: number;
      isLiked: boolean;
    };
    MixtapePreview: {
      id: number;
      title: string;
      slug: string;
      publishedAt?: number;
      songCount: number;
      authorName: string;
      meta: components["schemas"]["ItemMeta"];
    };
    SongWithMeta: {
      id: number;
      title: string;
      artists: string[];
      album?: string;
      albumArt?: string;
      spotifyId?: string;
      isrcId?: string;
      appleMusicId?: string;
      appleMusicUrl?: string;
      bandcampId?: string;
      bandcampUrl?: string;
      meta: components["schemas"]["ItemMeta"];
    };
    UserProfile: {
      id: number;
      name: string;
      colorScheme: components["schemas"]["ColorScheme"];
    };
    UserPlaylistEntry: {
      timestamp: number;
      song?: components["schemas"]["SongWithMeta"];
      mixtape?: components["schemas"]["MixtapePreview"];
      album?: components["schemas"]["Album"];
      type: "song" | "mixtape" | "album";
      postId?: number;
      noteText?: string;
    };
    UserPlaylistResponse: {
      items: components["schemas"]["UserPlaylistEntry"][];
      limit: number;
      profiles: components["schemas"]["UserProfile"][];
    };
    CreateBody: {
      title: string;
    };
    MixtapeWithSongsReponse: {
      mixtape: components["schemas"]["MixtapePreview"];
      tracks: components["schemas"]["SongWithMeta"][];
      author: components["schemas"]["UserProfile"];
    };
    AddSongBody: {
      source: "spotify" | "bandcamp" | "appleMusic";
      key: string;
    };
    ReorderSongsBody: {
      songOrder: number[];
    };
    RenameMixtapeBody: {
      title: string;
    };
    RenameMixtapeResponse: {
      newSlug: string;
    };
    GetDraftMixtapesResponse: {
      mixtapes: components["schemas"]["MixtapePreview"][];
    };
    AlbumSearchResult: {
      title: string;
      artists: string[];
      albumArt: string;
      source: "spotify" | "bandcamp" | "appleMusic";
      key: string;
    };
    SearchResponse: {
      songs?: components["schemas"]["SongSearchResult"][];
      albums?: components["schemas"]["AlbumSearchResult"][];
    };
    SongSearchResult: {
      title: string;
      album: string;
      artists: string[];
      albumArt: string;
      source: "spotify" | "bandcamp" | "appleMusic";
      key: string;
    };
    ItemSource: "spotify" | "bandcamp" | "appleMusic";
    SearchDetailsResponse: {
      spotifyId?: string;
      appleMusicId?: string;
      appleMusicUrl?: string;
      bandcampId?: string;
      bandcampUrl?: string;
    };
    PostSongBody: {
      type: "song" | "album";
      source: "spotify" | "bandcamp" | "appleMusic";
      key: string;
      noteText?: string;
      postTweet: boolean;
    };
    LikeSource: "post" | "like" | "mixtape";
    CurrentUser: {
      id: number;
      name: string;
      following: components["schemas"]["PublicUser"][];
      twitterName?: string;
      showInPublicFeed: boolean;
      email: string;
      unreadNotificationCount: number;
      profile: components["schemas"]["UserProfile"];
    };
    GetCurrentUserResponse: {
      user?: components["schemas"]["CurrentUser"];
    };
    PublicUser: {
      id: number;
      name: string;
    };
    TwitterFriendSuggestion: {
      profile: components["schemas"]["UserProfile"];
      twitterName: string;
      twitterAvatar: string;
    };
    TwitterFriendSuggestionsResponse: {
      users: components["schemas"]["TwitterFriendSuggestion"][];
    };
    GetUserProfileResponse: {
      userProfile: components["schemas"]["UserProfile"];
    };
    UserFollowingResponse: {
      users: components["schemas"]["UserProfile"][];
    };
    FollowUserResponse: {
      user: components["schemas"]["PublicUser"];
    };
    NotificationItem: {
      id: number;
      type: "like" | "follow" | "join" | "system";
      body: string;
      url: string;
      timestamp: number;
      seen: boolean;
    };
    SendSignInTokenBody: {
      email: string;
      signupReferral?: string;
      dest?: string;
      sendCodeInsteadOfLink?: boolean;
    };
    SendSignInTokenSkipAuthResponse: {
      token: string;
      isRegistration: boolean;
    };
    ValidateSignInCodeBody: {
      email: string;
      code: string;
      signupReferral?: string;
    };
    RegisterBody: {
      token: string;
      name: string;
      subscribeToNewsletter: boolean;
      showInPublicFeed: boolean;
      referral?: string;
    };
    SignInBody: {
      signInToken: string;
    };
    SignInResponse: {
      authToken: string;
    };
    GetNewsletterSubscriptionStatusResponse: {
      subscribed: boolean;
    };
    UpdateColorSchemeBody: {
      backgroundGradientName: string;
      textColor: string;
    };
  };
}

export interface operations {
  get_prometheus: {
    responses: {
      /** Default response */
      200: unknown;
    };
  };
  getPublicFeed: {
    parameters: {
      query: {
        /** Filter to only entries before this timestamp */
        before?: string;
        /** Filter to only entries after this timestamp */
        after?: string;
      };
    };
    responses: {
      /** OK */
      200: {
        content: {
          "application/json": components["schemas"]["FeedPlaylistResponse"];
        };
      };
    };
  };
  getUserFeed: {
    parameters: {
      query: {
        /** Filter to only entries before this timestamp */
        before?: string;
        /** Filter to only entries after this timestamp */
        after?: string;
      };
    };
    responses: {
      /** OK */
      200: {
        content: {
          "application/json": components["schemas"]["FeedPlaylistResponse"];
        };
      };
    };
  };
  getUserPlaylist: {
    parameters: {
      path: {
        userName: string;
      };
      query: {
        /** Filter to only entries before this timestamp */
        before?: string;
        /** Filter to only entries after this timestamp */
        after?: string;
        /** If true, only returns mixtapes */
        onlyMixtapes?: boolean;
      };
    };
    responses: {
      /** OK */
      200: {
        content: {
          "application/json": components["schemas"]["UserPlaylistResponse"];
        };
      };
    };
  };
  getUserLikesPlaylist: {
    parameters: {
      path: {
        userName: string;
      };
      query: {
        /** Filter to only entries before this timestamp */
        before?: string;
        /** Filter to only entries after this timestamp */
        after?: string;
      };
    };
    responses: {
      /** OK */
      200: {
        content: {
          "application/json": components["schemas"]["UserPlaylistResponse"];
        };
      };
    };
  };
  postApiMixtapes: {
    responses: {
      /** OK */
      200: {
        content: {
          "application/json": components["schemas"]["MixtapeWithSongsReponse"];
        };
      };
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["CreateBody"];
      };
    };
  };
  getApiMixtapesWithId: {
    parameters: {
      path: {
        id: number;
      };
    };
    responses: {
      /** OK */
      200: {
        content: {
          "application/json": components["schemas"]["MixtapeWithSongsReponse"];
        };
      };
    };
  };
  deleteApiMixtapesWithId: {
    parameters: {
      path: {
        id: number;
      };
    };
    responses: {
      /** No Content */
      204: never;
    };
  };
  postApiMixtapesWithMixtapeidSongs: {
    parameters: {
      path: {
        mixtapeId: number;
      };
    };
    responses: {
      /** OK */
      200: {
        content: {
          "application/json": components["schemas"]["SongWithMeta"];
        };
      };
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["AddSongBody"];
      };
    };
  };
  deleteApiMixtapesWithMixtapeidSongsWithSongid: {
    parameters: {
      path: {
        mixtapeId: number;
        songId: number;
      };
    };
    responses: {
      /** No Content */
      204: never;
    };
  };
  postApiMixtapesWithMixtapeidOrder: {
    parameters: {
      path: {
        mixtapeId: number;
      };
    };
    responses: {
      /** No Content */
      204: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["ReorderSongsBody"];
      };
    };
  };
  postApiMixtapesWithMixtapeidTitle: {
    parameters: {
      path: {
        mixtapeId: number;
      };
    };
    responses: {
      /** OK */
      200: {
        content: {
          "application/json": components["schemas"]["RenameMixtapeResponse"];
        };
      };
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["RenameMixtapeBody"];
      };
    };
  };
  postApiMixtapesWithMixtapeidPublish: {
    parameters: {
      path: {
        mixtapeId: number;
      };
    };
    responses: {
      /** No Content */
      204: never;
    };
  };
  getApiDraftMixtapes: {
    responses: {
      /** OK */
      200: {
        content: {
          "application/json": components["schemas"]["GetDraftMixtapesResponse"];
        };
      };
    };
  };
  getApiSearch: {
    parameters: {
      query: {
        /** What type of item to search for ('song' or 'album') */
        type?: string;
        /** The search query */
        query?: string;
      };
    };
    responses: {
      /** OK */
      200: {
        content: {
          "application/json": components["schemas"]["SearchResponse"];
        };
      };
    };
  };
  getApiSearchDetailsSongs: {
    parameters: {
      query: {
        source: components["schemas"]["ItemSource"];
        key: string;
      };
    };
    responses: {
      /** OK */
      200: {
        content: {
          "application/json": components["schemas"]["SearchDetailsResponse"];
        };
      };
    };
  };
  getApiSearchDetailsAlbums: {
    parameters: {
      query: {
        source: components["schemas"]["ItemSource"];
        key: string;
      };
    };
    responses: {
      /** OK */
      200: {
        content: {
          "application/json": components["schemas"]["SearchDetailsResponse"];
        };
      };
    };
  };
  postApiPosts: {
    responses: {
      /** OK */
      200: {
        content: {
          "application/json":
            | components["schemas"]["Album"]
            | components["schemas"]["SongWithMeta"];
        };
      };
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["PostSongBody"];
      };
    };
  };
  deleteApiPostsWithPostid: {
    parameters: {
      path: {
        postId: number;
      };
    };
    responses: {
      /** No Content */
      204: never;
    };
  };
  putApiPostsWithPostidReport: {
    parameters: {
      path: {
        postId: number;
      };
    };
    responses: {
      /** No Content */
      204: never;
    };
  };
  createLike: {
    parameters: {
      path: {
        /** One of 'songs', 'mixtapes, or 'albums' */
        type: string;
        itemId: number;
      };
      query: {
        /** The origin of the like. 'post' indicates feed or playlist, 'like' indicates a likes list, 'mixtape' indicates a mixtape songs listing. */
        likeSource: components["schemas"]["LikeSource"];
        /** If likeSource is 'mixtape', this is the id of the source mixtape */
        sourceMixtapeId?: number;
        /** If likeSource is 'like' or 'post', this is the name(s) of the source user (joined with a comma) */
        sourceUserNames?: string;
      };
    };
    responses: {
      /** No Content */
      204: never;
    };
  };
  deleteLike: {
    parameters: {
      path: {
        /** One of 'songs', 'mixtapes, or 'albums' */
        type: string;
        itemId: number;
      };
    };
    responses: {
      /** No Content */
      204: never;
    };
  };
  getApiMe: {
    responses: {
      /** OK */
      200: {
        content: {
          "application/json": components["schemas"]["GetCurrentUserResponse"];
        };
      };
    };
  };
  getApiFriendSuggestions: {
    responses: {
      /** OK */
      200: {
        content: {
          "application/json": components["schemas"]["TwitterFriendSuggestionsResponse"];
        };
      };
    };
  };
  getApiUsersWithUsername: {
    parameters: {
      path: {
        userName: string;
      };
    };
    responses: {
      /** OK */
      200: {
        content: {
          "application/json": components["schemas"]["GetUserProfileResponse"];
        };
      };
    };
  };
  getApiUsersWithUsernameFollowing: {
    parameters: {
      path: {
        userName: string;
      };
    };
    responses: {
      /** OK */
      200: {
        content: {
          "application/json": components["schemas"]["UserFollowingResponse"];
        };
      };
    };
  };
  getApiUsersWithUsernameFollowers: {
    parameters: {
      path: {
        userName: string;
      };
    };
    responses: {
      /** OK */
      200: {
        content: {
          "application/json": components["schemas"]["UserFollowingResponse"];
        };
      };
    };
  };
  putApiFollowingWithFollowname: {
    parameters: {
      path: {
        followName: string;
      };
    };
    responses: {
      /** OK */
      200: {
        content: {
          "application/json": components["schemas"]["FollowUserResponse"];
        };
      };
    };
  };
  deleteApiFollowingWithFollowname: {
    parameters: {
      path: {
        followName: string;
      };
    };
    responses: {
      /** No Content */
      204: never;
    };
  };
  getApiNotifications: {
    responses: {
      /** OK */
      200: {
        content: {
          "application/json": components["schemas"]["NotificationItem"][];
        };
      };
    };
  };
  postApiNotificationsMarkAllRead: {
    responses: {
      /** No Content */
      204: never;
    };
  };
  postApiNotificationsWithIdRead: {
    parameters: {
      path: {
        id: string;
        notificationId: number;
      };
    };
    responses: {
      /** No Content */
      204: never;
    };
  };
  postApiSignInToken: {
    responses: {
      /** Skip-auth response sent for debugging in dev mode only */
      200: {
        content: {
          "application/json": components["schemas"]["SendSignInTokenSkipAuthResponse"];
        };
      };
      /** No Content */
      204: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["SendSignInTokenBody"];
      };
    };
  };
  postApiValidateSignInCode: {
    responses: {
      /** OK */
      200: {
        content: {
          "application/json": components["schemas"]["ValidateSignInCodeBody"];
        };
      };
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["ValidateSignInCodeBody"];
      };
    };
  };
  postApiRegistration: {
    responses: {
      /** No Content */
      204: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["RegisterBody"];
      };
    };
  };
  postApiSignIn: {
    responses: {
      /** OK */
      200: {
        content: {
          "application/json": components["schemas"]["SignInResponse"];
        };
      };
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["SignInBody"];
      };
    };
  };
  postApiSignOut: {
    responses: {
      /** No Content */
      204: never;
    };
  };
  getApiSettingsEmailSubscription: {
    responses: {
      /** OK */
      200: {
        content: {
          "application/json": components["schemas"]["GetNewsletterSubscriptionStatusResponse"];
        };
      };
    };
  };
  postApiSettingsEmailSubscription: {
    responses: {
      /** No Content */
      204: never;
    };
  };
  deleteApiSettingsEmailSubscription: {
    responses: {
      /** No Content */
      204: never;
    };
  };
  postApiSettingsColorScheme: {
    responses: {
      /** No Content */
      204: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["UpdateColorSchemeBody"];
      };
    };
  };
  postApiSettingsGoPublic: {
    responses: {
      /** No Content */
      204: never;
    };
  };
  postApiSettingsGoPrivate: {
    responses: {
      /** No Content */
      204: never;
    };
  };
  putApiSongsWithSongidListened: {
    parameters: {
      path: {
        songId: number;
      };
    };
    responses: {
      /** No Content */
      204: never;
    };
  };
  deleteApiSongsWithSongidListened: {
    parameters: {
      path: {
        songId: number;
      };
    };
    responses: {
      /** No Content */
      204: never;
    };
  };
}