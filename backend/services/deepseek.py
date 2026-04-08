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
    """Generate 1 AI story suggestion (one sentence)."""
    system_prompt = (
        "You are a creative writing assistant helping with a research experiment. "
        "Generate one creative, original story direction — not a full story, just a compelling one-sentence premise. "
        "Be specific and imaginative."
    )

    user_prompt = (
        f"Generate exactly one creative story direction using these three words: {', '.join(cue_words)}.\n"
        "Write a single sentence that sparks a direction a writer could develop.\n"
        "Return a JSON object: {\"suggestions\": [{\"id\": 1, \"suggestion\": \"...\"}]}"
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
    """Generate 1 AI metaphor direction (one sentence)."""
    system_prompt = (
        "You are a creative writing assistant helping with a research experiment. "
        "Generate one creative, surprising metaphor direction — a single sentence conceptual angle. "
        "Avoid clichés. Aim for semantic distance and originality."
    )

    user_prompt = (
        f"For this metaphor prompt: \"{prompt}\"\n"
        "Generate exactly one creative direction — a single sentence conceptual angle "
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


def get_followup_provocation(task_type: str, user_reply: str, original_question: str) -> dict:
    """Generate a follow-up provocation card based on the user's reply."""
    system_prompt = (
        "You are a creative critic in a research experiment. "
        "You previously challenged a participant with a provocation question. They have replied. "
        "Generate a new provocation card that builds on their reply and pushes their thinking further. "
        "Be constructive, specific, and intellectually stimulating."
    )

    user_prompt = (
        f"This participant is working on a {task_type} task.\n"
        f"Your previous question was: {original_question}\n"
        f"Their reply: {user_reply}\n\n"
        "Write a follow-up provocateur card with exactly three parts:\n"
        "- Risk: one sentence identifying a new assumption or limitation in their reply\n"
        "- Alternative: one sentence proposing a direction they haven't yet considered\n"
        "- Question: one deeper follow-up question that builds on what they said\n\n"
        "Format as JSON: {\"risk\": \"...\", \"alternative\": \"...\", \"question\": \"...\"}"
    )

    response = client.chat.completions.create(
        model="deepseek-chat",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        response_format={"type": "json_object"},
        temperature=0.8,
    )

    import json
    data = json.loads(response.choices[0].message.content)
    return {
        "risk": data.get("risk", ""),
        "alternative": data.get("alternative", ""),
        "question": data.get("question", ""),
    }


def get_basic_ai_followup(task_type: str, user_message: str, task_context: str) -> str:
    """Generate a helpful, supportive follow-up for basic_ai / friction conditions."""
    system_prompt = (
        "You are a helpful creative writing assistant in a research experiment. "
        "Respond concisely and supportively to the participant's message. "
        "Help them develop their creative idea — offer a brief suggestion or encouragement. "
        "Keep your response under 80 words."
    )
    user_prompt = (
        f"The participant is working on a {task_type} creative writing task.\n"
        f"Task context: {task_context}\n\n"
        f"Their message: {user_message}\n\n"
        "Give a short, helpful response with a creative suggestion they can use."
    )
    response = client.chat.completions.create(
        model="deepseek-chat",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.8,
    )
    return response.choices[0].message.content.strip()


def get_friction_card_options(task_type: str, user_text: str, suggestions: list[dict]) -> dict:
    """Generate personalized weakness and strategy options based on the user's current writing."""
    system_prompt = (
        "You are a creative writing coach in a research experiment. "
        "A participant has started writing a creative task and needs a brief reflective pause. "
        "Generate short, specific options that relate directly to what they have written so far."
    )

    suggestions_text = "\n".join(
        [f"{i+1}. {s.get('suggestion', '')}" for i, s in enumerate(suggestions)]
    ) or "None"

    user_prompt = (
        f"Task type: {task_type}\n"
        f"AI suggestions shown to participant:\n{suggestions_text}\n\n"
        f"What the participant has written so far:\n\"{user_text}\"\n\n"
        "Generate exactly 5 weakness options and 5 strategy options that are specific to this writing.\n"
        "Weakness options should name concrete problems visible in what they wrote (e.g. 'Relies on the most obvious metaphor', 'The conflict feels unresolved').\n"
        "Strategy options should name concrete next moves (e.g. 'Introduce an unexpected character', 'Flip the emotional register').\n"
        "Always include 'Other' as the last option in each list.\n\n"
        "Format as JSON: {\"weakness_options\": [\"...\", \"...\", \"...\", \"...\", \"Other\"], \"strategy_options\": [\"...\", \"...\", \"...\", \"...\", \"Other\"]}"
    )

    response = client.chat.completions.create(
        model="deepseek-chat",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        response_format={"type": "json_object"},
        temperature=0.8,
    )

    import json
    data = json.loads(response.choices[0].message.content)
    weakness = data.get("weakness_options", [])
    strategy = data.get("strategy_options", [])
    # Ensure "Other" is always present as last item
    if weakness and weakness[-1] != "Other":
        weakness.append("Other")
    if strategy and strategy[-1] != "Other":
        strategy.append("Other")
    return {"weakness_options": weakness, "strategy_options": strategy}


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
