import {
  createSlice
} from '@reduxjs/toolkit';

interface FriendRequest {
  id: string;

  username: string;
}

interface FriendState {
  requests:
    FriendRequest[];

  friends:
    string[];
}

const initialState:
  FriendState = {
    requests: [
      {
        id: '1',

        username:
          'Vami'
      },

      {
        id: '2',

        username:
          'Rahul'
      }
    ],

    friends: [
      'Sami'
    ]
  };

const friendSlice =
  createSlice({
    name: 'friend',

    initialState,

    reducers: {
      acceptRequest:
        (
          state,
          action
        ) => {
          const request =
            state.requests.find(
              request =>
                request.id ===
                action.payload
            );

          if (request) {
            state.friends.push(
              request.username
            );
          }

          state.requests =
            state.requests.filter(
              request =>
                request.id !==
                action.payload
            );
        },

      rejectRequest:
        (
          state,
          action
        ) => {
          state.requests =
            state.requests.filter(
              request =>
                request.id !==
                action.payload
            );
        }
    }
  });

export const {
  acceptRequest,

  rejectRequest
} =
  friendSlice.actions;

export default
  friendSlice.reducer;