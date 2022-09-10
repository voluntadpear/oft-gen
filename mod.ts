import { Client, writeTextToClipboard } from "./deps.ts";
import type { PageObjectResponse, QueryDatabaseResponse } from "./deps.ts";

import { TaskMetadata } from "./types.ts";

async function generateMessage() {
  const { key, databaseId } = readLocalConfig();
  const notion = new Client({ auth: key });
  const completedStatuses = await getCompletedOptions(notion, databaseId);
  const completedTasks = await getCompletedTasks(
    notion,
    databaseId,
    completedStatuses
  );
  const tasksMetadata = extractFromTasks(completedTasks);
  const slackMsg = formatOFTMessage(tasksMetadata);
  console.log(slackMsg);
  writeTextToClipboard(slackMsg);
  console.log("Message copied to clipboard.");
}

function readLocalConfig(): { key: string; databaseId: string } {
  const config = Deno.readTextFileSync("./config.json");
  const parsedConfig = JSON.parse(config);

  if (!parsedConfig.notion) {
    throw new Error('You must specify a config.json file with a "notion" key');
  }
  if (!parsedConfig.notion.key) {
    throw new Error('The "notion.key" value was not found on the config.json.');
  }

  if (!parsedConfig.notion.databaseId) {
    throw new Error(
      'The "notion.databaseId" value was not found on the config.json.'
    );
  }

  return {
    key: parsedConfig.notion.key as string,
    databaseId: parsedConfig.notion.databaseId as string,
  };
}

function formatOFTMessage(tasks: TaskMetadata[]) {
  const template = `*Out for Today:*\n`;
  const bullets = tasks
    .map((task) => {
      const base = `•  ${task.name}`;
      if (task.url) {
        return `${base}\n\t•  [${prettifyHost(task.url)}](${task.url})`;
      }
      return base;
    })
    .join("\n");

  const output = `${template}${bullets}`;
  return output;
}

async function getCompletedOptions(notion: Client, databaseId: string) {
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

async function getCompletedTasks(
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

function extractFromTasks(tasks: QueryDatabaseResponse): TaskMetadata[] {
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

function assert(condition: boolean, msg?: string): asserts condition {
  if (!condition) {
    throw new Error(msg);
  }
}

generateMessage();
