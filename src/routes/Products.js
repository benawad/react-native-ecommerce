import React from 'react';
import { Text, View, Button } from 'react-native';

export default ({ history }) => (
  <View>
    <Text style={{ marginTop: 50 }}>this is the products page</Text>
    <Button title="Create Product" onPress={() => history.push('/new-product')} />
  </View>
);
