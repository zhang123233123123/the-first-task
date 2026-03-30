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


def get_story_suggestions(cue_words: list[str]) -> list[dict]:
    """Generate 3 AI story suggestions."""
    system_prompt = (
        "You are a creative writing assistant helping with a research experiment. "
        "Generate creative, original story directions — not full stories, just compelling premises or directions. "
        "Keep each suggestion under 60 words. Be specific and imaginative."
    )

    user_prompt = (
        f"Generate 3 distinct creative story directions using these three words: {', '.join(cue_words)}.\n"
        "Each direction should be a short premise (2-3 sentences) that a writer could develop.\n"
        "Return a JSON object: {\"suggestions\": [{\"id\": 1, \"suggestion\": \"...\"}, ...]}"
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
    return _extract_list(data)


def get_metaphor_suggestions(prompt: str) -> list[dict]:
    """Generate 3 AI metaphor directions."""
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
    return _extract_list(data)


def get_general_provocation(task_type: str, prompt_text: str, suggestions: list[dict]) -> dict:
    """Generate one task-level provocateur card rather than suggestion-specific cards."""
    system_prompt = (
        "You are a creative critic in a research experiment. "
        "Write one short provocation card that challenges assumptions and opens new directions. "
        "Be constructive, specific, and intellectually stimulating — not insulting."
    )

    suggestions_text = "\n".join(
        [f"{i+1}. {s.get('suggestion', '')}" for i, s in enumerate(suggestions)]
    )

    user_prompt = (
        f"This participant is working on a {task_type} task.\n"
        f"Prompt: {prompt_text}\n\n"
        f"Here are the AI directions they can see:\n{suggestions_text}\n\n"
        "Write one provocateur card for the task as a whole with exactly three parts:\n"
        "- Risk: one sentence identifying a cliché, weak assumption, or limitation\n"
        "- Alternative: one sentence proposing a substantially different direction\n"
        "- Question: one question pushing deeper rethinking\n\n"
        "Format as JSON: {\"risk\": \"...\", \"alternative\": \"...\", \"question\": \"...\"}"
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
    return {
        "risk": data.get("risk", ""),
        "alternative": data.get("alternative", ""),
        "question": data.get("question", ""),
    }


def _extract_list(data) -> list:
    """Robustly extract a list from whatever JSON DeepSeek returns."""
    if isinstance(data, list):
        return data
    if isinstance(data, dict):
        # Try common keys first
        for key in ("suggestions", "directions", "items", "results", "metaphors"):
            if key in data and isinstance(data[key], list):
                return data[key]
        # Fall back to first list value found
        for v in data.values():
            if isinstance(v, list):
                return v
    return []
