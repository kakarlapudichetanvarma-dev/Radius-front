import {
  useQuery
} from '@tanstack/react-query';

import {
  groupService
} from '../services/group.service';

export const useGroupQuery =
  () =>
    useQuery({
      queryKey: [
        'groups'
      ],

      queryFn:
        async () => {
          const response =
            await groupService
              .getGroups();

          return response
            .data;
        }
    });