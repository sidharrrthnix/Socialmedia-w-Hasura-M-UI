import { gql } from "@apollo/client";

export const ME = gql`
  subscription me($userId: String) {
    users(where: { user_id: { _eq: $userId } }) {
      name
      profile_image
      user_id
      id
      last_checked
      username
      created_at
      followers {
        user {
          id
          user_id
        }
      }
      following {
        user {
          id
          user_id
        }
      }
      notifications(order_by: { created_at: desc }) {
        id
        type
        created_at
        post {
          id
          media
        }
        user {
          id
          username
          profile_image
        }
        profile_id
      }
    }
  }
`;

export const GET_POST = gql`
  subscription getPost($postId: uuid!) {
    posts_by_pk(id: $postId) {
      id
      caption
      created_at
      media
      location
      user_id
      likes {
        id
        user_id
        post_id
      }
      user {
        id
        username
        name
        profile_image
      }
      likes_aggregate {
        aggregate {
          count
        }
      }
      saved_posts {
        id
        user_id
      }
      comments_aggregate {
        aggregate {
          count
        }
      }
      comments(order_by: { created_at: desc }) {
        id
        content
        created_at
        user {
          username
          profile_image
        }
      }
    }
  }
`;
