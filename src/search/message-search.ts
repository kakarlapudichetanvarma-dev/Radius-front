export const searchMessages =
  (
    messages:any[],
    query:string
  ) =>
    messages.filter(
      m =>
        m.text
          .includes(query)
    );