import React from 'react';
import { Image, Text, View, Button, FlatList, StyleSheet, AsyncStorage } from 'react-native';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';
import jwtDecode from 'jwt-decode';

import { TOKEN_KEY } from '../constants';

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

class Products extends React.Component {
  state = {
    userId: null,
  };

  componentDidMount = async () => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const { userId } = jwtDecode(token);
    this.setState({
      userId,
    });
  };

  render() {
    const { data: { products }, loading, history } = this.props;
    if (loading || !products) {
      return null;
    }

    return (
      <View>
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
