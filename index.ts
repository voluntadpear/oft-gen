import { Client } from "https://esm.sh/@notionhq/client@2.2.0";
import {
  PageObjectResponse,
  QueryDatabaseResponse,
} from "https://esm.sh/v94/@notionhq/client@2.2.0/build/src/api-endpoints.d.ts";

import { TaskMetadata } from "./types.ts";

const notion = new Client({ auth: Deno.env.get("NOTION_KEY") });

const databaseId = Deno.env.get("NOTION_DATABASE_ID");

async function generateMessage() {
  const completedStatuses = await getCompletedOptions();
  const completedTasks = await getCompletedTasks(completedStatuses);
  const tasksMetadata = extractFromTasks(completedTasks);
  const slackMsg = formatOFTMessage(tasksMetadata);
  console.log(slackMsg);
}

function formatOFTMessage(tasks: TaskMetadata[]) {
  const template = `*Out for Today:*\n`;
  const bullets = tasks
    .map((task) => {
      const base = `• ${task.name}`;
      if (task.url) {
        return `${base}\n\t• [${prettifyHost(task.url)}](${task.url})`;
      }
      return base;
    })
    .join("\n");

  const output = `${template}${bullets}`;
  return output;
}

async function getCompletedOptions() {
  assert(databaseId);
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

async function getCompletedTasks(completedStatuses: string[]) {
  assert(databaseId);

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

function extractFromTasks(tasks: QueryDatabaseResponse): TaskMetadata[] {
  const filteredResults = tasks.results.filter(
    (task) => "parent" in task
  ) as PageObjectResponse[];

  return filteredResults.map((result) => {
    assert(result.properties.Name);
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

type Provider = "GitHub" | "Google Docs" | "Zendesk" | "Notion";
const originsMap: Record<string, Provider> = {
  "https://github.com": "GitHub",
  "https://docs.google.com": "Google Docs",
  "https://zendesk.com": "Zendesk",
  "https://notion.so": "Notion",
  "https://www.notion.so": "Notion",
};

function prettifyHost(url: string) {
  const parsedURL = new URL(url);
  const match = originsMap[parsedURL.origin];
  if (!match) {
    return "Link";
  }

  if (match === "GitHub") {
    // Custom logic for both PRs and issues
    if (parsedURL.pathname.includes("/pull/")) {
      const prNumberRegex = /\/pull\/(?<prNumber>[0-9]+)/;
      const regexMatch = parsedURL.pathname.match(prNumberRegex);
      const prNumber = regexMatch?.groups?.prNumber;
      return `GitHub PR${prNumber ? ` #${prNumber}` : ""}`;
    } else if (parsedURL.pathname.includes("/issues")) {
      const issueRegex = /\/issues\/(?<issue>[0-9]+)/;
      const regexMatch = parsedURL.pathname.match(issueRegex);
      const issue = regexMatch?.groups?.issue;
      return `GitHub issue${issue ? ` #${issue}` : ""}`;
    }
    return "GitHub";
  }
  if (match === "Zendesk") {
    const ticketRegex = /\/tickets\/(?<ticket>[0-9]+)/;
    const regexMatch = parsedURL.pathname.match(ticketRegex);
    const ticket = regexMatch?.groups?.ticket;
    return ticket ? `Zendesk ticket #${ticket}` : "Zendesk";
  }

  return match;
}

function assert(condition: any, msg?: string): asserts condition {
  if (!condition) {
    throw new Error(msg);
  }
}

generateMessage();
