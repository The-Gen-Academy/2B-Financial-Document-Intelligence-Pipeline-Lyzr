# 2B-Financial-Document-Intelligence-Pipeline-Lyzr

# Financial Document Intelligence Pipeline

**Week 2 — RAG Pipelines Bootcamp | Gen Academy | Project 2B**
Built on Lyzr Studio (Agent Studio + SuperFlow)

## What this is

A RAG pipeline that answers questions over Apple's SEC 10-K filings (FY2024, FY2025), built to test one specific hypothesis: **chunking strategy — not model choice or retrieval settings — determines whether financial-table retrieval actually works.**

Two Knowledge Bases are built from the same source filings:
- `apple_10k_fixed` — populated by uploading the raw cleaned filings; Lyzr's internal (non-configurable) chunker applies
- `apple_semantic` — populated with a small set of manually curated, semantically chunked passages, built with a local embedding-distance chunker

A single Lyzr Agent (One Shot retrieval, both Knowledge Bases attached) answers the same question against both, and a minimal SuperFlow (`Trigger → AI Agent → No-Op`) runs the query end to end.

## Verified result

| Question | `apple_10k_fixed` | `apple_semantic` |
|---|---|---|
| What was Apple's total net revenue in fiscal year 2024? | Wearables/Services commentary, 88.4% score — **does not contain the answer** | Complete revenue table incl. `$391,035M`, 86.4% score — **answer verifiable** |

Live SuperFlow output:
> "Apple's total net sales for fiscal year 2024 were $391,035 million, or about $391.0 billion [0000320193-24-000123_cleaned:cb2619890]"

**Key finding:** the fixed-chunking KB scored *higher* on raw similarity yet was *less useful*, because it split the revenue table across fragments. Similarity score and actual relevance are not the same measurement.

## Repo contents

| File | Contents |
|---|---|
| `Readme.md` | This file |
| `architecture.png` | Full pipeline architecture diagram |
| `superflow.json` | Exported SuperFlow definition (Trigger → AI Agent → No-Op) |
| `Agent_Instructions.md` | Full Role / Goal / Instructions for the Financial Analyst Assistant agent |
| `Eval_Queries.txt` | 15-question evaluation set (SEC-filing-verifiable questions) |
| `Hybrid_Scoring.js` | Scoring script comparing retrieval quality across chunking conditions |
| `sample_results.json` | Example input for `Hybrid_Scoring.js`, containing the one verified result above |
| `product_documentation.txt` | Notes on Lyzr's actual capabilities/limitations, confirmed by direct testing |

## How to reproduce

1. Download Apple's last two 10-K filings via `sec-edgar-downloader`
2. Clean SGML/XBRL markup (see Architecture Breakdown in the Solution Kit doc)
3. Upload cleaned filings to a Basic-type Knowledge Base in Lyzr Studio (`apple_10k_fixed`)
4. Run a local semantic chunker on the same cleaned text; upload the resulting chunks to a second Basic-type Knowledge Base (`apple_semantic`)
5. Create an Agent (One Shot retrieval type), attach both Knowledge Bases
6. Import `superflow.json` into SuperFlow, or rebuild the 3-node flow manually
7. Run the questions in `Eval_Queries.txt`, log results, score with `Hybrid_Scoring.js`

## Honest limitations (see `product_documentation.txt` for full detail)

- Lyzr does not expose configurable chunking (size/overlap/strategy) at the Knowledge Base level — confirmed across four separate points in the product
- No dedicated reranker toggle was found
- No document-ingestion API endpoint was found (only retrieval/GET); semantic chunks were uploaded manually through the Studio UI, five files at a time
- Only 1 of the 15 evaluation questions was run to full completion against both Knowledge Bases during this build; the remaining 14 are provided as the intended full evaluation set

## Architectures considered but not built

- Two separate single-KB agents (stricter A/B isolation) instead of one One Shot agent
- A fully custom LangChain + Pinecone + RAGAS stack instead of native Lyzr
- Automated SuperFlow ingestion (Code + Loop + HTTP Request) — abandoned after confirming no ingestion API exists
- Hybrid dense + sparse (BM25) search — not supported by Lyzr's retrieval modes

## Future work

- Complete the full 15-question evaluation across both Knowledge Bases
- Rebuild as two strictly isolated single-KB agents to remove the One Shot planner as a confounding variable
- Expand the semantic Knowledge Base beyond 5 curated chunks to the full semantic-split corpus
