import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  field: {
    borderBottomWidth: 1,
    fontSize: 20,
    marginBottom: 15,
    height: 35,
  },
});

export default class TextField extends React.PureComponent {
  onChangeText = (text) => {
    const { onChangeText, name } = this.props;
    onChangeText(name, text);
  };

  render() {
    const { value, secureTextEntry, name } = this.props;

    return (
      <TextInput
        onChangeText={this.onChangeText}
        value={value}
        style={styles.field}
        placeholder={name}
        autoCapitalize="none"
        secureTextEntry={!!secureTextEntry}
      />
    );
  }
}
