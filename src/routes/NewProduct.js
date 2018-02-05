import React from 'react';
import { Image, Button, View } from 'react-native';
import { ImagePicker } from 'expo';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { ReactNativeFile } from 'apollo-upload-client';

import TextField from '../components/TextField';

const defaultState = {
  values: {
    name: '',
    price: '',
    pictureUrl: '',
  },
  errors: {},
  isSubmitting: false,
};

class NewProduct extends React.Component {
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
    const { pictureUrl, name, price } = this.state.values;
    const picture = new ReactNativeFile({
      uri: pictureUrl,
      type: 'image/png',
      name: 'i-am-a-name',
    });
    let response;
    try {
      response = await this.props.mutate({
        variables: {
          name,
          price,
          picture,
        },
      });
    } catch (err) {
      console.log('err happened');
      console.log(err);
      // this.setState({
      //   errors: {
      //     email: 'Already taken',
      //   },
      //   isSubmitting: false,
      // });
      // return;
    }
    console.log(response);

    // await AsyncStorage.setItem(TOKEN_KEY, response.data.signup.token);
    // this.setState(defaultState);
    // this.props.history.push('/products');
    this.setState({ isSubmitting: false });
  };

  pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.cancelled) {
      this.onChangeText('pictureUrl', result.uri);
    }
  };

  render() {
    const { values: { name, pictureUrl, price } } = this.state;

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
          <TextField value={price} name="price" onChangeText={this.onChangeText} />
          <Button title="Pick an image from camera roll" onPress={this.pickImage} />
          {pictureUrl ? (
            <Image source={{ uri: pictureUrl }} style={{ width: 200, height: 200 }} />
          ) : null}
          <Button title="Add Product" onPress={this.submit} />
        </View>
      </View>
    );
  }
}

const createProductMutation = gql`
  mutation($name: String!, $price: Float!, $picture: Upload!) {
    createProduct(name: $name, price: $price, picture: $picture) {
      id
    }
  }
`;

export default graphql(createProductMutation)(NewProduct);
