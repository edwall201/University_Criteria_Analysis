from fastapi import FastAPI
from pydantic import BaseModel
from leetcode_grader import grade_answer

app = FastAPI()

class GradeRequest(BaseModel):
    question: str
    answer: str

@app.post("/api/grade")
def grade_code(req: GradeRequest):
    result = grade_answer(req.question, req.answer)
    return result
