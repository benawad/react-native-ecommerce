import React from 'react';
import { AsyncStorage } from 'react-native';
import { ApolloProvider } from 'react-apollo';
import { ApolloClient, InMemoryCache, ApolloLink } from 'apollo-client-preset';
import { createUploadLink } from 'apollo-upload-client';
import { setContext } from 'apollo-link-context';
import { withClientState } from 'apollo-link-state';
import gql from 'graphql-tag';

import Routes from './routes';
import { TOKEN_KEY } from './constants';

const authLink = setContext(async (_, { headers }) => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const getUserIdQuery = gql`
  {
    getUserId @client {
      userId
    }
  }
`;

const stateLink = withClientState({
  cache: new InMemoryCache(),
  resolvers: {
    Mutation: {
      addUserId: (_, { userId }, { cache }) => {
        cache.writeQuery({
          query: getUserIdQuery,
          data: { getUserId: { __typename: 'UserId', userId } },
        });
        return null;
      },
    },
  },
});

const client = new ApolloClient({
  link: ApolloLink.from([stateLink, authLink, createUploadLink({ uri: 'http://localhost:4000' })]),
  cache: new InMemoryCache(),
});

export default () => (
  <ApolloProvider client={client}>
    <Routes />
  </ApolloProvider>
);
