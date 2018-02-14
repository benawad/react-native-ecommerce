import React from 'react';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { ReactNativeFile } from 'apollo-upload-client';

import { productsQuery } from './Products';
import Form from '../components/Form';

class EditProduct extends React.Component {
  submit = async (values) => {
    const { pictureUrl, name, price } = values;
    let picture = null;

    const { state } = this.props.location;

    if (state.pictureUrl !== pictureUrl) {
      picture = new ReactNativeFile({
        uri: pictureUrl,
        type: 'image/png',
        name: 'i-am-a-name',
      });
    }

    try {
      await this.props.mutate({
        variables: {
          id: state.id,
          name,
          price,
          picture,
        },
        update: (store, { data: { updateProduct } }) => {
          const data = store.readQuery({ query: productsQuery });
          data.products = data.products.map(x => (x.id === updateProduct.id ? updateProduct : x));
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
    const { state } = this.props.location;
    return (
      <Form
        initialValues={{
          ...state,
          pictureUrl: `http://localhost:4000/${state.pictureUrl}`,
          price: `${state.price}`,
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
