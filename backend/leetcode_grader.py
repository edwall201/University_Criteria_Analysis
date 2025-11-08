from typing import Any, Dict, cast
import os
import json
from openai import OpenAI

MODEL = "gpt-4o-mini"

API_KEY = os.environ.get("OPEN_API_KEY")

client = OpenAI(api_key = API_KEY)
    
GRADE_SCHEMA: Dict[str, Any] = {
    "type": "json_schema",
    "json_schame": {
        "name": "LeetCodeGrading",
        "schema": {
            "type": "object",
            "additionalProperties": False,
            "properties": {
                "Logic": {"type": "number", "minimum": 0, "maximum": 10},
                "Efficiency": {"type": "number", "minimum": 0, "maximum": 10},
                "Readability": {"type": "number", "minimum": 0, "maximum": 10}
            },
            "required": ["Logic", "Efficiency", "Readability"]
        },
        "strict": True
    }
}

SYSTEM_PROMPT = (
    "You are a strict coding interviewer."
    "Given a LeetCode-style problem and a candidate's solution, "
    "return ONLY a JSON object that conforms exactly to the provided schema."
)

USER_PROMPT_TEMPLATE = """Leetcode Question:
{question}

Candidate Answer (verbatim):
{answer}

Grade the answer on these criteria (0-10, where 10 is the best):
- Logic: correctness, edge cases, and whether it actually solves the problem
- Efficiency: time/space complexity relative to the optimal approach
- Readability: clarity, code quality, code organization, naming, comments
"""

def grade_answer(ques: str, ans: str) -> Dict[str, float]:
    user_prompt = USER_PROMPT_TEMPLATE.format(question = ques, answer = ans)

    resp = client.chat.completions.create(
        model = MODEL,
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        response_format = cast(Any, GRADE_SCHEMA),
        temperature = 0.2,
    )

    content = resp.choices[0].message.content
    if content is None:
        raise RuntimeError("Empty content returned.")
    return json.loads(content)

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--question", required = True, help = "The LeetCode prompt text")
    parser.add_argument("--answer", required = True, help="Your solution (code or explanation)")
    args = parser.parse_args()

    result = grade_answer(args.question, args.answer)
    print(json.dumps(result, indent = 2))
