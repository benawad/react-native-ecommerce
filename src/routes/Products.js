import React from 'react';
import { Image, Text, View, Button, FlatList, StyleSheet } from 'react-native';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { connect } from 'react-redux';

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
  editSection: {
    display: 'flex',
    flexDirection: 'row',
  },
});

const Products = ({
  userId, data: { products }, loading, history,
}) => {
  if (loading || !products) {
    return null;
  }
  console.log(userId);
  console.log(products);
  return (
    <View>
      <Button title="Create Product" onPress={() => history.push('/new-product')} />
      <FlatList
        keyExtractor={item => item.id}
        data={products}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Image
              style={styles.images}
              source={{ uri: `http://localhost:4000/${item.pictureUrl}` }}
            />
            <View style={styles.right}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.price}>{`$${item.price}`}</Text>
              {userId === item.seller.id ? (
                <View style={styles.editSection}>
                  <Button title="Edit" onPress={() => 5} />
                  <Button title="Delete" onPress={() => 5} />
                </View>
              ) : null}
            </View>
          </View>
        )}
      />
    </View>
  );
};

export const productsQuery = gql`
  {
    products {
      id
      price
      pictureUrl
      name
      seller {
        id
      }
    }
  }
`;

export default connect(state => ({ userId: state.user.userId }))(graphql(productsQuery)(Products));
