import assert from "node:assert";
import test from "node:test";
import { getUserIds } from "./common.mjs";
import { computeRevisions } from "./script.mjs";
import { addData, getData, clearData } from "./storage.mjs";

test("getUserIds returns 5 users", () => {
  const users = getUserIds();
  assert.strictEqual(users.length, 5);
});

test("computeRevisions generates correct spaced intervals", () => {
  const topic = "Functions in JS";
  const startDate = new Date("2025-07-19");
  const revisions = computeRevisions(topic, startDate);

  // Should return 5 dates
  assert.strictEqual(revisions.length, 5);

  // Should include the correct topic name
  revisions.forEach((r) => {
    assert.strictEqual(r.topic, topic);
  });

  // Verify first interval is +7 days
  const firstDate = new Date(revisions[0].date);
  const diffDays = (firstDate - startDate) / (1000 * 60 * 60 * 24);
  assert.strictEqual(diffDays, 7);
});

test("addData stores data for the correct user", () => {
  const userId = "1";
  const topic = "Functions in JS";
  const startDate = new Date("2025-07-19");
  const items = computeRevisions(topic, startDate);

  clearData(userId); // ensure clean state
  addData(userId, items);

  const stored = getData(userId);
  assert.deepStrictEqual(stored, items);
});

test("clearData removes all stored data for user", () => {
  const userId = "1";
  const topic = "Functions in JS";
  const startDate = new Date("2025-07-19");
  const items = computeRevisions(topic, startDate);

  addData(userId, items);
  clearData(userId);

  const result = getData(userId);
  assert.strictEqual(result, null);
});
