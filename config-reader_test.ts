import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.155.0/testing/asserts.ts";
import { readLocalConfig } from "./config-reader.ts";

Deno.test("Errors on invalid format", () => {
  Deno.readTextFileSync = (path) => "";
  assertThrows(() => readLocalConfig(), Error, "Unexpected end of JSON input");
});

Deno.test("Errors on missing `notion` key", () => {
  Deno.readTextFileSync = (path) => "{}";
  assertThrows(() => readLocalConfig(), Error, '"notion" key');
});

Deno.test("Errors on missing `notion.key` property", () => {
  Deno.readTextFileSync = (path) => '{"notion": {}}';
  assertThrows(() => readLocalConfig(), Error, '"notion.key" value');
});

Deno.test("Errors on missing `notion.databaseId` property", () => {
  Deno.readTextFileSync = (path) => '{"notion": {"key": "foo"}}';
  assertThrows(() => readLocalConfig(), Error, '"notion.databaseId" value');
});

Deno.test("Returns parsed key and databaseId", () => {
  Deno.readTextFileSync = (path) =>
    '{"notion": {"key": "foo", "databaseId": "bar"}}';
  const config = readLocalConfig();
  assertEquals(config, { key: "foo", databaseId: "bar" });
});
