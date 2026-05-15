import {
  createSlice
} from '@reduxjs/toolkit';

interface Group {
  id: string;

  name: string;

  members:
    string[];
}

interface GroupState {
  groups:
    Group[];
}

const initialState:
  GroupState = {
    groups: [
      {
        id: '1',

        name:
          'Java Team',

        members: [
          'Sami',
          'Vami'
        ]
      },

      {
        id: '2',

        name:
          'Family',

        members: [
          'Mom',
          'Dad'
        ]
      }
    ]
  };

const groupSlice =
  createSlice({
    name: 'group',

    initialState,

    reducers: {
      addGroup: (
        state,
        action
      ) => {
        state.groups.push(
          action.payload
        );
      }
    }
  });

export const {
  addGroup
} =
  groupSlice.actions;

export default
  groupSlice.reducer;