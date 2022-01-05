import { useMutation, useQuery } from "@apollo/client";
import {
  Button,
  Drawer,
  Hidden,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Slide,
  Snackbar,
  TextField,
  Typography,
} from "@material-ui/core";
import { Menu } from "@material-ui/icons";
import React, { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { UserContext } from "../App";
import Layout from "../components/shared/Layout";
import LoadingScreen from "../components/shared/LoadingScreen";
import ProfilePicture from "../components/shared/ProfilePicture";
import { defaultCurrentUser } from "../data";
import { GET_EDIT_USER_PROFILE } from "../graphql/querires";
import { useEditProfilePageStyles } from "../styles";
import isURL from "validator/lib/isURL";
import isEmail from "validator/lib/isEmail";
import isMobilePhone from "validator/lib/isMobilePhone";
import { EDIT_USER, EDIT_USER_AVATAR } from "../graphql/mutations";
import { AuthContext } from "../auth";
import { CloseIcon } from "../icons";
import handleImageUpload from "../utils/handleImageUpload";

function EditProfilePage({ history }) {
  const { me, currentUserId } = useContext(UserContext);
  // console.log("I", me, currentUserId);
  const variables = { id: currentUserId };
  const { data, loading } = useQuery(GET_EDIT_USER_PROFILE, { variables });
  // console.log("edit", data);
  const classes = useEditProfilePageStyles();
  const [showDrawer, setDrawer] = useState(false);
  const path = history.location.pathname;
  const handleToggleDrawer = () => {
    setDrawer((prev) => !prev);
  };
  const handleSelected = (index) => {
    switch (index) {
      case 0:
        return path.includes("edit");
      default:
        break;
    }
  };
  const handleListClick = (index) => {
    switch (index) {
      case 0:
        history.push("/accounts/edit");
      default:
        break;
    }
  };
  if (loading) return <LoadingScreen />;
  const options = [
    "Edit Profile",
    "Change Password",
    "Apps and Website",
    "Email and SMS",
    "Push Notifications",
    "Manage Contacts",
    "Privacy and Security",
    "Login Activity",
    "Emails from Instagram",
  ];
  const drawer = (
    <List>
      {options.map((option, index) => (
        <ListItem
          key={option}
          button
          selected={handleSelected(index)}
          onClick={() => handleListClick(index)}
          classes={{
            selected: classes.listItemSelected,
            button: classes.listItemButton,
          }}
        >
          <ListItemText primary={option} />
        </ListItem>
      ))}
    </List>
  );
  return (
    <Layout title="Edit Profile">
      <section className={classes.section}>
        <IconButton
          edge="start"
          onClick={handleToggleDrawer}
          className={classes.menuButton}
        >
          <Menu />
        </IconButton>
        <nav>
          <Hidden smUp implementation="css">
            <Drawer
              variant="temporary"
              anchor="left"
              open={showDrawer}
              onClose={handleToggleDrawer}
              classes={{ paperAnchorLeft: classes.temporaryDrawer }}
            >
              {drawer}
            </Drawer>
          </Hidden>
          <Hidden
            xsDown
            implementation="css"
            className={classes.permanentDrawerRoot}
          >
            <Drawer
              variant="permanent"
              open
              classes={{
                paper: classes.permanentDrawerPaper,
                root: classes.permanentDrawerRoot,
              }}
            >
              {drawer}
            </Drawer>
          </Hidden>
        </nav>
        <main>
          {path.includes("edit") && <EditUserInfo user={data.users_by_pk} />}
        </main>
      </section>
    </Layout>
  );
}
const EditUserInfo = ({ user }) => {
  const { register, handleSubmit } = useForm();
  const classes = useEditProfilePageStyles();
  const clases = useEditProfilePageStyles();
  const [editUser] = useMutation(EDIT_USER);
  const { updateEmail } = useContext(AuthContext);
  const [error, setError] = useState({ type: "", message: "" });
  const [open, setOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(user.profile_image);
  const [editUserAvatar] = useMutation(EDIT_USER_AVATAR);
  async function onSubmit(data) {
    try {
      setError({ type: "", message: "" });
      setOpen(true);
      const variables = { ...data, id: user.id };
      await updateEmail(data.email);
      await editUser({ variables });
    } catch (e) {
      console.error("error updating profile", e);
      handleError(e);
    }
    console.log("formData", { data });
  }
  const handleError = (error) => {
    if (error.message.includes("users_username_key")) {
      setError({ type: "username", message: "Username already taken" });
    } else if (error?.code?.includes("auth")) {
      setError({ type: "auth", message: error.message });
    }
  };
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };
  async function handleUpdateProfilePic(event) {
    const url = await handleImageUpload(event.target.files[0], "avatar");
    const variables = { id: user.id, profileImage: url };
    await editUserAvatar({ variables });
    setProfileImage(url);
  }
  return (
    <section className={classes.container}>
      <div className={classes.pictureSectionItem}>
        <ProfilePicture size={38} image={profileImage} />
        <div className={classes.justifySelfStart}>
          <Typography className={classes.typography}>
            {user.username}
          </Typography>
          <input
            accept="image/*"
            id="image"
            type="file"
            style={{ display: "none" }}
            onChange={handleUpdateProfilePic}
          />
          <label htmlFor="image">
            <Typography
              color="primary"
              variant="body2"
              className={classes.typographyChangePic}
            >
              Change Profile Photo
            </Typography>
          </label>
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className={classes.form}>
        <SectionItem text="Name" formItem={user.name}>
          <TextField
            name="name"
            {...register("name", {
              required: true,
              minLength: 5,
              maxLength: 20,
            })}
            variant="outlined"
            fullWidth
            defaultValue={user.name}
            type="text"
            className={clases.textField}
            inputProps={{
              className: clases.textFieldInput,
            }}
          />
        </SectionItem>
        <SectionItem text="Username" formItem={user.username}>
          <TextField
            name="username"
            {...register("username", {
              required: true,
              pattern: /^[a-zA-Z0-9_.]*$/,
              minLength: 5,
              maxLength: 20,
            })}
            helperText={error?.type === "username" && error.message}
            variant="outlined"
            fullWidth
            defaultValue={user.username}
            type="text"
            className={clases.textField}
            inputProps={{
              className: clases.textFieldInput,
            }}
          />
        </SectionItem>
        <SectionItem text="Website" formItem={user.website}>
          <TextField
            name="website"
            {...register("website", {
              validate: (input) =>
                Boolean(input)
                  ? isURL(input, {
                      protocols: ["http", "https"],
                      require_protocol: true,
                    })
                  : true,
            })}
            variant="outlined"
            fullWidth
            defaultValue={user.website || ""}
            type="text"
            className={clases.textField}
            inputProps={{
              className: clases.textFieldInput,
            }}
          />
        </SectionItem>

        {/* <SectionItem text="Username" formItem={user.username} />
        <SectionItem text="Website" formItem={user.website} /> */}
        <div className={classes.sectionItem}>
          <aside>
            <Typography className={classes.bio}>Bio</Typography>
          </aside>
          <TextField
            name="bio"
            {...register("bio", {
              maxLength: 120,
            })}
            variant="outlined"
            multiline
            rowsMax={3}
            rows={3}
            fullWidth
            defaultValue={user.bio || ""}
          />
        </div>
        <div className={classes.sectionItem}>
          <div />
          <Typography
            color="textSecondary"
            className={classes.justifySelfStart}
          >
            Personal Information
          </Typography>
        </div>
        <SectionItem text="Email" formItem={user.email}>
          <TextField
            name="email"
            {...register("email", {
              required: true,
              validate: (input) => isEmail(input),
            })}
            variant="outlined"
            helperText={error?.message}
            fullWidth
            defaultValue={user.email || ""}
            type="email"
            className={clases.textField}
            inputProps={{
              className: clases.textFieldInput,
            }}
          />
        </SectionItem>
        <SectionItem text="Phone Number" formItem={user.phone_number}>
          <TextField
            name="phoneNumber"
            {...register("phoneNumber", {
              required: false,
              validate: (input) =>
                Boolean(input) ? isMobilePhone(input) : true,
            })}
            variant="outlined"
            fullWidth
            defaultValue={user.phone_number || ""}
            type="text"
            className={clases.textField}
            inputProps={{
              className: clases.textFieldInput,
            }}
          />
        </SectionItem>

        {/* <SectionItem text="Email" formItem={user.email} type="email" />
        <SectionItem text="Phone Number" formItem={user.phone_number} /> */}
        <div className={classes.sectionItem}>
          <div />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            className={classes.justifySelfStart}
          >
            Submit
          </Button>
        </div>
      </form>
      <Snackbar
        open={open}
        autoHideDuration={6000}
        TransitionComponent={Slide}
        message={<span>Profile Updated!</span>}
        onClose={(event, reason) => {
          if (reason === "clickaway") {
            return;
          }
          setOpen(false);
        }}
        action={
          <React.Fragment>
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleClose}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </React.Fragment>
        }
      />
    </section>
  );
};

const SectionItem = ({ type = "text", text, formItem, children, error }) => {
  const clases = useEditProfilePageStyles();
  return (
    <div className={clases.sectionItemWrapper}>
      <aside>
        <Hidden xsDown>
          <Typography className={clases.typography} align="right">
            {text}
          </Typography>
        </Hidden>
        <Hidden smUp>
          <Typography className={clases.typography}>{text}</Typography>
        </Hidden>
      </aside>
      {children}
    </div>
  );
};
export default EditProfilePage;
