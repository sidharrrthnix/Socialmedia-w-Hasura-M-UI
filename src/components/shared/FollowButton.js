import { useMutation } from "@apollo/client";
import { Button } from "@material-ui/core";
import React, { useContext, useState } from "react";
import { UserContext } from "../../App";
import { FOLLOW_USER, UNFOLLOW_USER } from "../../graphql/mutations";
import { useFollowButtonStyles } from "../../styles";

function FollowButton({ side, id }) {
  const classes = useFollowButtonStyles({ side });
  const { currentUserId, followingIds } = useContext(UserContext);
  const isAlreadyFollowing = followingIds?.some(
    (followingIds) => followingIds === id
  );
  const [isFollowing, setFollowing] = useState(isAlreadyFollowing);
  const [followUser] = useMutation(FOLLOW_USER);
  const [unfollowUser] = useMutation(UNFOLLOW_USER);
  const variables = {
    userIdToFollow: id,
    currentUserId,
  };
  const handleFollowUser = () => {
    followUser({ variables });
    setFollowing(true);
  };
  const handleUnfollowUser = () => {
    unfollowUser({ variables });
    setFollowing(false);
  };
  const followButton = (
    <Button
      variant={side ? "text" : "contained"}
      color="primary"
      className={classes.button}
      onClick={handleFollowUser}
      fullWidth
    >
      Follow
    </Button>
  );
  const followingButton = (
    <Button
      variant={side ? "text" : "outlined"}
      className={classes.button}
      onClick={handleUnfollowUser}
      fullWidth
    >
      Following
    </Button>
  );

  return isFollowing ? followingButton : followButton;
}

export default FollowButton;
