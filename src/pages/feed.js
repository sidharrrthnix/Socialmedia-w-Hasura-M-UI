import { useQuery } from "@apollo/client";
import { Hidden } from "@material-ui/core";
import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import FeedPostSkeleton from "../components/feed/FeedPostSkeleton";
import FeedSideSuggestions from "../components/feed/FeedSideSuggestions";
import Layout from "../components/shared/Layout";
import LoadingScreen from "../components/shared/LoadingScreen";
import UserCard from "../components/shared/UserCard";
import { getDefaultPost } from "../data";
import { GET_FEED } from "../graphql/querires";
import { LoadingLargeIcon } from "../icons";
import { useFeedPageStyles } from "../styles";
// import FeedPost from "../components/feed/FeedPost";
const FeedPost = React.lazy(() => import("../components/feed/FeedPost"));

function FeedPage() {
  const { me, feedIds } = useContext(UserContext);

  const classes = useFeedPageStyles();
  const [isEndOfFeed, setEndOfFeed] = useState(false);
  const variables = { limit: 30, feedIds };
  const { data, loading } = useQuery(GET_FEED, { variables });
  useEffect(() => {
    if (data) {
      setEndOfFeed(true);
    }
  }, [data]);

  if (loading) return <LoadingScreen />;
  return (
    <Layout>
      <div className={classes.container}>
        <div>
          {data?.posts.map((post, index) => (
            <React.Suspense key={post.id} fallback={<FeedPostSkeleton />}>
              <FeedPost post={post} index={index} />
            </React.Suspense>
          ))}
        </div>
        <Hidden smDown>
          <div className={classes.sidebarContainer}>
            <div className={classes.sidebarWrapper}>
              <UserCard user={me} avatarSize={50} />
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
