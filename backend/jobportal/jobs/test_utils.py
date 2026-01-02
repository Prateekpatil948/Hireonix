# jobportal/jobs/test_utils.py

import requests
import json
import re
from django.conf import settings
from .models import JobTest, JobTestQuestion

# ✅ HARD-CODED FREE GROQ API URL
GROOK_API_URL = "https://api.groq.com/openai/v1/chat/completions"

# ✅ API KEY TAKEN FROM SETTINGS (you already load it)
GROOK_API_KEY = getattr(settings, "GROOK_API_KEY", None)


def _generate_fallback_questions(skills_text, count=25):
    """
    Local fallback if Groq API fails or key is missing.
    Returns list of dicts:
    {
      "question": str,
      "options": [str, str, str, str],
      "correct_option": 0-3
    }
    """
    # Basic skill extraction
    skills = [
        s.strip()
        for s in re.split(r"[,\n/;]", skills_text or "")
        if s.strip()
    ]
    if not skills:
        skills = ["Programming"]

    templates = [
        lambda skill: {
            "question": f"Which of the following BEST describes a core concept of {skill}?",
            "options": [
                f"{skill} fundamentals",
                "Planning office parties",
                "Company picnic organization",
                "Office seating arrangements",
            ],
            "correct_option": 0,
        },
        lambda skill: {
            "question": f"In a real-world project, where would {skill} MOST commonly be applied?",
            "options": [
                f"Building or improving software using {skill}",
                "Decorating meeting rooms",
                "Managing cafeteria menu",
                "Organizing team tours",
            ],
            "correct_option": 0,
        },
        lambda skill: {
            "question": f"Which activity is LEAST related to {skill}?",
            "options": [
                "Using algorithms and data structures",
                "Writing and testing code",
                f"Applying {skill} in a project",
                "Planning birthday celebrations",
            ],
            "correct_option": 3,
        },
        lambda skill: {
            "question": f"Which of these tasks would MOST LIKELY require strong {skill} knowledge?",
            "options": [
                f"Developing a feature using {skill}",
                "Arranging office plants",
                "Designing company logo on a whiteboard",
                "Printing ID cards",
            ],
            "correct_option": 0,
        },
    ]

    questions = []
    for i in range(count):
        skill = skills[i % len(skills)]
        template = templates[i % len(templates)]
        questions.append(template(skill))

    return questions


def create_test_for_application(application):
    """
    1. Tries Groq API (llama-3.1-8b-instant) to generate 25 MCQs
    2. If anything fails, falls back to local simple questions
    3. Creates JobTest + JobTestQuestion entries
    """
    job = application.job
    skills_text = getattr(job, "skills", "") or ""

    questions_data = None

    # =========================
    # 1) Try Groq API if key set
    # =========================
    if GROOK_API_KEY:
        prompt = f"""
            You are an expert technical assessment generator.

            Generate exactly 25 UNIQUE, NON-REPEATING, intermediate-to-advanced MCQs based strictly on the following job skills:
            {skills_text}

            HARD RULES (MUST FOLLOW ALL):
            1. Every question MUST be completely unique — no reused patterns, no similar phrasing, no duplicated logic.
            2. Questions MUST test practical, real-world problem-solving based on the given skills.
            3. Include scenario-based questions, debugging questions, best practices, performance issues, and short code/config snippets.
            4. Avoid basic theory or definition-based questions.
            5. Difficulty mix: ~60% intermediate, ~40% slightly advanced.
            6. Each question MUST have exactly 4 answer options.
            7. Only one correct answer per question.
            8. Correct answer MUST be provided as a numeric index (0–3) of the options array.
            9. DO NOT repeat ANY question structure, idea, or code snippet.
            10. DO NOT generate fewer than 25 questions.

            OUTPUT FORMAT (STRICT — NO EXTRA TEXT):
            Return ONLY this JSON structure:

            {{
            "questions": [
                {{
                "question": "question text here",
                "options": ["A", "B", "C", "D"],
                "correct_option": 0
                }}
            ]
            }}

            ABSOLUTE REQUIREMENTS:
            - Exactly 25 objects inside the "questions" array.
            - Each "options" array MUST contain exactly 4 items.
            - "correct_option" MUST be an integer (0, 1, 2, or 3).
            - JSON MUST be valid and directly parsable with Python json.loads.

            If you cannot follow ANY rule, regenerate until all rules are satisfied.
            """


        headers = {
            "Authorization": f"Bearer {GROOK_API_KEY}",
            "Content-Type": "application/json",
        }

        body = {
            "model": "llama-3.1-8b-instant",  # FREE GROQ MODEL
            "messages": [
                {
                    "role": "system",
                    "content": "You generate only valid JSON when requested, with no additional commentary.",
                },
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.7,
        }

        try:
            resp = requests.post(GROOK_API_URL, json=body, headers=headers, timeout=25)
            resp.raise_for_status()

            ai_response = resp.json()
            content = ai_response["choices"][0]["message"]["content"]

            # Try to extract JSON even if there is some extra text (safety)
            content = content.strip()
            # If content has leading/trailing text, try to isolate JSON block
            if not content.startswith("{"):
                first_brace = content.find("{")
                last_brace = content.rfind("}")
                if first_brace != -1 and last_brace != -1:
                    content = content[first_brace : last_brace + 1]

            data = json.loads(content)
            questions_data = data.get("questions", [])[:25]
        except Exception as e:
            print("Groq API Error:", str(e))
            questions_data = None

    # ===================================
    # 2) Fallback to local questions if needed
    # ===================================
    if not questions_data:
        print("Using fallback questions instead of Groq.")
        questions_data = _generate_fallback_questions(skills_text, count=25)

    if not questions_data:
        print("No questions generated at all.")
        return None

    # =======================
    # 3) Create Test & Questions
    # =======================
    # If a test already exists for this application, delete and recreate
    existing = getattr(application, "test", None)
    if existing:
        existing.questions.all().delete()
        existing.delete()

    test = JobTest.objects.create(
        application=application,
        total_marks=len(questions_data) * 2,
    )

    correct_map = {0: "A", 1: "B", 2: "C", 3: "D"}

    for q in questions_data:
        opts = q.get("options", [])
        if len(opts) != 4:
            continue

        JobTestQuestion.objects.create(
            test=test,
            text=q.get("question", "No question"),
            option_a=opts[0],
            option_b=opts[1],
            option_c=opts[2],
            option_d=opts[3],
            correct_option=correct_map.get(q.get("correct_option", 0), "A"),
        )

    return test
