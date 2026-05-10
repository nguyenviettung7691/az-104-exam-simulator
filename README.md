# AZ-104 Exam Simulator

![UI of web app](image.png)

Browser-based AZ-104 practice app with a strict 53-question exam engine, local question-bank management, and cross-run trend tracking.

## Current Features

- Exactly 53 questions per simulation run
- Fixed domain quotas and question-type quotas
- One linked 5-question case study block per run
- Per-question answer reveal with rationale and reference
- Hint, skip, pause, and timed-run behavior
- Results reporting with cumulative trend analysis across runs
- Question bank import, export, validation, and active/inactive toggling
- Browser storage for bank state, run history, and presentation mode

## Stack

- React 19
- TypeScript
- Vite

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Start the dev server:

```bash
npm run dev
```

3. Build the production bundle:

```bash
npm run build
```

4. Run lint:

```bash
npm run lint
```

5. Run tests:

```bash
npm run test
```

6. Optional quality audit:

```bash
npm run audit:quality
```

## Exam Rules

- Domain quotas: D1=12, D2=9, D3=13, D4=11, D5=8
- Type quotas: MC=28, MR=8, Yes/No=6, Case Study=5, Drag-and-Drop=4, Hot Area=2
- Run generation respects prior run history to avoid repeats when the unseen pool can still satisfy the quotas
- The simulator supports score reporting and cumulative readiness analysis across attempts

## Starter Bank

The bundled starter bank currently includes 375 questions and 7 case studies.
It is aligned to the AZ-104 skills measured on April 17, 2026, and supports 6 consecutive 53-question no-repeat runs before the unseen pool is exhausted.

Use the Question Bank tab to load the bundled bank, export the current bank, or import your own question bank JSON.

The committed runtime artifact is available at [public/data/az104-question-bank.json](public/data/az104-question-bank.json).

## Question Bank JSON Shape

```json
{
  "version": "2026.04.17",
  "updatedAt": "2026-05-08T00:00:00.000Z",
  "questions": [],
  "caseStudies": []
}
```

Question records must include domain, type, difficulty, subtopic, scenario text, stem,
and correct-answer fields according to the question type.

Case-study records must include exactly 5 linked question IDs that point to `case-study` type questions.

## Storage

- Question bank: browser local storage
- Run history: browser local storage
- Preferred presentation mode: browser local storage

## Notes

- Scaled score is an estimated curve for training realism.
- Official Microsoft scoring uses a proprietary scale.
