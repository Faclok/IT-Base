import json
import random
import sqlite3
from pathlib import Path


DB_PATH = Path(__file__).resolve().parent / "itbase.sqlite3"
random.seed(42)

first_names = [
    "Alex",
    "Maksim",
    "Ivan",
    "Nikita",
    "Artem",
    "Denis",
    "Kirill",
    "Egor",
    "Dmitry",
    "Roman",
    "Pavel",
    "Andrey",
    "Elena",
    "Olga",
    "Anna",
    "Maria",
    "Sofia",
    "Irina",
    "Daria",
    "Alina",
]
last_names = [
    "Petrov",
    "Sidorov",
    "Ivanov",
    "Smirnov",
    "Kuznetsov",
    "Lebedev",
    "Morozov",
    "Volkov",
    "Orlov",
    "Nikolaev",
]
grades = ["Junior", "Middle", "Senior", "Lead"]

roles = [
    "Frontend Developer",
    "Backend Developer",
    "Fullstack Developer",
    "DevOps Engineer",
    "QA Automation Engineer",
    "Data Engineer",
    "Mobile Developer",
]
stacks = [
    ("React, TypeScript, Next.js", ["React", "TypeScript", "Redux", "Tailwind", "SSR"]),
    ("Python, FastAPI, PostgreSQL", ["Python", "FastAPI", "SQL", "Docker", "Redis"]),
    ("Node.js, NestJS, MongoDB", ["Node.js", "NestJS", "MongoDB", "RabbitMQ", "CI/CD"]),
    ("Java, Spring Boot, Kafka", ["Java", "Spring", "Kafka", "PostgreSQL", "Microservices"]),
    ("Go, PostgreSQL, Kubernetes", ["Go", "gRPC", "Kubernetes", "Helm", "Prometheus"]),
    ("React Native, Expo, Firebase", ["React Native", "Expo", "Firebase", "Mobile UI", "Push"]),
    ("Playwright, Python, Allure", ["Playwright", "Pytest", "API Testing", "CI", "Allure"]),
]
exp_templates = [
    "{years} years of commercial experience. Built high-load features and improved performance.",
    "{years} years in product teams. Focused on architecture, quality and delivery speed.",
    "{years} years in outsourcing and startup projects. Strong communication and ownership.",
]


def make_people(count: int = 40) -> list[dict]:
    out = []
    for i in range(count):
        first = random.choice(first_names)
        last = random.choice(last_names)
        role = random.choice(roles)
        stack_text, skill_set = random.choice(stacks)
        grade = random.choices(grades, weights=[20, 40, 30, 10], k=1)[0]
        years = random.randint(1, 10)
        exp = random.choice(exp_templates).format(years=years)
        out.append(
            {
                "name": f"{first} {last}",
                "title": role,
                "stack": stack_text,
                "skills_json": json.dumps(random.sample(skill_set, k=min(5, len(skill_set))), ensure_ascii=False),
                "experience": exp,
                "grade": grade,
                "contact_email": f"{first.lower()}.{last.lower()}{i}@example.com",
                "contact_telegram": f"@{first.lower()}{last.lower()}{i}",
            }
        )
    return out


def seed() -> None:
    if not DB_PATH.exists():
        raise SystemExit(f"DB file not found: {DB_PATH}")
    rows = make_people(45)
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.executemany(
        """
        insert into developers(name, title, stack, skills_json, experience, grade, contact_email, contact_telegram)
        values(:name, :title, :stack, :skills_json, :experience, :grade, :contact_email, :contact_telegram)
        """,
        rows,
    )
    conn.commit()
    conn.close()
    print(f"Seed completed: inserted {len(rows)} developers into {DB_PATH}")


if __name__ == "__main__":
    seed()
