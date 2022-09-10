import type { Client } from "./deps.ts";
import { assert, TaskMetadata } from "./types.ts";

import type { PageObjectResponse, QueryDatabaseResponse } from "./deps.ts";

export async function getCompletedOptions(notion: Client, databaseId: string) {
  const db = await notion.databases.retrieve({ database_id: databaseId });
  const statusGroups = db.properties.Status;
  assert(statusGroups.type === "status");
  const completeGroup = statusGroups.status.groups.find(
    (group) => group.name === "Complete"
  );

  return statusGroups.status.options
    .filter((option) => completeGroup?.option_ids.includes(option.id))
    .map((option) => option.name);
}

export async function getCompletedTasks(
  notion: Client,
  databaseId: string,
  completedStatuses: string[]
) {
  assert(!!databaseId);

  const dbPages = await notion.databases.query({
    database_id: databaseId,
    filter: {
      or: completedStatuses.map((option) => ({
        property: "Status",
        status: { equals: option },
      })),
    },
  });
  assert(dbPages.object === "list");
  return dbPages;
}

export function extractFromTasks(tasks: QueryDatabaseResponse): TaskMetadata[] {
  const filteredResults = tasks.results.filter(
    (task) => "parent" in task
  ) as PageObjectResponse[];

  return filteredResults.map((result) => {
    assert(!!result.properties.Name);
    let name = "";
    let url = "";

    const nameProp = result.properties.Name;
    if (nameProp.type === "title") {
      if (nameProp.title[0].type === "text") {
        name = nameProp.title[0].text.content;
      }
    }

    const linkProp = result.properties.Link;
    if (linkProp.type === "url") {
      url = linkProp.url ?? "";
    }

    return { name, url: url || null };
  });
}
