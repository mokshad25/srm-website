"""POST the seed questions to a running API and print each status.

Usage: python scripts/eval_questions.py [limit]
Each question gets its own session, so earlier answers don't influence later
ones. Set EVAL_PAUSE (seconds) to stay under a provider's token limit; Groq's
free tier needs about 30. A 503 is retried once after a longer wait.
"""
import json
import os
import sys
import time
from collections import Counter
from pathlib import Path

import requests

API_BASE = os.environ.get("API_BASE", "http://127.0.0.1:8000")
DATASET = Path(__file__).resolve().parent.parent / "tests" / "question_dataset.json"
PAUSE_SECONDS = float(os.environ.get("EVAL_PAUSE", "2.5"))
RETRY_WAIT_SECONDS = 60


def ask(question: str) -> requests.Response:
    return requests.post(
        f"{API_BASE}/api/chat",
        json={"question": question, "campus": "Kattankulathur"},
        timeout=90,
    )


def main() -> None:
    questions = json.loads(DATASET.read_text(encoding="utf-8"))
    if len(sys.argv) > 1:
        questions = questions[: int(sys.argv[1])]
    counts: Counter[str] = Counter()
    for item in questions:
        response = ask(item["question"])
        if response.status_code == 503:
            time.sleep(RETRY_WAIT_SECONDS)
            response = ask(item["question"])
        if response.ok:
            body = response.json()
            status, sources = body["status"], len(body["sources"])
        else:
            status, sources = f"http_{response.status_code}", 0
        counts[status] += 1
        print(f"{status:<22}{sources:>2} sources  {item['question']}", flush=True)
        time.sleep(PAUSE_SECONDS)
    print()
    print(dict(counts))


if __name__ == "__main__":
    main()
