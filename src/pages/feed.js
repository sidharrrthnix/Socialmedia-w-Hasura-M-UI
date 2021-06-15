import { Hidden } from "@material-ui/core";
import React, { useState } from "react";
import FeedPostSkeleton from "../components/feed/FeedPostSkeleton";
import FeedSideSuggestions from "../components/feed/FeedSideSuggestions";
import Layout from "../components/shared/Layout";
import LoadingScreen from "../components/shared/LoadingScreen";
import UserCard from "../components/shared/UserCard";
import { getDefaultPost } from "../data";
import { LoadingLargeIcon } from "../icons";
import { useFeedPageStyles } from "../styles";
// import FeedPost from "../components/feed/FeedPost";
const FeedPost = React.lazy(() => import("../components/feed/FeedPost"));

function FeedPage() {
  let loading = false;
  const classes = useFeedPageStyles();
  const [isEndOfFeed] = useState(false);
  if (loading) return <LoadingScreen />;
  return (
    <Layout>
      <div className={classes.container}>
        <div>
          {Array.from({ length: 10 }, () => getDefaultPost()).map(
            (post, index) => (
              <React.Suspense key={post.id} fallback={<FeedPostSkeleton />}>
                <FeedPost post={post} index={index} />
              </React.Suspense>
            )
          )}
        </div>
        <Hidden smDown>
          <div className={classes.sidebarContainer}>
            <div className={classes.sidebarWrapper}>
              <UserCard avatarSize={50} />
              <FeedSideSuggestions />
            </div>
          </div>
        </Hidden>
        {!isEndOfFeed && <LoadingLargeIcon />}
      </div>
    </Layout>
  );
}

export default FeedPage;
