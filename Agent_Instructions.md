# Agent Instructions

## Agent: Financial Analyst Assistant
**Agent ID:** `6a7bfa3eb51f4c3b28f96c13`
**Model:** gpt-4o (OpenAI, via Lyzr)
**Retrieval type:** One Shot (planner LLM selects which attached Knowledge Base(s) to draw from per query)
**Knowledge Bases attached:** `apple_10k_fixed`, `apple_semantic`

---

## Role
```
Financial analyst assistant
```

## Goal
```
Answer questions about Apple's financial performance using only the
retrieved 10-K filing context.
```

## Instructions
```
You are a financial analyst assistant. Answer the question using ONLY
the context provided from the knowledge base.

If the context does not contain enough information to answer, say
"I don't have enough context to answer this."

Always cite specific numbers and figures when available.
```

---

## Design notes

- **Grounding constraint**: the agent is explicitly instructed to answer only from retrieved context, not prior model knowledge — this is what the Faithfulness-style evaluation in this project depends on. If the agent answered from memory instead of retrieval, the fixed-vs-semantic chunking comparison would be meaningless (both would "work" regardless of what was actually retrievable).
- **One Shot over Basic**: a planner model decides which of the two attached Knowledge Bases to query per question, rather than requiring two separate single-KB agents. This was chosen for build simplicity under time constraints — see `Readme.md` for the honest tradeoff this creates versus a strict single-KB A/B test.
- **Max iterations**: 25 (Lyzr default) — not tuned for this project, since each query only requires a single retrieval + generation pass, not multi-step tool use.
- **Temperature**: 0.7 (Lyzr default on this agent). A stricter deployment would likely lower this toward 0 for more deterministic, repeatable financial figure lookups — noted as a possible follow-up in Future Work.
