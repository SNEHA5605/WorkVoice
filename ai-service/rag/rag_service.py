import os
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer


# ----------------------------------------
# PATHS
# ----------------------------------------

BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

KNOWLEDGE_BASE_DIR = os.path.join(
    BASE_DIR,
    "knowledge_base"
)


# ----------------------------------------
# LOAD EMBEDDING MODEL
# ----------------------------------------

model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)


# ----------------------------------------
# LOAD KNOWLEDGE BASE
# ----------------------------------------

documents = []
document_names = []


for filename in os.listdir(KNOWLEDGE_BASE_DIR):

    if filename.endswith(".txt"):

        file_path = os.path.join(
            KNOWLEDGE_BASE_DIR,
            filename
        )

        with open(
            file_path,
            "r",
            encoding="utf-8"
        ) as file:

            content = file.read()

            documents.append(content)
            document_names.append(filename)


# ----------------------------------------
# CREATE EMBEDDINGS
# ----------------------------------------

document_embeddings = model.encode(
    documents
)

document_embeddings = np.array(
    document_embeddings
).astype("float32")


# ----------------------------------------
# CREATE FAISS INDEX
# ----------------------------------------

dimension = document_embeddings.shape[1]

index = faiss.IndexFlatL2(
    dimension
)

index.add(
    document_embeddings
)


# ----------------------------------------
# SEARCH KNOWLEDGE BASE
# ----------------------------------------

def search_knowledge_base(
    query,
    top_k=2
):

    query_embedding = model.encode(
        [query]
    )

    query_embedding = np.array(
        query_embedding
    ).astype("float32")


    distances, indices = index.search(
        query_embedding,
        top_k
    )


    results = []

    for i in indices[0]:

        if i < len(documents):

            results.append({
                "document":
                    document_names[i],

                "content":
                    documents[i]
            })


    return results