import {
  createSlice
} from '@reduxjs/toolkit';

interface CallState {
  incomingCaller:
    string | null;

  activeCall:
    boolean;
}

const initialState:
  CallState = {
    incomingCaller:
      null,

    activeCall:
      false
  };

const callSlice =
  createSlice({
    name: 'call',

    initialState,

    reducers: {
      receiveCall:
        (
          state,
          action
        ) => {
          state
            .incomingCaller =
            action.payload;
        },

      acceptCall:
        state => {
          state
            .activeCall =
            true;

          state
            .incomingCaller =
            null;
        },

      rejectCall:
        state => {
          state
            .incomingCaller =
            null;
        }
    }
  });

export const {
  receiveCall,

  acceptCall,

  rejectCall
} =
  callSlice.actions;

export default
  callSlice.reducer;