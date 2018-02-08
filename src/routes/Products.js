import React from 'react';
import { Image, Text, View, Button, FlatList, StyleSheet } from 'react-native';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

const styles = StyleSheet.create({
  images: {
    height: 100,
    width: 100,
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    margin: 10,
  },
  right: {
    marginLeft: 10,
    marginRight: 30,
    flex: 1,
    display: 'flex',
    alignItems: 'flex-end',
  },
  name: {
    fontSize: 40,
  },
  price: {
    fontSize: 30,
  },
});

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
      <Button title="Create Product" onPress={() => history.push('/new-product')} />
      <FlatList
        data={productsWithKey}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Image
              style={styles.images}
              source={{ uri: `http://localhost:4000/${item.pictureUrl}` }}
            />
            <View style={styles.right}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.price}>{`$${item.price}`}</Text>
            </View>
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
