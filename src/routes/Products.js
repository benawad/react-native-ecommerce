import React from 'react';
import {
  ActivityIndicator,
  Image,
  Text,
  View,
  Button,
  FlatList,
  StyleSheet,
  AsyncStorage,
  TouchableOpacity,
} from 'react-native';
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
  outerContainer: {
    display: 'flex',
    flex: 1,
  },
});

export const productsQuery = gql`
  query($after: String, $orderBy: ProductOrderByInput, $where: ProductWhereInput) {
    productsConnection(after: $after, first: 5, orderBy: $orderBy, where: $where) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          price
          pictureUrl
          name
          seller {
            id
          }
        }
      }
    }
  }
`;

const productsSubscription = gql`
  subscription {
    product(where: { mutation_in: UPDATED }) {
      node {
        __typename
        id
        name
        price
        pictureUrl
        seller {
          id
        }
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
    this.props.data.subscribeToMore({
      document: productsSubscription,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev;
        }

        const { node } = subscriptionData.data.product;

        prev.productsConnection.edges = prev.productsConnection.edges.map(x => (x.node.id === node.id ? { __typename: 'Node', cursor: node.id, node } : x));

        return prev;
      },
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
      after: null,
    });
  };

  render() {
    const {
      data: {
        productsConnection = { pageInfo: {}, edges: [] },
        refetch,
        variables,
        fetchMore,
        loading,
      },
      history,
      editProductMutate,
    } = this.props;

    const productsMap = {};

    return (
      <View style={styles.outerContainer}>
        <View>
          <View style={styles.searchBar}>
            <TextField name="Search" onChangeText={this.onChangeText} value={this.state.query} />
          </View>
          <View style={styles.sortRow}>
            <Button
              style={styles.sortButton}
              title="Name"
              onPress={() =>
                !loading &&
                refetch({
                  orderBy: variables.orderBy === 'name_ASC' ? 'name_DESC' : 'name_ASC',
                  after: null,
                })
              }
            />
            <Button
              style={styles.sortButton}
              title="Price"
              onPress={() =>
                !loading &&
                refetch({
                  orderBy: variables.orderBy === 'price_ASC' ? 'price_DESC' : 'price_ASC',
                  after: null,
                })
              }
            />
          </View>
        </View>
        <Button
          title="Create Product"
          onPress={() => history.push({ pathname: '/new-product', state: variables })}
        />
        <FlatList
          keyExtractor={item => item.id}
          ListFooterComponent={() =>
            (productsConnection.pageInfo.hasNextPage ? (
              <ActivityIndicator size="large" color="#00ff00" />
            ) : null)
          }
          onEndReached={() => {
            if (!loading && productsConnection.pageInfo.hasNextPage) {
              fetchMore({
                variables: {
                  after: productsConnection.pageInfo.endCursor,
                },
                updateQuery: (previousResult, { fetchMoreResult }) => {
                  if (!fetchMoreResult) {
                    return previousResult;
                  }
                  if (
                    !previousResult ||
                    !previousResult.productsConnection ||
                    !previousResult.productsConnection.edges
                  ) {
                    return fetchMoreResult;
                  }
                  return {
                    productsConnection: {
                      __typename: 'ProductConnection',
                      pageInfo: fetchMoreResult.productsConnection.pageInfo,
                      edges: [
                        ...previousResult.productsConnection.edges,
                        ...fetchMoreResult.productsConnection.edges,
                      ],
                    },
                  };
                },
              });
            }
          }}
          onEndReachedThreshold={0}
          data={productsConnection.edges
            .map(x => ({
              ...x.node,
              showButtons: this.state.userId === x.node.seller.id,
            }))
            .filter((x) => {
              if (productsMap[x.id]) {
                return false;
              }
              productsMap[x.id] = 1;
              return true;
            })}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Image
                style={styles.images}
                source={{ uri: `http://localhost:4000/${item.pictureUrl}` }}
              />
              <View style={styles.right}>
                <Text style={styles.name}>{item.name}</Text>
                <TouchableOpacity
                  onPress={() =>
                    editProductMutate({
                      variables: {
                        id: item.id,
                        price: item.price + 5,
                      },
                    })
                  }
                >
                  <Text style={styles.price}>{`$${item.price}`}</Text>
                </TouchableOpacity>
                {item.showButtons ? (
                  <View style={styles.editSection}>
                    <Button
                      title="Edit"
                      onPress={() =>
                        this.props.history.push({
                          pathname: '/edit-product',
                          state: {
                            item,
                            variables,
                          },
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
                            const data = store.readQuery({ query: productsQuery, variables });
                            data.productsConnection.edges = data.productsConnection.edges.filter(x => x.node.id !== item.id);
                            store.writeQuery({ query: productsQuery, data, variables });
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

const editProductMutation = gql`
  mutation($id: ID!, $price: Float) {
    updateProduct(id: $id, price: $price) {
      __typename
      id
      name
      price
      pictureUrl
      seller {
        id
      }
    }
  }
`;

export const deleteProductMutation = gql`
  mutation($id: ID!) {
    deleteProduct(where: { id: $id }) {
      id
    }
  }
`;

export default compose(
  graphql(productsQuery, { options: { variables: { orderBy: 'createdAt_DESC' } } }),
  graphql(deleteProductMutation),
  graphql(editProductMutation, { name: 'editProductMutate' }),
)(Products);
