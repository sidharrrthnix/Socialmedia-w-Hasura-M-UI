import { useLazyQuery, useQuery } from "@apollo/client";
import { Typography } from "@material-ui/core";
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { defaultUser, getDefaultPost } from "../../data";
import { GET_MORE_POSTS_FROM_USER, GET_POST } from "../../graphql/querires";
import { LoadingLargeIcon } from "../../icons";
import { useMorePostsFromUserStyles } from "../../styles";
import GridPost from "../shared/GridPost";

function MorePostsFromUser({ postId }) {
  const classes = useMorePostsFromUserStyles();

  const variables = {
    postId,
  };
  const { data, loading } = useQuery(GET_POST, { variables });
  const [getMorePostsFromUser, { data: morePosts, loading: gqlLoading }] =
    useLazyQuery(GET_MORE_POSTS_FROM_USER);

  useEffect(() => {
    if (loading) return;
    const userId = data?.posts_by_pk.user.id;
    const postId = data?.posts_by_pk.id;
    getMorePostsFromUser({ variables: { userId, postId } });
  }, [data, loading, getMorePostsFromUser]);
  return (
    <div className={classes.container}>
      {loading || gqlLoading ? (
        <LoadingLargeIcon />
      ) : (
        <>
          <Typography
            color="textSecondary"
            variant="subtitle2"
            component="h2"
            gutterBottom
            className={classes.typography}
          >
            More Post from {"  "}
            <Link
              to={`/${data?.posts_by_pk.user.username}`}
              className={classes.link}
            >
              @{data?.posts_by_pk.user.username}
            </Link>
          </Typography>

          <article className={classes.article}>
            <div className={classes.postContainer}>
              {morePosts?.posts.map((post) => (
                <GridPost key={post.id} post={post} />
              ))}
            </div>
          </article>
        </>
      )}
    </div>
  );
}

export default MorePostsFromUser;
