import React from 'react';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { ReactNativeFile } from 'apollo-upload-client';

import { productsQuery } from './Products';
import Form from '../components/Form';
import { HOST } from '../constants';

class EditProduct extends React.Component {
  submit = async (values) => {
    const { pictureUrl, name, price } = values;
    let picture = null;

    const { state: { item, variables } } = this.props.location;

    if (item.pictureUrl !== pictureUrl) {
      picture = new ReactNativeFile({
        uri: pictureUrl,
        type: 'image/png',
        name: 'i-am-a-name',
      });
    }

    try {
      await this.props.mutate({
        variables: {
          id: item.id,
          name,
          price,
          picture,
        },
        update: (store, { data: { updateProduct } }) => {
          const data = store.readQuery({ query: productsQuery, variables });
          data.productsConnection.edges = data.productsConnection.edges.map(x =>
            (x.node.id === updateProduct.id
              ? { __typename: 'Node', cursor: updateProduct.id, node: updateProduct }
              : x));
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
    const { state: { item } } = this.props.location;
    return (
      <Form
        initialValues={{
          ...item,
          pictureUrl: `http://${HOST}:4000/${item.pictureUrl}`,
          price: `${item.price}`,
        }}
        submit={this.submit}
      />
    );
  }
}

const editProductMutation = gql`
  mutation($id: ID!, $name: String, $price: Float, $picture: Upload) {
    updateProduct(id: $id, name: $name, price: $price, picture: $picture) {
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

export default graphql(editProductMutation)(EditProduct);
