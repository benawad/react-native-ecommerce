import React from 'react';
import { AsyncStorage, Text, Button, View } from 'react-native';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

import TextField from '../components/TextField';
import { TOKEN_KEY } from '../constants';

const defaultState = {
  values: {
    email: '',
    password: '',
  },
  errors: {},
  isSubmitting: false,
};

class Login extends React.Component {
  state = defaultState;

  onChangeText = (key, value) => {
    this.setState(state => ({
      values: {
        ...state.values,
        [key]: value,
      },
    }));
  };

  submit = async () => {
    if (this.state.isSubmitting) {
      return;
    }

    this.setState({ isSubmitting: true });
    const response = await this.props.mutate({
      variables: this.state.values,
    });

    const { payload, error } = response.data.login;

    if (payload) {
      await AsyncStorage.setItem(TOKEN_KEY, payload.token);
      // this.setState(defaultState);
      this.props.history.push('/products');
    } else {
      this.setState({
        errors: {
          [error.field]: error.msg,
        },
        isSubmitting: false,
      });
    }
  };

  goToSignup = () => {
    this.props.history.push('/signup');
  };

  render() {
    const { errors, values: { email, password } } = this.state;

    return (
      <View
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View style={{ width: 200 }}>
          {errors.email && <Text style={{ color: 'red' }}>{errors.email}</Text>}
          <TextField value={email} name="email" onChangeText={this.onChangeText} />
          {errors.password && <Text style={{ color: 'red' }}>{errors.password}</Text>}
          <TextField
            value={password}
            name="password"
            onChangeText={this.onChangeText}
            secureTextEntry
          />
          <Button title="Login" onPress={this.submit} />
          <Text style={{ textAlign: 'center' }}>or</Text>
          <Button title="Create account" onPress={this.goToSignup} />
        </View>
      </View>
    );
  }
}

const loginMutation = gql`
  mutation($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      payload {
        token
      }
      error {
        field
        msg
      }
    }
  }
`;

export default graphql(loginMutation)(Login);
