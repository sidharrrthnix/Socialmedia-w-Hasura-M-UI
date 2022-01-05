import {
  Avatar,
  Button,
  Divider,
  Hidden,
  TextField,
  Typography,
} from "@material-ui/core";
import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import Img from "react-graceful-image";
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

import OptionsDialog from "../shared/OptionsDialog";
import { defaultPost } from "../../data";
import PostSkeleton from "./PostSkeleton";
import { useMutation, useSubscription } from "@apollo/client";
import { GET_POST } from "../../graphql/subscriptions";
import { UserContext } from "../../App";
import {
  LIKE_POST,
  UNLIKE_POST,
  SAVE_POST,
  UNSAVE_POST,
  CREATE_COMMENT,
} from "../../graphql/mutations";
import { formatDateToNowShort, formatPostDate } from "../../utils/formatDate";

function Post({ postId }) {
  // console.log(postId);
  // const [loading, setLoading] = useState(true);
  const classes = usePostStyles();
  const [showOptionsDialog, setOptionsDialog] = useState(false);

  const { data, loading } = useSubscription(GET_POST, {
    variables: { postId },
  });
  // setTimeout(() => setLoading(false), 2000);
  if (loading) return <PostSkeleton />;
  const {
    id,
    media,
    likes,
    saved_posts,

    user,
    caption,
    comments,
    created_at,
    location,
    likes_aggregate,
  } = data.posts_by_pk;
  // console.log(data.posts_by_pk);
  const likesCount = likes_aggregate.aggregate.count;
  return (
    <div className={classes.postContainer}>
      <article className={classes.article}>
        <div className={classes.postHeader}>
          <UserCard user={user} location={location} avatarSize={32} />
          <MoreIcon
            className={classes.moreIcon}
            onClick={() => setOptionsDialog(true)}
          />
        </div>
        <div className={classes.postImage}>
          <Img src={media} alt="post  media" className={classes.image} />
        </div>
        <div className={classes.postButtonsWrapper}>
          <div className={classes.postButtons}>
            <LikeButton likes={likes} postId={id} authorId={user.id} />
            <Link to={`/p/${id}`}>
              <CommentIcon />
            </Link>
            <ShareIcon />
            <SaveButton savedPosts={saved_posts} postId={id} />
          </div>
          <Typography className={classes.likes} variant="subtitle2">
            <span>{likesCount === 1 ? "1 like" : `${likesCount} likes`}</span>
          </Typography>
          <div
            style={{
              overflowY: "hidden",
              height: "100%",
              padding: "16px 12px",
              "&::WebkitScrollbar": {
                display: "none",
              },
            }}
          >
            <AuthorCaption
              user={user}
              createdAt={created_at}
              caption={caption}
            />
            {comments.map((comment) => (
              <UserComment key={comment.id} comment={comment} />
            ))}
          </div>
          <Typography color="textSecondary" className={classes.datePosted}>
            {formatPostDate(created_at)}
          </Typography>
          <Hidden xsDown>
            <div className={classes.comment}>
              <Divider />
              <Comment postId={id} />
            </div>
          </Hidden>
        </div>
      </article>

      {showOptionsDialog && (
        <OptionsDialog
          postId={id}
          authorId={user.id}
          onClose={() => setOptionsDialog(false)}
        />
      )}
    </div>
  );
}

function AuthorCaption({ user, caption, createdAt }) {
  const classes = usePostStyles();

  return (
    <div style={{ display: "flex" }}>
      <Avatar
        src={user.profile_image}
        alt="User Avatar"
        style={{ marginRight: 14, width: 32, height: 32 }}
      />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <Link to={`/${user.username}`}>
          <Typography
            variant="subtitle2"
            component="span"
            className={classes.username}
          >
            {user.username}
          </Typography>
          <Typography
            variant="body2"
            component="span"
            className={classes.postCaption}
            style={{ paddingLeft: 0 }}
            dangerouslySetInnerHTML={{ __html: caption }}
          />
        </Link>
        <Typography
          style={{ marginTop: 4, marginBottom: 10, display: "inline-block" }}
          color="textSecondary"
          variant="caption"
        >
          {formatDateToNowShort(createdAt)}
        </Typography>
      </div>
    </div>
  );
}

function UserComment({ comment }) {
  const classes = usePostStyles();
  return (
    <div style={{ display: "flex" }}>
      <Avatar
        src={comment.user.profile_image}
        alt="User Avatar"
        style={{ marginRight: 14, width: 32, height: 32 }}
      />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <Link to={`/${comment.user.username}`}>
          <Typography
            variant="subtitle2"
            component="span"
            className={classes.username}
          >
            {comment.user.username}
          </Typography>
          <Typography
            variant="body2"
            component="span"
            className={classes.postCaption}
            style={{ paddingLeft: 0 }}
          >
            {comment.content}
          </Typography>
        </Link>
        <Typography
          style={{ marginTop: 4, marginBottom: 4, display: "inline-block" }}
          color="textSecondary"
          variant="caption"
        >
          {formatDateToNowShort(comment.created_at)}
        </Typography>
      </div>
    </div>
  );
}
const LikeButton = ({ likes, authorId, postId }) => {
  const classes = usePostStyles();

  const { currentUserId } = useContext(UserContext);
  const isAlreadyLiked = likes.some(({ user_id }) => user_id === currentUserId);
  const [liked, setLiked] = useState(isAlreadyLiked);
  const Icon = liked ? UnlikeIcon : LikeIcon;
  const className = liked ? classes.liked : classes.like;

  const variables = {
    postId,
    userId: currentUserId,
    profileId: authorId,
  };
  const [likePost] = useMutation(LIKE_POST);
  const [unlikePost] = useMutation(UNLIKE_POST);
  const handleLike = () => {
    setLiked(true);
    likePost({ variables });
  };
  const handleUnlike = () => {
    setLiked(false);
    unlikePost({ variables });
  };
  const onClick = liked ? handleUnlike : handleLike;

  return <Icon className={className} onClick={onClick} />;
};
const SaveButton = ({ savedPosts, postId }) => {
  const classes = usePostStyles();
  const { currentUserId } = useContext(UserContext);
  const isAlreadySaved = savedPosts.some(
    ({ user_id }) => user_id === currentUserId
  );
  const [saved, setSaved] = useState(isAlreadySaved);
  const [savePost] = useMutation(SAVE_POST);
  const [unsavePost] = useMutation(UNSAVE_POST);
  const variables = {
    postId,
    userId: currentUserId,
  };
  const Icon = saved ? RemoveIcon : SaveIcon;
  const handleSave = () => {
    setSaved(true);
    savePost({ variables });
  };
  const handleRemove = () => {
    setSaved(false);
    unsavePost({ variables });
  };
  const onClick = saved ? handleRemove : handleSave;

  return <Icon className={classes.saveIcon} onClick={onClick} />;
};
const Comment = ({ postId }) => {
  const classes = usePostStyles();
  const { currentUserId } = useContext(UserContext);
  const [content, setContent] = useState("");
  const [createComment] = useMutation(CREATE_COMMENT);
  const variables = {
    content,
    postId,
    userId: currentUserId,
  };
  const handleAddComment = () => {
    createComment({ variables });
    setContent("");
  };
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
        onClick={handleAddComment}
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
