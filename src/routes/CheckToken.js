import React from 'react';
import { AsyncStorage, Text } from 'react-native';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { TOKEN_KEY } from '../constants';
import { addUser } from '../reducers/user';

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
    this.props.addUserAction({ userId });
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

export default connect(null, dispatch => bindActionCreators({ addUserAction: addUser }, dispatch))(graphql(refreshTokenMutation)(CheckToken));
