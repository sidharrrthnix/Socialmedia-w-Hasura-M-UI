import { useQuery } from "@apollo/client";
import { Paper, Typography } from "@material-ui/core";
import React, { useContext } from "react";
import { UserContext } from "../../App";
import { getDefaultUser } from "../../data";
import { SUGGEST_USERS } from "../../graphql/querires";
import { LoadingIcon } from "../../icons";
import { useFeedSideSuggestionsStyles } from "../../styles";
import FollowButton from "../shared/FollowButton";
import UserCard from "../shared/UserCard";

function FeedSideSuggestions() {
  const classes = useFeedSideSuggestionsStyles();
  const { me, followersIds } = useContext(UserContext);
  const variables = {
    limit: 5,
    followerIds: followersIds,
    createdAt: me.created_at,
  };
  const { data, loading } = useQuery(SUGGEST_USERS, { variables });

  return (
    <article className={classes.article}>
      <Paper className={classes.paper}>
        <Typography
          color="textSecondary"
          variant="subtitle2"
          component="h2"
          align="left"
          gutterBottom
          className={classes.typography}
        >
          Suggestions For You
        </Typography>
        {loading ? (
          <LoadingIcon />
        ) : (
          data?.users.map((user) => (
            <div key={user.id} className={classes.card}>
              <UserCard user={user} />
              <FollowButton id={user.id} side />
            </div>
          ))
        )}
      </Paper>
    </article>
  );
}

export default FeedSideSuggestions;
