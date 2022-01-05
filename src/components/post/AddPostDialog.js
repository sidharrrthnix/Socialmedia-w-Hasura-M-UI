// Import React dependencies.
import { useMutation } from "@apollo/client";
import {
  AppBar,
  Avatar,
  Button,
  Dialog,
  Divider,
  InputAdornment,
  makeStyles,
  Paper,
  TextField,
  Toolbar,
  Typography,
} from "@material-ui/core";
import { ArrowBackIos, PinDrop } from "@material-ui/icons";
import React, { useContext, useEffect, useMemo, useState } from "react";
// Import the Slate editor factory.
import { createEditor } from "slate";

// Import the Slate components and React plugin.
import { Slate, Editable, withReact } from "slate-react";
import { UserContext } from "../../App";
import { CREATE_POST } from "../../graphql/mutations";
import handleImageUpload from "../../utils/handleImageUpload";
import serialize from "../../utils/serialize";

const initial_values = [
  {
    type: "paragraph",
    children: [{ text: "" }],
  },
];

const AddPostDialog = ({ media, handleClose }) => {
  const editor = useMemo(() => withReact(createEditor()), []);
  console.log(media);
  const { me, currentUserId } = useContext(UserContext);
  const [value, setValue] = useState(initial_values);
  const [location, setLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const classes = useAddPostDialogStyles();
  const [createPost] = useMutation(CREATE_POST);
  const handleSharePost = async () => {
    setSubmitting(true);
    const url = await handleImageUpload(media);
    const variables = {
      userId: currentUserId,
      location,
      media: url,
      caption: serialize({ children: value }),
    };
    await createPost({ variables });
    setSubmitting(false);
    window.location.reload();
  };
  return (
    <Dialog fullScreen open onClose={handleClose}>
      <AppBar className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <ArrowBackIos onClick={handleClose} />
          <Typography align="center" variant="body1" className={classes.title}>
            New Post
          </Typography>
          <Button
            color="primary"
            className={classes.share}
            disabled={submitting}
            onClick={handleSharePost}
          >
            Share
          </Button>
        </Toolbar>
      </AppBar>

      <Divider />
      <Paper className={classes.paper}>
        <Avatar src={me.profile_image} />
        <Slate
          editor={editor}
          value={value}
          onChange={(value) => setValue(value)}
        >
          <Editable
            className={classes.editor}
            placeholder="write your caption"
          />
        </Slate>
        <Avatar
          src={URL.createObjectURL(media)}
          className={classes.avatarLarge}
          variant="square"
        />
      </Paper>
      <TextField
        fullWidth
        placeholder="Location"
        InputProps={{
          classes: {
            root: classes.root,
            input: classes.input,
            underline: classes.underline,
          },
          startAdornment: (
            <InputAdornment>
              <PinDrop />
            </InputAdornment>
          ),
        }}
        onChange={(e) => setLocation(e.target.value)}
      />
    </Dialog>
  );
};

const useAddPostDialogStyles = makeStyles((theme) => ({
  appBar: {
    position: "relative",
    display: "flex",
    justifyContent: "space-between",
    color: "black !important",
    background: "#fff !important",
    height: "54px !important",
  },
  toolbar: {
    minHeight: "54px !important",
  },
  title: {
    flex: 1,
    fontWeight: 600,
  },
  paper: {
    display: "flex",
    alignItems: "flex-start",
    "& > *": {
      margin: theme.spacing(1),
    },
  },
  editor: {
    flex: 1,
  },
  avatarLarge: {
    width: theme.spacing(7),
    height: theme.spacing(7),
  },
  input: {
    padding: "10px !important",
    fontSize: "14px !important",
  },
  root: {
    border: "1px solid #e6e6e6",
    marginTop: "10px !important",
  },
  underline: {
    "&::before": {
      border: "none !important",
    },
    "&::after": {
      border: "none !important",
    },
    "&:hover&:before": {
      border: "none !important",
    },
  },
}));
export default AddPostDialog;
