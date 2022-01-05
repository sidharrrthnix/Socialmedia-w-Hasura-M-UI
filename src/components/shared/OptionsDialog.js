import { useMutation } from "@apollo/client";
import { Button, Dialog, Divider, Zoom } from "@material-ui/core";
import React, { useContext } from "react";
import { Link, useHistory } from "react-router-dom";
import { UserContext } from "../../App";
import { defaultPost } from "../../data";
import { DELETE_POST, UNFOLLOW_USER } from "../../graphql/mutations";
import { useOptionsDialogStyles } from "../../styles";

function OptionsDialog({ onClose, postId, authorId }) {
  const classes = useOptionsDialogStyles();
  const { currentUserId, followingIds } = useContext(UserContext);
  const isOwner = currentUserId === authorId;
  const isFollowing = followingIds.some((id) => id === authorId);
  const buttonText = isOwner ? "Delete" : "Unfollow";

  const isUnrelatedUser = !isOwner && !isFollowing;
  const [unfollowUser] = useMutation(UNFOLLOW_USER);
  const [deletePost] = useMutation(DELETE_POST);
  const history = useHistory();
  const handleDeletePost = async () => {
    const variables = {
      postId,
      userId: currentUserId,
    };
    await deletePost({ variables });
    onClose();
    history.push("/");
    window.location.reload();
  };
  const handleUnfollowUser = () => {
    const variables = {
      userIdToFollow: authorId,
      currentUserId,
    };
    unfollowUser({ variables });
    onClose();
  };
  const onClick = isOwner ? handleDeletePost : handleUnfollowUser;
  return (
    <Dialog
      open
      classes={{ scrollPaper: classes.dialogScrollPaper }}
      onClose={onClose}
      TransitionComponent={Zoom}
    >
      {!isUnrelatedUser && (
        <Button className={classes.redButton} onClick={onClick}>
          {buttonText}
        </Button>
      )}
      <Divider />
      <Button className={classes.button}>
        <Link to={`/p/${postId}`}>Go To Post</Link>
      </Button>
      <Divider />
      <Button className={classes.button}>Share</Button>
      <Divider />
      <Button className={classes.button}>Copy Link</Button>
      <Divider />
      <Button onClick={onClose} className={classes.button}>
        Cancel
      </Button>
    </Dialog>
  );
}

export default OptionsDialog;
