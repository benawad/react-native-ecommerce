import React from 'react';
import { Image, Button, View } from 'react-native';
import { ImagePicker } from 'expo';

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

export default class Form extends React.Component {
  constructor(props) {
    super(props);
    const { initialValues = {} } = props;
    this.state = {
      ...defaultState,
      values: {
        ...defaultState.values,
        ...initialValues,
      },
    };
  }

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

    const errors = this.props.submit(this.state.values);
    if (errors) {
      this.setState({
        errors,
      });
    }
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
