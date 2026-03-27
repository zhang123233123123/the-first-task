from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()

client = OpenAI(
    api_key=os.getenv("DEEPSEEK_API_KEY"),
    base_url="https://api.deepseek.com"
)

STORY_CUE_WORDS = [
    ["mirror", "clocktower", "stranger"],
    ["fog", "lantern", "letter"],
    ["garden", "silence", "key"],
]

METAPHOR_PROMPTS = [
    "Time is a ______ because ______.",
    "Memory is a ______ because ______.",
    "Creativity is a ______ because ______.",
]


def get_story_suggestions(cue_words: list[str], include_provocateur: bool) -> list[dict]:
    """Generate 3 AI story suggestions, optionally with provocateur cards."""
    system_prompt = (
        "You are a creative writing assistant helping with a research experiment. "
        "Generate creative, original story directions — not full stories, just compelling premises or directions. "
        "Keep each suggestion under 60 words. Be specific and imaginative."
    )

    user_prompt = (
        f"Generate 3 distinct creative story directions using these three words: {', '.join(cue_words)}.\n"
        "Each direction should be a short premise (2-3 sentences) that a writer could develop.\n"
        "Format as JSON array: [{\"id\": 1, \"suggestion\": \"...\"}]"
    )

    response = client.chat.completions.create(
        model="deepseek-chat",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        response_format={"type": "json_object"},
        temperature=0.9,
    )

    import json
    data = json.loads(response.choices[0].message.content)
    suggestions = data.get("suggestions", data.get("directions", []))

    if include_provocateur:
        suggestions = _add_provocateur_cards(suggestions, "story")

    return suggestions


def get_metaphor_suggestions(prompt: str, include_provocateur: bool) -> list[dict]:
    """Generate 3 AI metaphor directions, optionally with provocateur cards."""
    system_prompt = (
        "You are a creative writing assistant helping with a research experiment. "
        "Generate creative, surprising metaphor directions — not full answers, just conceptual directions. "
        "Avoid clichés. Aim for semantic distance and originality."
    )

    user_prompt = (
        f"For this metaphor prompt: \"{prompt}\"\n"
        "Generate 3 distinct creative directions — each a brief conceptual angle (1-2 sentences) "
        "a writer could develop into a complete metaphor.\n"
        "Format as JSON: {\"suggestions\": [{\"id\": 1, \"suggestion\": \"...\"}]}"
    )

    response = client.chat.completions.create(
        model="deepseek-chat",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        response_format={"type": "json_object"},
        temperature=0.9,
    )

    import json
    data = json.loads(response.choices[0].message.content)
    suggestions = data.get("suggestions", [])

    if include_provocateur:
        suggestions = _add_provocateur_cards(suggestions, "metaphor")

    return suggestions


def _add_provocateur_cards(suggestions: list[dict], task_type: str) -> list[dict]:
    """Attach a provocateur challenge card to each suggestion."""
    system_prompt = (
        "You are a creative critic in a research experiment. "
        "For each idea, write a short provocation card that challenges assumptions and opens new directions. "
        "Be constructive, specific, and intellectually stimulating — not insulting."
    )

    suggestions_text = "\n".join(
        [f"{i+1}. {s.get('suggestion', '')}" for i, s in enumerate(suggestions)]
    )

    user_prompt = (
        f"For each of these {task_type} ideas, write a provocation card with exactly three parts:\n"
        "- Risk: one sentence identifying a cliché, weak assumption, or limitation\n"
        "- Alternative: one sentence proposing a substantially different direction\n"
        "- Question: one question pushing deeper rethinking\n\n"
        f"Ideas:\n{suggestions_text}\n\n"
        "Format as JSON: {\"provocations\": [{\"id\": 1, \"risk\": \"...\", \"alternative\": \"...\", \"question\": \"...\"}]}"
    )

    response = client.chat.completions.create(
        model="deepseek-chat",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        response_format={"type": "json_object"},
        temperature=0.7,
    )

    import json
    data = json.loads(response.choices[0].message.content)
    provocations = {p["id"]: p for p in data.get("provocations", [])}

    for s in suggestions:
        sid = s.get("id")
        if sid in provocations:
            s["provocateur"] = provocations[sid]

    return suggestions
