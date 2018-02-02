import React from 'react';
import { AsyncStorage, Text, Button, View } from 'react-native';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

import TextField from '../components/TextField';
import { TOKEN_KEY } from '../constants';

const defaultState = {
  values: {
    name: '',
    email: '',
    password: '',
  },
  errors: {},
  isSubmitting: false,
};

class Signup extends React.Component {
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
    let response;
    try {
      response = await this.props.mutate({
        variables: this.state.values,
      });
    } catch (err) {
      this.setState({
        errors: {
          email: 'Already taken',
        },
        isSubmitting: false,
      });
      return;
    }

    await AsyncStorage.setItem(TOKEN_KEY, response.data.signup.token);
    // this.setState(defaultState);
    this.props.history.push('/products');
  };

  goToLoginPage = () => {
    this.props.history.push('/login');
  };

  render() {
    const { errors, values: { name, email, password } } = this.state;

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
          <TextField value={name} name="name" onChangeText={this.onChangeText} />
          {errors.email && <Text style={{ color: 'red' }}>{errors.email}</Text>}
          <TextField value={email} name="email" onChangeText={this.onChangeText} />
          <TextField
            value={password}
            name="password"
            onChangeText={this.onChangeText}
            secureTextEntry
          />
          <Button title="Create account" onPress={this.submit} />
          <Text style={{ textAlign: 'center' }}>or</Text>
          <Button title="Login" onPress={this.goToLoginPage} />
        </View>
      </View>
    );
  }
}

const signUpMutation = gql`
  mutation($name: String!, $email: String!, $password: String!) {
    signup(name: $name, email: $email, password: $password) {
      token
    }
  }
`;

export default graphql(signUpMutation)(Signup);
