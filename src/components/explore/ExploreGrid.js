import { useQuery } from "@apollo/client";
import { Typography } from "@material-ui/core";
import React, { useContext } from "react";
import { UserContext } from "../../App";
import { getDefaultPost } from "../../data";
import { EXPLORE_POSTS } from "../../graphql/querires";
import { LoadingLargeIcon } from "../../icons";
import { useExploreGridStyles } from "../../styles";
import GridPost from "../shared/GridPost";

function ExploreGrid() {
  const classes = useExploreGridStyles();
  const { feedIds } = useContext(UserContext);
  // console.log(followingIds);
  const variables = { feedIds };
  const { data, loading } = useQuery(EXPLORE_POSTS, { variables });
  // console.log(data);
  return (
    <>
      <Typography
        color="textSecondary"
        variant="subtitle2"
        component="h2"
        gutterBottom
        className={classes.typography}
      >
        Explore
      </Typography>
      {loading ? (
        <LoadingLargeIcon />
      ) : (
        <article className={classes.article}>
          <div className={classes.postContainer}>
            {data?.posts.map((post) => (
              <GridPost key={post.id} post={post} />
            ))}
          </div>
        </article>
      )}
    </>
  );
}

export default ExploreGrid;
