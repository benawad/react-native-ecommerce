import React from 'react';
import { AsyncStorage, Text } from 'react-native';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { TOKEN_KEY } from '../constants';

class CheckToken extends React.Component {
  componentDidMount = async () => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (!token) {
      this.props.history.push('/signup');
      return;
    }

    let response;
    try {
      response = await this.props.mutate({
        variables: {
          token,
        },
      });
    } catch (err) {
      this.props.history.push('/signup');
      return;
    }

    const { refreshToken } = response.data;
    await AsyncStorage.setItem(TOKEN_KEY, refreshToken);
    this.props.history.push('/products');
  };

  render() {
    return <Text>loading...</Text>;
  }
}

const refreshTokenMutation = gql`
  mutation($token: String!) {
    refreshToken(token: $token)
  }
`;

export default graphql(refreshTokenMutation)(CheckToken);
