import { Category, Provider, TaskMetadata } from "./types.ts";

const emojisMap: Record<Category, string> = {
  Doc: "📄",
  Issue: "🔦",
  PR: "💡",
  Support: "⚙️",
  Other: "✅",
};

export function formatOFTMessage(tasks: TaskMetadata[]) {
  const template = `*Out for Today:*\n`;
  const bullets = tasks
    .map((task) => {
      let linkText: string | null = null;
      let category: Category = "Other";

      if (task.url) {
        const metadata = categorizeItem(task.url);
        linkText = metadata.linkText;
        category = metadata.category;
      }
      const base = `•  ${emojisMap[category]} ${task.name}`;
      if (linkText) {
        return `${base} → [${linkText}](${task.url})`;
      }
      return base;
    })
    .join("\n");

  const output = `${template}${bullets}`;
  return output;
}

const originsMap: Record<string, Provider> = {
  "github.com": "GitHub",
  "google.com": "Google Docs",
  "zendesk.com": "Zendesk",
  "notion.so": "Notion",
};

function categorizeItem(url: string): {
  linkText: string | null;
  category: Category;
} {
  const parsedURL = new URL(url);
  const keys = Object.keys(originsMap);
  const match = keys.find((providerKey) =>
    parsedURL.origin.includes(providerKey)
  );
  if (!match) {
    return { linkText: "Link", category: "Other" };
  }

  const matchedValue = originsMap[match];

  if (matchedValue === "GitHub") {
    // Custom logic for both PRs and issues
    if (parsedURL.pathname.includes("/pull/")) {
      const prNumberRegex = /\/pull\/(?<prNumber>[0-9]+)/;
      const regexMatch = parsedURL.pathname.match(prNumberRegex);
      const prNumber = regexMatch?.groups?.prNumber;
      return {
        linkText: `GitHub PR${prNumber ? ` #${prNumber}` : ""}`,
        category: "PR",
      };
    } else if (parsedURL.pathname.includes("/issues")) {
      const issueRegex = /\/issues\/(?<issue>[0-9]+)/;
      const regexMatch = parsedURL.pathname.match(issueRegex);
      const issue = regexMatch?.groups?.issue;
      return {
        linkText: `GitHub issue${issue ? ` #${issue}` : ""}`,
        category: "Issue",
      };
    }
    return { linkText: "GitHub", category: "Other" };
  }
  if (matchedValue === "Zendesk") {
    const ticketRegex = /\/tickets\/(?<ticket>[0-9]+)/;
    const regexMatch = parsedURL.pathname.match(ticketRegex);
    const ticket = regexMatch?.groups?.ticket;
    return ticket
      ? { linkText: `Zendesk ticket #${ticket}`, category: "Support" }
      : { linkText: "Zendesk", category: "Other" };
  }

  if (matchedValue === "Notion") {
    return { linkText: matchedValue, category: "Doc" };
  }
  if (matchedValue === "Google Docs") {
    return { linkText: matchedValue, category: "Doc" };
  }

  return { linkText: matchedValue, category: "Other" };
}
