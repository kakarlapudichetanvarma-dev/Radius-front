export const searchFriends =
  (friends:any[],query:string) =>
    friends.filter(
      f =>
        f.username
          .includes(query)
    );