import React from 'react';
import { Image, Text, View, Button, FlatList, StyleSheet, AsyncStorage } from 'react-native';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';
import jwtDecode from 'jwt-decode';

import { TOKEN_KEY } from '../constants';
import TextField from '../components/TextField';

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
  sortRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortButton: {
    flex: 1,
  },
  searchBar: {
    margin: 10,
  },
});

export const productsQuery = gql`
  query($orderBy: ProductOrderByInput, $where: ProductWhereInput) {
    products(orderBy: $orderBy, where: $where) {
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

class Products extends React.Component {
  state = {
    userId: null,
    query: '',
  };

  componentDidMount = async () => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const { userId } = jwtDecode(token);
    this.setState({
      userId,
    });
  };

  onChangeText = (name, text) => {
    this.setState({
      query: text,
    });
    this.props.data.refetch({
      where: {
        name_contains: text,
      },
    });
  };

  render() {
    const { data: { products, refetch, variables }, loading, history } = this.props;
    if (loading || !products) {
      return null;
    }

    return (
      <View>
        <View>
          <View style={styles.searchBar}>
            <TextField name="Search" onChangeText={this.onChangeText} value={this.state.query} />
          </View>
          <View style={styles.sortRow}>
            <Button
              style={styles.sortButton}
              title="Name"
              onPress={() =>
                refetch({
                  orderBy: variables.orderBy === 'name_ASC' ? 'name_DESC' : 'name_ASC',
                })
              }
            />
            <Button
              style={styles.sortButton}
              title="Price"
              onPress={() =>
                refetch({
                  orderBy: variables.orderBy === 'price_ASC' ? 'price_DESC' : 'price_ASC',
                })
              }
            />
          </View>
        </View>
        <Button title="Create Product" onPress={() => history.push('/new-product')} />
        <FlatList
          keyExtractor={item => item.id}
          data={products.map(x => ({ ...x, showButtons: this.state.userId === x.seller.id }))}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Image
                style={styles.images}
                source={{ uri: `http://localhost:4000/${item.pictureUrl}` }}
              />
              <View style={styles.right}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.price}>{`$${item.price}`}</Text>
                {item.showButtons ? (
                  <View style={styles.editSection}>
                    <Button
                      title="Edit"
                      onPress={() =>
                        this.props.history.push({
                          pathname: '/edit-product',
                          state: item,
                        })
                      }
                    />
                    <Button
                      title="Delete"
                      onPress={() =>
                        this.props.mutate({
                          variables: {
                            id: item.id,
                          },
                          update: (store) => {
                            const data = store.readQuery({ query: productsQuery });
                            data.products = data.products.filter(x => x.id !== item.id);
                            store.writeQuery({ query: productsQuery, data });
                          },
                        })
                      }
                    />
                  </View>
                ) : null}
              </View>
            </View>
          )}
        />
      </View>
    );
  }
}

export const deleteProductMutation = gql`
  mutation($id: ID!) {
    deleteProduct(where: { id: $id }) {
      id
    }
  }
`;

export default compose(graphql(productsQuery), graphql(deleteProductMutation))(Products);
