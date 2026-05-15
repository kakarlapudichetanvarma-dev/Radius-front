import {
  api
} from '../config/axios.config';

export const groupService = {
  getGroups:
    () =>
      api.get(
        '/groups'
      ),

  createGroup:
    (
      data:
        any
    ) =>
      api.post(
        '/groups',
        data
      )
};