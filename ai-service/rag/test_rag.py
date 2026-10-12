from rag_service import search_knowledge_base


# ----------------------------------------
# TEST 1: PAYMENT
# ----------------------------------------

query = "My salary has not been paid."

results = search_knowledge_base(
    query,
    top_k=2
)

print("\nQuery:")
print(query)

print("\nRetrieved Documents:")

for result in results:

    print("\n----------------------------")

    print("Document:")
    print(result["document"])

    print("\nContent:")
    print(result["content"])