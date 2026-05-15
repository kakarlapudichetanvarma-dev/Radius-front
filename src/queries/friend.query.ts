import {
  useQuery
} from '@tanstack/react-query';

import {
  friendService
} from '../services/friend.service';

export const useFriendQuery =
  () =>
    useQuery({
      queryKey: [
        'friends'
      ],

      queryFn:
        async () => {
          const response =
            await friendService
              .getFriends();

          return response
            .data;
        }
    });