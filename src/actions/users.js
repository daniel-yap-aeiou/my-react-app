export const Types = {
  GET_USERS_REQUEST: "users/get_users_request",
  GET_USERS_SUCCESS: "users/get_users_success",
  DELETE_USER_REQUEST: "users/delete_user_request",
  CREATE_USER_REQUEST: "users/create_user_request",
  USERS_ERROR: "users/user_error",
  RESET_USERS: "users/reset"
};

export const getUsersRequest = () => ({
  type: Types.GET_USERS_REQUEST
});

export const getUsersSuccess = ({ items }) => ({
  type: Types.GET_USERS_SUCCESS,
  payload: {
    items
  }
});

export const createUserRequest = ({ firstName, lastName }) => ({
  type: Types.CREATE_USER_REQUEST,
  payload: {
    firstName,
    lastName
  }
});

export const deleteUserRequest = (userObject) => ({
  type: Types.DELETE_USER_REQUEST,
  payload: {
    userObject
  }
});

export const usersError = ({ error }) => ({
  type: Types.USERS_ERROR,
  payload: {
    error
  }
});

export const resetUsersRequest = () => ({
  type: Types.RESET_USERS
});