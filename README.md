<div align="center">
<h1>oft-gen</h1>

<p>Generate "Out for Today" messages from Notion To-Dos boards
</div>

---

![CI pipeline][build-badge]![MIT License][license-badge]

## Overview

At work we have the tradition to post a brief summary of the tasks each team member worked on during the day.

Lately, I've been using Notion to handle my personal list of tasks in a prioritized a manageable way. So, that's how this tool was born.

## Usage

1. Make sure that you have [Deno](https://deno.land/#installation) installed in your system.
2. Download/clone this repository
3. Duplicate `config.json.sample` as `config.json`
4. Create an internal integration from the Notion portal as [explained in the guides](https://developers.notion.com/docs/getting-started).
5. Share the Notion database that you want to generate the "Out for Today" message from with the integration. Click on the `•••` Page menu and use the search bar in the `Add connections` pop-out to find the integration you've created. Simply click on your integration to give it access to your database.
6. Get the ID of the Notion database that you want to generate the "Out for Today" message from. For this, you can copy the URL of your database and use the path from the URL.

```
https://www.notion.so/myworkspace/a8aec43384f447ed84390e8e42c2e089?v=...
                                  |--------- Database ID --------|
```

7. Put your Notion "Internal Integration Token" (that you get after creating the Notion integration) in the `notion.key` property of your `config.json`
8. Put the database ID in the `notion.databaseId` property of your `config.json`
9. Run `./oft-gen`

After following these steps, the "Out for Today" message should be copied into your clipboard and ready to be pasted on Slack.

[build-badge]: https://github.com/voluntadpear/oft-gen/actions/workflows/pipeline.yml/badge.svg
[license-badge]: https://img.shields.io/npm/l/mdx-bundler.svg?style=flat-square
