import {
  Button,
  Divider,
  Hidden,
  TextField,
  Typography,
} from "@material-ui/core";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  CommentIcon,
  LikeIcon,
  MoreIcon,
  RemoveIcon,
  SaveIcon,
  ShareIcon,
  UnlikeIcon,
} from "../../icons";
import { usePostStyles } from "../../styles";
import UserCard from "../shared/UserCard";

import pic from "../../images/pic.jpeg";

import OptionsDialog from "../shared/OptionsDialog";
import { defaultPost } from "../../data";
import PostSkeleton from "./PostSkeleton";

function Post() {
  const { id, media, likes, user, caption, comments } = defaultPost;
  const [showOptionsDialog, setOptionsDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const classes = usePostStyles();
  setTimeout(() => setLoading(false), 2000);
  if (loading) return <PostSkeleton />;
  return (
    <div className={classes.postContainer}>
      <article className={classes.article}>
        <div className={classes.postHeader}>
          <UserCard user={user} avatarSize={32} />
          <MoreIcon
            className={classes.moreIcon}
            onClick={() => setOptionsDialog(true)}
          />
        </div>
        <div className={classes.postImage}>
          <img src={pic} alt="post  media" className={classes.image} />
        </div>
        <div className={classes.postButtonsWrapper}>
          <div className={classes.postButtons}>
            <LikeButton />
            <Link to={`/p/${id}`}>
              <CommentIcon />
            </Link>
            <ShareIcon />
            <SaveButton />
          </div>
          <Typography className={classes.likes} variant="subtitle2">
            <span>{likes === 1 ? "1 like" : `${likes} likes`}</span>
          </Typography>
          <div className={classes.postCaptionContainer}>
            <Typography
              variant="body2"
              component="span"
              className={classes.postCaption}
              dangerouslySetInnerHTML={{ __html: caption }}
            />

            {comments.map((comment) => (
              <div key={comment.id}>
                <Link to={`/${comment.user.username}`}>
                  <Typography
                    variant="subtitle2"
                    component="span"
                    className={classes.commentUsername}
                  >
                    {comment.user.username}
                  </Typography>{" "}
                  {"  "}
                  <Typography variant="body2" component="span">
                    {comment.content}
                  </Typography>
                </Link>
              </div>
            ))}
          </div>
          <Typography color="textSecondary" className={classes.datePosted}>
            6 DAYS AGO
          </Typography>
          <Hidden xsDown>
            <div className={classes.comment}>
              <Divider />
              <Comment />
            </div>
          </Hidden>
        </div>
      </article>

      {showOptionsDialog && (
        <OptionsDialog onClose={() => setOptionsDialog(false)} />
      )}
    </div>
  );
}
const LikeButton = () => {
  const classes = usePostStyles();
  const [liked, setLiked] = useState(false);
  const Icon = liked ? UnlikeIcon : LikeIcon;
  const className = liked ? classes.liked : classes.like;
  const handleLike = () => {
    setLiked(true);
  };
  const handleUnlike = () => {
    setLiked(false);
  };
  const onClick = liked ? handleUnlike : handleLike;

  return <Icon className={className} onClick={onClick} />;
};
const SaveButton = () => {
  const classes = usePostStyles();
  const [saved, setSaved] = useState(false);
  const Icon = saved ? RemoveIcon : SaveIcon;
  const handleSave = () => {
    setSaved(true);
  };
  const handleRemove = () => setSaved(false);
  const onClick = saved ? handleRemove : handleSave;

  return <Icon className={classes.saveIcon} onClick={onClick} />;
};
const Comment = () => {
  const classes = usePostStyles();
  const [content, setContent] = useState("");

  return (
    <div className={classes.commentContainer}>
      <TextField
        fullWidth
        value={content}
        placeholder="Add a comment..."
        multiline
        className={classes.textField}
        rowsMax={2}
        rows={1}
        onChange={(e) => setContent(e.target.value)}
        InputProps={{
          classes: {
            root: classes.root,
            underline: classes.underline,
          },
        }}
      />
      <Button
        color="primary"
        className={classes.commentButton}
        disabled={!content.trim()}
      >
        Post
      </Button>
    </div>
  );
};

export default Post;
