import React from 'react';
import { AsyncStorage } from 'react-native';
import { ApolloProvider } from 'react-apollo';
import { ApolloClient, InMemoryCache, ApolloLink } from 'apollo-client-preset';
import { createUploadLink } from 'apollo-upload-client';
import { setContext } from 'apollo-link-context';
import { withClientState } from 'apollo-link-state';

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

const inMemoryCache = new InMemoryCache();

const stateLink = withClientState({
  cache: inMemoryCache,
  resolvers: {
    Mutation: {
      addUserId: (_, { userId }, { cache }) => {
        const data = {
          getUserId: userId,
        };
        cache.writeData({
          data,
          __typename:'getUserId' // Typename is required for cache key
         });
        return null;
      },
    },
  },
});

const client = new ApolloClient({
  link: ApolloLink.from([stateLink, authLink, createUploadLink({ uri: 'http://localhost:4000' })]),
  cache: inMemoryCache,
});

export default () => (
  <ApolloProvider client={client}>
    <Routes />
  </ApolloProvider>
);
