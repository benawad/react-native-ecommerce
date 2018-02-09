const ADD_USER = 'ADD_USER';

export const addUser = user => ({
  type: ADD_USER,
  user,
});

export default (state = {}, action) => {
  switch (action.type) {
    case ADD_USER:
      return action.user;
    default:
      return state;
  }
};
