export const searchChats =
  (
    chats: any[],
    query: string
  ) => {

    return chats.filter(
      chat =>
        chat.name
          .toLowerCase()
          .includes(
            query
              .toLowerCase()
          )
    );

  };