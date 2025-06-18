import assert from "node:assert";
import test from "node:test";

import { calculateCommemorativeDate } from "./common.mjs";

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    console.error(`❌ ${message} — expected ${expected}, got ${actual}`);
  } else {
    console.log(`✅ ${message}`);
  }
}

// Test 1: 2nd Tuesday of October 2025 (Ada Lovelace Day)
assertEqual(
  calculateCommemorativeDate(2025, {
    name: "Ada Lovelace Day",
    month: 10,
    weekday: 2, // 0 = Sunday, 1 = Monday, 2 = Tuesday...
    occurrence: 2,
  }),
  "2025-10-14",
  "Ada Lovelace Day 2025 should be 2025-10-14"
);

// Test 2: Fixed date — World Environment Day
assertEqual(
  calculateCommemorativeDate(2025, {
    name: "World Environment Day",
    month: 6,
    day: 5,
  }),
  "2025-06-05",
  "World Environment Day 2025 should be 2025-06-05"
);
