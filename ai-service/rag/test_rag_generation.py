from rag_service import search_knowledge_base
from rag_generator import generate_answer


# ----------------------------------------
# WORKER QUESTION
# ----------------------------------------

question = "My salary has not been paid for two weeks. What should I do?"


# ----------------------------------------
# RETRIEVE RELEVANT DOCUMENTS
# ----------------------------------------

results = search_knowledge_base(
    question,
    top_k=2
)


# ----------------------------------------
# GENERATE ANSWER
# ----------------------------------------

answer = generate_answer(
    question,
    results
)


# ----------------------------------------
# DISPLAY RESULT
# ----------------------------------------

print("\n================================")
print("WORKER QUESTION")
print("================================")

print(question)


print("\n================================")
print("GENERATED ANSWER")
print("================================")

print(answer)