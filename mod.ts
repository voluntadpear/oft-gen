import { readLocalConfig } from "./config-reader.ts";
import { Client, writeTextToClipboard } from "./deps.ts";
import { formatOFTMessage } from "./format.ts";
import {
  extractFromTasks,
  getCompletedOptions,
  getCompletedTasks,
} from "./notion.ts";

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

generateMessage();
