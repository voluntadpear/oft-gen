export function readLocalConfig(): { key: string; databaseId: string } {
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
