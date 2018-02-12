import React from 'react';
import { AsyncStorage, Text } from 'react-native';
import { graphql, compose } from 'react-apollo';
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
      response = await this.props.mutate();
    } catch (err) {
      this.props.history.push('/signup');
      return;
    }

    const { refreshToken: { token: newToken, userId } } = response.data;
    await AsyncStorage.setItem(TOKEN_KEY, newToken);
    await this.props.addUserId({ variables: { getUserId: userId } });
    this.props.history.push('/products');
  };

  render() {
    return <Text>loading...</Text>;
  }
}

const refreshTokenMutation = gql`
  mutation {
    refreshToken {
      token
      userId
    }
  }
`;

const addUserIdMutation = gql`
  mutation($userId: String!) {
    addUserId(userId: $userId) @client
  }
`;

export default compose(
  graphql(refreshTokenMutation),
  graphql(addUserIdMutation, { name: 'addUserId' }),
)(CheckToken);
