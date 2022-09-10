import { TaskMetadata } from "./types.ts";

export function formatOFTMessage(tasks: TaskMetadata[]) {
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

type Provider = "GitHub" | "Google Docs" | "Zendesk" | "Notion";
const originsMap: Record<string, Provider> = {
  "github.com": "GitHub",
  "google.com": "Google Docs",
  "zendesk.com": "Zendesk",
  "notion.so": "Notion",
};

function prettifyHost(url: string) {
  const parsedURL = new URL(url);
  const keys = Object.keys(originsMap);
  const match = keys.find((providerKey) =>
    parsedURL.origin.includes(providerKey)
  );
  if (!match) {
    return "Link";
  }

  const matchedValue = originsMap[match];

  if (matchedValue === "GitHub") {
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
  if (matchedValue === "Zendesk") {
    const ticketRegex = /\/tickets\/(?<ticket>[0-9]+)/;
    const regexMatch = parsedURL.pathname.match(ticketRegex);
    const ticket = regexMatch?.groups?.ticket;
    return ticket ? `Zendesk ticket #${ticket}` : "Zendesk";
  }

  return matchedValue;
}
