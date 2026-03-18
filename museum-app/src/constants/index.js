export const COMMUNITY_PAGE_SIZE = 10;
export const PROFILE_PAGE_SIZE = 12;
export const TOTAL_PAINTINGS = 56;

export const EASE_PREMIUM = [0.16, 1, 0.3, 1];
export const EASE_SMOOTH  = [0.25, 1, 0.5, 1];

export const CHANNELS = {
    COMMUNITY_POSTS: 'community-posts',
    COMMENTS: (postId) => `comments-${postId}`,
};
