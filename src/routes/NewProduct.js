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

    try {
      await this.props.mutate({
        variables: {
          name,
          price,
          picture,
        },
        update: (store, { data: { createProduct } }) => {
          // Read the data from our cache for this query.
          const data = store.readQuery({ query: productsQuery });
          // Add our comment from the mutation to the end.
          data.products.push(createProduct);
          // Write our data back to the cache.
          store.writeQuery({ query: productsQuery, data });
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
