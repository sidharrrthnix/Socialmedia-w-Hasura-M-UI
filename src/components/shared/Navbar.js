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
import React, { useEffect, useState } from "react";
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
import { defaultCurrentUser, getDefaultUser } from "../../data";
import NotificationTooltip from "../notification/NotificationTooltip";
import NotificationList from "../notification/NotificationList";
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
  const hasResults = Boolean(query) && results.length > 0;
  const handleClear = () => {
    setQuery("");
  };

  useEffect(() => {
    if (!query.trim()) return setLoading(false);
    setResults(Array.from({ length: 5 }, () => getDefaultUser()));
    setLoading(true);
    const timeOut = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timeOut);
  }, [query]);
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
  const classes = useNavbarStyles();
  const [showList, setShowList] = useState(false);
  const [showtToolTip, setTooltip] = useState(true);
  useEffect(() => {
    const timeOut = setTimeout(() => handleToolTip, 5000);

    return () => clearTimeout(timeOut);
  }, []);
  const handleList = () => setShowList(false);
  const handleToolTip = () => setTooltip(false);
  return (
    <div className={classes.linksContainer}>
      {showList && <NotificationList handleHideList={handleList} />}
      <div className={classes.linksWrapper}>
        <Hidden xsDown>
          <AddIcon />
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
          title={<NotificationTooltip />}
        >
          <div
            className={classes.notifications}
            onClick={() => setShowList((prev) => !prev)}
          >
            {showList ? <LikeActiveIcon /> : <LikeIcon />}
          </div>
        </RedTooltip>
        <Link to={`/${defaultCurrentUser.username}`}>
          <div
            className={
              path === `/${defaultCurrentUser.username}`
                ? classes.profileActive
                : ""
            }
          ></div>
          <Avatar
            src={defaultCurrentUser.profile_image}
            className={classes.profileImage}
          />
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
