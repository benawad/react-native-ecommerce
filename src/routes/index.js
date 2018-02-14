import React from 'react';
import { NativeRouter, Switch, Route } from 'react-router-native';

import Signup from './Signup';
import Login from './Login';
import Products from './Products';
import CheckToken from './CheckToken';
import NewProduct from './NewProduct';
import EditProduct from './EditProduct';

export default () => (
  <NativeRouter>
    <Switch>
      <Route exact path="/" component={CheckToken} />
      <Route exact path="/signup" component={Signup} />
      <Route exact path="/login" component={Login} />
      <Route exact path="/products" component={Products} />
      <Route exact path="/new-product" component={NewProduct} />
      <Route exact path="/edit-product" component={EditProduct} />
    </Switch>
  </NativeRouter>
);
