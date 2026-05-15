import {
  api
} from '../config/axios.config';

export const friendService = {
  getFriends:
    () =>
      api.get(
        '/friends'
      ),

  getRequests:
    () =>
      api.get(
        '/friends/requests'
      ),

  sendRequest:
    (
      phone:
        string
    ) =>
      api.post(
        '/friends/request',
        {
          phone
        }
      )
};