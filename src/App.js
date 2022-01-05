import { useSubscription } from "@apollo/client";
import { Typography } from "@material-ui/core";
import React, { createContext, useContext, useRef } from "react";
import { useEffect } from "react";
import {
  Redirect,
  Route,
  Switch,
  useHistory,
  useLocation,
} from "react-router-dom";
import { AuthContext } from "./auth";
import PostModal from "./components/post/PostModal";
import LoadingScreen from "./components/shared/LoadingScreen";
import { ME } from "./graphql/subscriptions";
import EditProfilePage from "./pages/edit-profile";
import ExplorePage from "./pages/explore";
import FeedPage from "./pages/feed";
import LoginPage from "./pages/login";
import NotFoundPage from "./pages/not-found";
import PostPage from "./pages/post";
import ProfilePage from "./pages/profile";
import SignUpPage from "./pages/signup";
export const UserContext = createContext();
function App() {
  const { authState } = useContext(AuthContext);
  // console.log({ authState });

  const isAuth = authState.status === "in";
  const userId = isAuth ? authState.user.uid : null;
  const variables = { userId };
  const { data, loading } = useSubscription(ME, { variables });
  const history = useHistory();
  const location = useLocation();
  //   console.log(history, location);
  const prevLocation = useRef(location);
  const modal = location.state?.modal;

  useEffect(() => {
    if (history.action !== "POP" && !modal) {
      prevLocation.current = location;
    }
  }, [location, modal, history.action]);

  if (loading) return <LoadingScreen />;
  if (!isAuth) {
    return (
      <Switch>
        <Route path="/accounts/login" component={LoginPage} />
        <Route path="/accounts/emailsignup" component={SignUpPage} />
        <Redirect to="/accounts/login" />
      </Switch>
    );
  }
  const isModalOpen = modal && prevLocation.current !== location;
  const me = isAuth && data ? data.users[0] : null;
  const currentUserId = me?.id;
  const followingIds = me?.following.map(({ user }) => user.id);
  const followersIds = me?.followers.map(({ user }) => user.id);
  const feedIds = [...followingIds, currentUserId];

  return (
    <UserContext.Provider
      value={{ me, currentUserId, followersIds, followingIds, feedIds }}
    >
      <Switch location={isModalOpen ? prevLocation.current : location}>
        <Route exact path="/" component={FeedPage} />
        <Route path="/explore" component={ExplorePage} />
        <Route exact path="/:username" component={ProfilePage} />
        <Route exact path="/p/:postId" component={PostPage} />
        <Route path="/accounts/edit" component={EditProfilePage} />

        <Route path="*" component={NotFoundPage} />
      </Switch>
      {isModalOpen && <Route exact path="/p/:postId" component={PostModal} />}
    </UserContext.Provider>
  );
}

export default App;
