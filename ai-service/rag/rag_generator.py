from transformers import (
    AutoTokenizer,
    AutoModelForSeq2SeqLM
)


# ==========================================
# LOCAL AI MODEL
# ==========================================

MODEL_NAME = "google/flan-t5-base"

print("Loading local AI model...")

tokenizer = AutoTokenizer.from_pretrained(
    MODEL_NAME
)

model = AutoModelForSeq2SeqLM.from_pretrained(
    MODEL_NAME
)

print("Local AI model loaded successfully.")


# ==========================================
# FIND MOST RELEVANT DOCUMENT
# ==========================================

def select_relevant_document(
    question,
    retrieved_documents
):

    question = question.lower()

    # Payment-related question
    if any(
        word in question
        for word in [
            "salary",
            "wage",
            "payment",
            "paid",
            "money",
            "pay"
        ]
    ):

        for document in retrieved_documents:

            if "payment" in document["document"].lower():
                return document


    # Safety-related question
    if any(
        word in question
        for word in [
            "safety",
            "helmet",
            "equipment",
            "accident",
            "danger",
            "unsafe"
        ]
    ):

        for document in retrieved_documents:

            if "safety" in document["document"].lower():
                return document


    # Leave-related question
    if any(
        word in question
        for word in [
            "leave",
            "holiday",
            "day off",
            "absence"
        ]
    ):

        for document in retrieved_documents:

            if "leave" in document["document"].lower():
                return document


    # Medical-related question
    if any(
        word in question
        for word in [
            "medical",
            "doctor",
            "injury",
            "sick",
            "health"
        ]
    ):

        for document in retrieved_documents:

            if "medical" in document["document"].lower():
                return document


    # Otherwise use first retrieved document
    if retrieved_documents:
        return retrieved_documents[0]

    return None


# ==========================================
# CHECK WHETHER ANSWER IS BAD
# ==========================================

def is_bad_answer(answer):

    if not answer:
        return True

    answer_lower = answer.strip().lower()

    # Too short
    if len(answer_lower) < 25:
        return True

    # Model accidentally returned only a status
    bad_status_words = [
        "submitted",
        "assigned",
        "in_progress",
        "resolved",
        "overdue"
    ]

    # Prompt-instruction leakage
    bad_phrases = [
        "if the policy does not contain enough information",
        "tell the worker to contact",
        "do not invent laws",
        "do not mention the ai model",
        "do not repeat the question",
        "helpful answer:",
        "worker question:"
    ]

    # Reject if the response contains prompt instructions
    for phrase in bad_phrases:

        if phrase in answer_lower:
            return True

    # Reject if several workflow statuses appear
    status_count = 0

    for status in bad_status_words:

        if status in answer_lower:
            status_count += 1

    if status_count >= 2:
        return True

    # Reject the model name / garbage output
    if answer_lower in [
        "workvoice",
        "workvoice ai"
    ]:
        return True

    return False

# ==========================================
# GENERATE ANSWER
# ==========================================

def generate_answer(
    question,
    retrieved_documents
):

    # --------------------------------------
    # Select relevant document
    # --------------------------------------

    relevant_document = select_relevant_document(
        question,
        retrieved_documents
    )


    if not relevant_document:

        return (
            "I could not find enough information "
            "to answer your question. Please "
            "contact your owner or supervisor."
        )


    # --------------------------------------
    # Get relevant policy
    # --------------------------------------

    document_name = (
        relevant_document["document"]
    )

    context = (
        relevant_document["content"]
    )


    # --------------------------------------
    # Limit context
    # --------------------------------------

    context = context[:3500]


    # --------------------------------------
    # Controlled prompt
    # --------------------------------------

    prompt = f"""
You are a workplace support assistant.

Answer the worker's question using ONLY
the policy information below.

Give a short and practical answer.

Do NOT list policy status values.

Do NOT output words such as:
SUBMITTED, ASSIGNED, IN_PROGRESS,
RESOLVED or OVERDUE unless they are
directly necessary to answer the question.

Do NOT invent laws or legal rights.

Do NOT mention the AI model.

Do NOT repeat the question.

If the policy does not contain enough
information, tell the worker to contact
their owner or supervisor.

Policy:
{context}

Worker question:
{question}

Helpful answer:
"""


    # --------------------------------------
    # Tokenize
    # --------------------------------------

    inputs = tokenizer(
        prompt,
        return_tensors="pt",
        truncation=True,
        max_length=512
    )


    # --------------------------------------
    # Generate
    # --------------------------------------

    outputs = model.generate(
        **inputs,
        max_new_tokens=100,
        min_new_tokens=15,
        num_beams=5,
        do_sample=False,
        no_repeat_ngram_size=3,
        early_stopping=True
    )


    # --------------------------------------
    # Decode
    # --------------------------------------

    answer = tokenizer.decode(
        outputs[0],
        skip_special_tokens=True
    ).strip()


    # --------------------------------------
    # Validate answer
    # --------------------------------------

    if is_bad_answer(answer):

        # Safe fallback based on policy type

        if "payment" in document_name.lower():

            answer = (
                "If your salary has not been paid, "
                "contact your owner or supervisor "
                "and ask about the payment status. "
                "If the issue is not resolved, "
                "raise a complaint through WorkVoice "
                "so the issue can be tracked."
            )

        elif "safety" in document_name.lower():

            answer = (
                "If the required safety equipment "
                "is not available, inform your "
                "owner or supervisor immediately "
                "and raise a complaint through "
                "WorkVoice so the issue can be tracked."
            )

        elif "leave" in document_name.lower():

            answer = (
                "Submit your leave request through "
                "the available workplace process "
                "and inform your owner or supervisor."
            )

        elif "medical" in document_name.lower():

            answer = (
                "For a medical issue, inform your "
                "owner or supervisor and seek the "
                "appropriate medical assistance."
            )

        else:

            answer = (
                "Please contact your owner or "
                "supervisor regarding this issue. "
                "You can also raise a complaint "
                "through WorkVoice so the issue "
                "can be tracked."
            )


    return answer