import { ApolloClient, InMemoryCache } from "@apollo/client";
import { WebSocketLink } from "@apollo/client/link/ws";

const headers = {
  "x-hasura-admin-secret": "insta-r12",
};

const client = new ApolloClient({
  llink: new WebSocketLink({
    uri: "wss://insta-r12.herokuapp.com/v1/graphql",
    options: {
      reconnect: true,
      connectionParams: {
        headers,
      },
    },
  }),
  cache: new InMemoryCache(),
});

export default client;
