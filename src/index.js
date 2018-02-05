import React from 'react';
import { ApolloProvider } from 'react-apollo';
import { ApolloClient, InMemoryCache } from 'apollo-client-preset';
import { createUploadLink } from 'apollo-upload-client';

import Routes from './routes';

const client = new ApolloClient({
  link: createUploadLink({ uri: 'http://localhost:4000' }),
  cache: new InMemoryCache(),
});

export default () => (
  <ApolloProvider client={client}>
    <Routes />
  </ApolloProvider>
);
