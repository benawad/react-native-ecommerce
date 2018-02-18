import React from 'react';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { ReactNativeFile } from 'apollo-upload-client';

import { productsQuery } from './Products';
import Form from '../components/Form';

class NewProduct extends React.Component {
  submit = async (values) => {
    const { pictureUrl, name, price } = values;
    const picture = new ReactNativeFile({
      uri: pictureUrl,
      type: 'image/png',
      name: 'i-am-a-name',
    });

    const { state: variables } = this.props.location;

    try {
      await this.props.mutate({
        variables: {
          name,
          price,
          picture,
        },
        update: (store, { data: { createProduct } }) => {
          const data = store.readQuery({ query: productsQuery, variables });
          data.productsConnection.edges = [
            { __typename: 'Node', cursor: createProduct.id, node: createProduct },
            ...data.productsConnection.edges,
          ];
          store.writeQuery({ query: productsQuery, data, variables });
        },
      });
    } catch (err) {
      console.log('err happened');
      console.log(err);
      return;
    }

    this.props.history.push('/products');
  };

  render() {
    return <Form submit={this.submit} />;
  }
}

const createProductMutation = gql`
  mutation($name: String!, $price: Float!, $picture: Upload!) {
    createProduct(name: $name, price: $price, picture: $picture) {
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

export default graphql(createProductMutation)(NewProduct);
