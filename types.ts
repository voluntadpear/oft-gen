export type TaskMetadata = {
  name: string;
  url: string | null;
};

export type Category = "PR" | "Issue" | "Support" | "Doc" | "Other";
export type Provider =
  | "GitHub"
  | "Google Docs"
  | "Zendesk"
  | "Notion"
  | "Slack";

export function assert(condition: boolean, msg?: string): asserts condition {
  if (!condition) {
    throw new Error(msg);
  }
}
