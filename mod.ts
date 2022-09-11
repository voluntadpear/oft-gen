import { readLocalConfig } from "./config-reader.ts";
import { Client, writeTextToClipboard } from "./deps.ts";
import { formatOFTMessage } from "./format.ts";
import {
  extractFromTasks,
  getPropsFromDB,
  getCompletedTasks,
} from "./notion.ts";

async function generateMessage() {
  const { key, databaseId } = readLocalConfig();
  const notion = new Client({ auth: key });
  const {
    titleProp,
    statusProp: [statusPropKey, completedStatuses],
    linkProp,
  } = await getPropsFromDB(notion, databaseId);
  const completedTasks = await getCompletedTasks(
    notion,
    databaseId,
    statusPropKey,
    completedStatuses
  );
  const tasksMetadata = extractFromTasks(completedTasks, titleProp, linkProp);
  const slackMsg = formatOFTMessage(tasksMetadata);
  console.log(slackMsg);
  writeTextToClipboard(slackMsg);
  console.log("\nMessage copied to clipboard.");
}

generateMessage();
