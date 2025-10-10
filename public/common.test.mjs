import assert from "node:assert";
import test from "node:test";
import { getUserIds } from "./common.mjs";
import { computeRevisions } from "./helper.mjs";
import { getDayWithSuffix } from "./helper.mjs";


// --- TESTS ---

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

test("getDayWithSuffix returns correct suffixes", () => {

  const tests = [
    [1, "1st"],
    [2, "2nd"],
    [3, "3rd"],
    [4, "4th"],
    [11, "11th"],
    [12, "12th"],
    [13, "13th"],
    [21, "21st"],
    [22, "22nd"],
    [23, "23rd"],
    [24, "24th"],
  ];

  for (const [input, expected] of tests) {
    assert.strictEqual(getDayWithSuffix(input), expected);
  }
});
