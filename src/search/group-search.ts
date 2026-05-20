export const searchGroups =
  (groups:any[],query:string) =>
    groups.filter(
      g =>
        g.name
          .includes(query)
    );