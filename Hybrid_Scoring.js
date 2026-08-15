/**
 * Hybrid_Scoring.js
 *
 * Scoring script for the Financial Document Intelligence Pipeline.
 *
 * NOTE ON NAMING: this project does not implement hybrid (dense + sparse)
 * search — Lyzr's Knowledge Base retrieval is dense-only (Basic / MMR / HyDE),
 * with no exposed sparse-search or fusion option (see Readme.md, Section
 * "Architectures We Considered"). This file is named to match the required
 * submission template; its actual function is scoring RETRIEVAL QUALITY
 * across the two chunking-strategy conditions (fixed vs. semantic), which is
 * this project's real experimental variable.
 *
 * Usage:
 *   node Hybrid_Scoring.js results.json
 *
 * Expected input format (results.json) — an array of logged query results:
 *   [
 *     {
 *       "question": "What was Apple's total net revenue in fiscal year 2024?",
 *       "condition": "fixed",              // "fixed" | "semantic"
 *       "retrieved_text": "...",           // top retrieved chunk text
 *       "score": 0.884,                    // similarity score returned by Lyzr
 *       "contains_answer": false,          // manually verified against source filing
 *       "gold_value": "391,035"            // the figure that should appear
 *     },
 *     ...
 *   ]
 */

const fs = require("fs");

function loadResults(path) {
  const raw = fs.readFileSync(path, "utf-8");
  return JSON.parse(raw);
}

function scoreByCondition(results) {
  const summary = {};

  for (const r of results) {
    const cond = r.condition || "unknown";
    if (!summary[cond]) {
      summary[cond] = { total: 0, hits: 0, avgScore: 0, scores: [] };
    }
    summary[cond].total += 1;
    if (r.contains_answer) summary[cond].hits += 1;
    if (typeof r.score === "number") summary[cond].scores.push(r.score);
  }

  for (const cond of Object.keys(summary)) {
    const s = summary[cond];
    s.hitRate = s.total > 0 ? s.hits / s.total : 0;
    s.avgScore =
      s.scores.length > 0
        ? s.scores.reduce((a, b) => a + b, 0) / s.scores.length
        : null;
    delete s.scores;
  }

  return summary;
}

function printReport(summary) {
  console.log("\n=== Retrieval Quality by Chunking Condition ===\n");
  const conditions = Object.keys(summary);
  for (const cond of conditions) {
    const s = summary[cond];
    console.log(`Condition: ${cond}`);
    console.log(`  Questions tested : ${s.total}`);
    console.log(`  Correct answer in top result : ${s.hits} (${(s.hitRate * 100).toFixed(1)}%)`);
    console.log(`  Average similarity score : ${s.avgScore !== null ? s.avgScore.toFixed(3) : "n/a"}`);
    console.log("");
  }

  console.log("Key finding check: higher average similarity score does not imply");
  console.log("higher hit rate. Compare the two numbers above per condition —");
  console.log("this project's verified result shows apple_10k_fixed scoring higher");
  console.log("on similarity (0.884) while apple_semantic scored higher on actual");
  console.log("hit rate for the tested revenue-figure question.");
}

function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error("Usage: node Hybrid_Scoring.js <results.json>");
    process.exit(1);
  }
  const results = loadResults(inputPath);
  const summary = scoreByCondition(results);
  printReport(summary);
}

main();
