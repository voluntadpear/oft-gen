import { assertSnapshot } from "https://deno.land/std@0.155.0/testing/snapshot.ts";

import { formatOFTMessage } from "./format.ts";
import { TaskMetadata } from "./types.ts";

Deno.test("format message", async (t) => {
  const tasks: TaskMetadata[] = [
    {
      name: "Task 1",
      url: null,
    },
    {
      name: "Task 2",
      url: "https://github.com/my-account/my-repo/pull/190",
    },
    {
      name: "Task 3",
      url: "https://docs.google.com/document/d/dfgokkjlsdf23453245blahblah/edit",
    },
    {
      name: "Task 4 with a longer description",
      url: "https://myorg.zendesk.com/agent/tickets/341",
    },
    {
      name: "Task 5",
      url: "https://myorg.zendesk.com/agent/filters/32311",
    },
    {
      name: "Task 6",
      url: "https://www.notion.so/abcdefoo",
    },
    {
      name: "Task 7",
      url: "https://github.com/orgs/myorg/projects/99",
    },
    {
      name: "Task 8",
      url: "https://github.com/myorg/myrepo/issues/991",
    },
  ];

  const output = formatOFTMessage(tasks);
  await assertSnapshot(t, output);
});
