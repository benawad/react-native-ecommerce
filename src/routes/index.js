import React from 'react';
import { NativeRouter, Switch, Route } from 'react-router-native';

import Signup from './Signup';
import Login from './Login';
import Products from './Products';
import CheckToken from './CheckToken';

export default () => (
  <NativeRouter>
    <Switch>
      <Route exact path="/" component={CheckToken} />
      <Route exact path="/signup" component={Signup} />
      <Route exact path="/login" component={Login} />
      <Route exact path="/products" component={Products} />
    </Switch>
  </NativeRouter>
);
