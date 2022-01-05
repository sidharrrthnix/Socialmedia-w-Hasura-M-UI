import { ApolloClient, InMemoryCache } from "@apollo/client";
import { WebSocketLink } from "@apollo/client/link/ws";

const client = new ApolloClient({
  link: new WebSocketLink({
    uri: "wss://instar-12.herokuapp.com/v1/graphql",
    options: {
      reconnect: true,
      connectionParams: () => {
        return {
          headers: {
            "x-hasura-admin-secret": "react12",
          },
        };
      },
    },
  }),
  cache: new InMemoryCache(),
});

export default client;
