import {
  Button,
  Divider,
  Hidden,
  TextField,
  Typography,
} from "@material-ui/core";
import React, { useContext, useState } from "react";
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
import { useFeedPostStyles } from "../../styles";
import UserCard from "../shared/UserCard";
import HTMLEllipsis from "react-lines-ellipsis/lib/html";
import pic from "../../images/pic.jpeg";
import FollowSuggestions from "../shared/FollowSuggestions";
import OptionsDialog from "../shared/OptionsDialog";
import { formatDateToNow } from "../../utils/formatDate";
import Img from "react-graceful-image";
import { UserContext } from "../../App";
import { useMutation } from "@apollo/client";
import {
  CREATE_COMMENT,
  LIKE_POST,
  SAVE_POST,
  UNLIKE_POST,
  UNSAVE_POST,
} from "../../graphql/mutations";
import { GET_FEED } from "../../graphql/querires";
function FeedPost({ post, index }) {
  const {
    id,
    media,
    likes,
    user,
    caption,
    comments,
    likes_aggregate,
    comments_aggregate,
    saved_posts,
    location,
    created_at,
  } = post;
  const [showOptionsDialog, setOptionsDialog] = useState(false);
  const [showCaption, setCaption] = useState(false);
  const classes = useFeedPostStyles();
  const showFollowSuggestions = index === 1;
  const likesCount = likes_aggregate.aggregate.count;
  const commentsCount = comments_aggregate.aggregate.count;
  return (
    <>
      <article
        className={classes.article}
        style={{ marginBottom: showFollowSuggestions && 30 }}
      >
        <div className={classes.postHeader}>
          <UserCard user={user} location={location} />
          <MoreIcon
            className={classes.moreIcon}
            onClick={() => setOptionsDialog(true)}
          />
        </div>
        <div>
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
          <div className={showCaption ? classes.expanded : classes.collapsed}>
            <Link to={`/${user.username}`}>
              <Typography
                variant="subtitle2"
                component="span"
                className={classes.username}
              >
                {user.username}
              </Typography>
            </Link>
            {showCaption ? (
              <Typography
                variant="body2"
                component="span"
                dangerouslySetInnerHTML={{ __html: caption }}
              />
            ) : (
              <div className={classes.captionWrapper}>
                <HTMLEllipsis
                  unsafeHTML={caption}
                  className={classes.caption}
                  maxLine="0"
                  ellipsis="..."
                  basedOn="letters"
                />
                <Button
                  className={classes.moreButton}
                  onClick={() => setCaption(true)}
                >
                  more
                </Button>
              </div>
            )}
          </div>
          <Link to={`/p/${id}`}>
            <Typography
              className={classes.commentsLink}
              variant="body2"
              component="div"
            >
              view all {commentsCount} comments
            </Typography>
          </Link>
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
          <Typography color="textSecondary" className={classes.datePosted}>
            {formatDateToNow(created_at)}
          </Typography>
        </div>
        <Hidden xsDown>
          <Divider />
          <Comment postId={id} />
        </Hidden>
      </article>
      {showFollowSuggestions && <FollowSuggestions />}
      {showOptionsDialog && (
        <OptionsDialog
          authorId={user.id}
          postId={id}
          onClose={() => setOptionsDialog(false)}
        />
      )}
    </>
  );
}
const LikeButton = ({ likes, postId, authorId }) => {
  const classes = useFeedPostStyles();
  const { currentUserId, feedIds } = useContext(UserContext);
  const isAlreadyLiked = likes.some(({ user_id }) => user_id === currentUserId);
  const [liked, setLiked] = useState(isAlreadyLiked);
  const Icon = liked ? UnlikeIcon : LikeIcon;
  const className = liked ? classes.liked : classes.like;
  const [likePost] = useMutation(LIKE_POST);
  const [unlikePost] = useMutation(UNLIKE_POST);
  const variables = {
    postId,
    userId: currentUserId,
    profileId: authorId,
  };

  const handleUpdate = (cache, result) => {
    // const variables = { limit: 20, feedIds };
    const data = cache.readQuery({
      query: GET_FEED,
      variables: { limit: 30, feedIds },
    });
    // console.log(feedIds);
    // console.log("data", data, "result", result);
    const typename = result.data.insert_likes?.__typename;
    const count = typename === "likes_mutation_response" ? 1 : -1;
    const posts = data.posts.map((post) => ({
      ...post,
      likes_aggregate: {
        ...post.likes_aggregate,
        aggregate: {
          ...post.likes_aggregate.aggregate,
          count: post.likes_aggregate.aggregate.count + count,
        },
      },
    }));
    cache.writeQuery({ query: GET_FEED, data: { posts } });
  };
  const handleLike = async () => {
    setLiked(true);
    await likePost({ variables, update: handleUpdate });
  };
  const handleUnlike = async () => {
    setLiked(false);
    await unlikePost({ variables, update: handleUpdate });
  };
  const onClick = liked ? handleUnlike : handleLike;

  return <Icon className={className} onClick={onClick} />;
};
const SaveButton = ({ savedPosts, postId }) => {
  const classes = useFeedPostStyles();
  const { currentUserId, feedIds } = useContext(UserContext);
  const isAlreadySaved = savedPosts.some(
    ({ user_id }) => user_id === currentUserId
  );
  const [savePost] = useMutation(SAVE_POST);
  const [removePost] = useMutation(UNSAVE_POST);
  const variables = { postId, userId: currentUserId };
  const [saved, setSaved] = useState(isAlreadySaved);
  const Icon = saved ? RemoveIcon : SaveIcon;
  const handleSave = () => {
    setSaved(true);
    savePost({ variables });
  };
  const handleRemove = () => {
    setSaved(false);
    removePost({ variables });
  };
  const onClick = saved ? handleRemove : handleSave;

  return <Icon className={classes.saveIcon} onClick={onClick} />;
};
const Comment = ({ postId }) => {
  const { currentUserId, feedIds } = useContext(UserContext);
  const classes = useFeedPostStyles();
  const [content, setContent] = useState("");
  const [createComment] = useMutation(CREATE_COMMENT);
  function handleUpdate(cache, result) {
    const variables = {
      limit: 30,
      feedIds,
    };
    const data = cache.readQuery({
      query: GET_FEED,
      variables,
    });
    console.log(data, result);
    const oldComment = result.data.insert_comments.returning[0];
    const newComment = {
      ...oldComment,
      user: { ...oldComment.user },
    };
    const posts = data.posts.map((post) => {
      const newPost = {
        ...post,
        comments: [...post.comments, newComment],
        comments_aggregate: {
          ...post.comments_aggregate,
          aggregate: {
            ...post.comments_aggregate.aggregate,
            count: post.comments_aggregate.aggregate.count + 1,
          },
        },
      };
      return post.id === postId ? newPost : post;
    });
    cache.writeQuery({ query: GET_FEED, data: { posts } });
  }
  function handleAddComment() {
    const variables = {
      content,
      postId,
      userId: currentUserId,
    };
    createComment({ variables, update: handleUpdate });
    setContent("");
  }

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

export default FeedPost;
