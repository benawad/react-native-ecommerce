import React from 'react';
import { Image, Text, View, Button, FlatList } from 'react-native';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

const Products = ({ data: { products }, loading, history }) => {
  if (loading || !products) {
    return null;
  }

  const productsWithKey = products.map(p => ({
    ...p,
    key: p.id,
  }));

  console.log(productsWithKey[0]);

  return (
    <View>
      <Text style={{ marginTop: 50 }}>this is the products page</Text>
      <Button title="Create Product" onPress={() => history.push('/new-product')} />
      <FlatList
        data={productsWithKey}
        renderItem={({ item }) => (
          <View>
            <Text>{item.name}</Text>
            <Text>{item.price}</Text>
            <Image source={{ uri: item.pictureUrl }} />
          </View>
        )}
      />
    </View>
  );
};

const productsQuery = gql`
  {
    products {
      id
      price
      pictureUrl
      name
    }
  }
`;

export default graphql(productsQuery)(Products);
