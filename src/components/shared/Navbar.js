import {
  AppBar,
  Avatar,
  Fade,
  Grid,
  Hidden,
  InputBase,
  Typography,
  Zoom,
} from "@material-ui/core";
import React, { useContext, useEffect, useRef, useState } from "react";
import { RedTooltip, useNavbarStyles, WhiteTooltip } from "../../styles";
import { Link, useHistory } from "react-router-dom";
import logo from "../../images/logo.png";
import { useNProgress } from "@tanem/react-nprogress";
import {
  AddIcon,
  ExploreActiveIcon,
  ExploreIcon,
  HomeActiveIcon,
  HomeIcon,
  LikeActiveIcon,
  LikeIcon,
  LoadingIcon,
} from "../../icons";

import NotificationTooltip from "../notification/NotificationTooltip";
import NotificationList from "../notification/NotificationList";
import { useLazyQuery } from "@apollo/client";
import { SEARCH_USERS } from "../../graphql/querires";
import { UserContext } from "../../App";
import AddPostDialog from "../post/AddPostDialog";
import { isAfter } from "date-fns";
function Navbar({ minimalNavbar }) {
  const classes = useNavbarStyles();
  const history = useHistory();
  const path = history.location.pathname;
  const [isloadingPage, setLoadingPage] = useState(true);

  useEffect(() => {
    setLoadingPage(false);
  }, [path]);

  return (
    <>
      <Progress isAnimating={isloadingPage} />
      <AppBar className={classes.appBar}>
        <section className={classes.section}>
          <Logo />
          {!minimalNavbar && (
            <>
              <Search history={history} />
              <Links path={path} />
            </>
          )}
        </section>
      </AppBar>
    </>
  );
}
const Logo = () => {
  const classes = useNavbarStyles();
  return (
    <div className={classes.logoContainer}>
      <Link to="/">
        <div className={classes.logoWrapper}>
          <img src={logo} alt="instagram" className={classes.logo} />
        </div>
      </Link>
    </div>
  );
};
const Search = ({ history }) => {
  const classes = useNavbarStyles();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [query, setQuery] = useState("");
  const [searchUsers, { data }] = useLazyQuery(SEARCH_USERS);
  const hasResults = Boolean(query) && results.length > 0;
  const handleClear = () => {
    setQuery("");
  };

  useEffect(() => {
    if (!query.trim()) return;

    setLoading(true);
    const variables = { input: `%${query}%` };
    searchUsers({ variables });
    console.log(data);
    if (data) {
      setResults(data.users);
      setLoading(false);
    }
  }, [query, data, searchUsers]);
  return (
    <Hidden xsDown>
      <WhiteTooltip
        arrow
        interactive
        TransitionComponent={Fade}
        open={hasResults}
        title={
          hasResults && (
            <Grid className={classes.resultContainer} container>
              {results.map((result) => (
                <Grid
                  key={result.id}
                  item
                  className={classes.resultLink}
                  onClick={() => {
                    history.push(`/${result.username}`);
                    handleClear();
                  }}
                >
                  <div className={classes.resultWrapper}>
                    <div className={classes.avatarWrapper}>
                      <Avatar src={result.profile_image} alt="user avatar" />
                    </div>
                    <div className={classes.nameWrapper}>
                      <Typography variant="body1">{result.username}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {result.name}
                      </Typography>
                    </div>
                  </div>
                </Grid>
              ))}
            </Grid>
          )
        }
      >
        <InputBase
          className={classes.input}
          onChange={(e) => setQuery(e.target.value)}
          startAdornment={<span className={classes.searchIcon} />}
          endAdornment={
            loading ? (
              <LoadingIcon />
            ) : (
              <span onClick={handleClear} className={classes.clearIcon} />
            )
          }
          placeholder="search"
          value={query}
        />
      </WhiteTooltip>
    </Hidden>
  );
};
const Links = ({ path }) => {
  const { me, currentUserId } = useContext(UserContext);
  const newNotifications = me?.notifications.filter(({ created_at }) =>
    isAfter(new Date(created_at), new Date(me.last_checked))
  );

  const hasNotification = newNotifications?.length > 0;
  const classes = useNavbarStyles();
  const [showList, setShowList] = useState(false);
  const [showtToolTip, setTooltip] = useState(hasNotification);
  useEffect(() => {
    const timeOut = setTimeout(() => handleToolTip, 5000);

    return () => clearTimeout(timeOut);
  }, []);
  const handleList = () => setShowList(false);
  const handleToolTip = () => setTooltip(false);
  const [media, setMedia] = useState(null);
  const [addPostDialog, setAddPostDialog] = useState(false);
  const inputRef = useRef();
  function openFileInput() {
    inputRef.current.click();
  }
  function handleAddPost(event) {
    setMedia(event.target.files[0]);
    setAddPostDialog(true);
  }
  function handleClose() {
    setAddPostDialog(false);
  }
  return (
    <div className={classes.linksContainer}>
      {showList && (
        <NotificationList
          notifications={me.notifications}
          handleHideList={handleList}
          currentUserId={currentUserId}
        />
      )}
      <div className={classes.linksWrapper}>
        {addPostDialog && (
          <AddPostDialog media={media} handleClose={handleClose} />
        )}
        <Hidden xsDown>
          <input
            type="file"
            ref={inputRef}
            style={{ display: "none" }}
            onChange={handleAddPost}
          />
          <AddIcon onClick={openFileInput} />
        </Hidden>
        <Link to="/">{path === "/" ? <HomeActiveIcon /> : <HomeIcon />}</Link>
        <Link to="/explore">
          {path === "/explore" ? <ExploreActiveIcon /> : <ExploreIcon />}
        </Link>
        <RedTooltip
          arrow
          open={showtToolTip}
          onOpen={handleToolTip}
          TransitionComponent={Zoom}
          title={<NotificationTooltip notifications={newNotifications} />}
        >
          <div
            className={hasNotification ? classes.notifications : ""}
            onClick={() => setShowList((prev) => !prev)}
          >
            {showList ? <LikeActiveIcon /> : <LikeIcon />}
          </div>
        </RedTooltip>
        <Link to={`/${me?.username}`}>
          <div
            className={path === `/${me?.username}` ? classes.profileActive : ""}
          ></div>
          <Avatar src={me?.profile_image} className={classes.profileImage} />
        </Link>
      </div>
    </div>
  );
};
const Progress = ({ isAnimating }) => {
  const classes = useNavbarStyles();
  const { animationDuration, isFinished, progress } = useNProgress({
    isAnimating,
  });
  return (
    <div
      className={classes.progressContainer}
      style={{
        opacity: isFinished ? 0 : 1,
        transition: `opacity ${animationDuration}ms linear`,
      }}
    >
      <div
        className={classes.progressBar}
        style={{
          marginLeft: `${(-1 + progress) * 100}%`,
          transition: `margin-left ${animationDuration}ms linear`,
        }}
      >
        <div className={classes.progressBackground} />
      </div>
    </div>
  );
};
export default Navbar;
