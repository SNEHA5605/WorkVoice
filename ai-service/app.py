from flask import Flask, request, jsonify
from flask_cors import CORS

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

from rag.rag_service import search_knowledge_base
from rag.rag_generator import generate_answer


app = Flask(__name__)
CORS(app)


# ============================================================
# AI COMPLAINT CLASSIFICATION
# ============================================================

# ------------------------------------------------------------
# CATEGORY TRAINING DATA
# ------------------------------------------------------------

complaints = [

    # Safety
    "safety equipment is not available",
    "no helmet at the worksite",
    "worker is working without safety gear",
    "unsafe working conditions",
    "there is a dangerous area at the site",

    # Payment
    "salary has not been paid",
    "payment is delayed",
    "my wages are not received",
    "owner has not paid my salary",
    "overtime payment is pending",

    # Equipment
    "machine is not available",
    "tools are missing",
    "equipment is damaged",
    "we do not have required tools",
    "construction machine is not working",

    # Leave
    "I need leave",
    "I want to take leave",
    "my leave request is pending",
    "I need personal leave",
    "I need emergency leave",

    # Medical
    "I am injured at work",
    "I need medical help",
    "I got injured at the workplace",
    "I am feeling sick",
    "there is a medical emergency",

    # Accommodation
    "there is no accommodation",
    "worker accommodation is poor",
    "we do not have proper housing",
    "water is not available at accommodation",
    "living conditions are poor",

    # Working Hours
    "working hours are too long",
    "we are forced to work overtime",
    "working time is excessive",
    "we are working for too many hours",
    "working hours are not reasonable",

    # Other
    "there is a problem at the workplace",
    "I want to report another issue",
    "I have a general complaint",
    "there is a workplace problem"
]


categories = [

    "Safety",
    "Safety",
    "Safety",
    "Safety",
    "Safety",

    "Payment",
    "Payment",
    "Payment",
    "Payment",
    "Payment",

    "Equipment",
    "Equipment",
    "Equipment",
    "Equipment",
    "Equipment",

    "Leave",
    "Leave",
    "Leave",
    "Leave",
    "Leave",

    "Medical",
    "Medical",
    "Medical",
    "Medical",
    "Medical",

    "Accommodation",
    "Accommodation",
    "Accommodation",
    "Accommodation",
    "Accommodation",

    "Working Hours",
    "Working Hours",
    "Working Hours",
    "Working Hours",
    "Working Hours",

    "Other",
    "Other",
    "Other",
    "Other"
]


# ============================================================
# PRIORITY TRAINING DATA
# ============================================================

priority_complaints = [

    # LOW
    "minor issue at workplace",
    "small workplace problem",
    "non urgent request",
    "simple request",
    "general information request",

    # MEDIUM
    "salary payment is delayed",
    "leave request is pending",
    "tools are slightly damaged",
    "working hours are long",
    "accommodation problem",

    # HIGH
    "salary has not been paid for many weeks",
    "important equipment is missing",
    "unsafe working condition",
    "medical problem at workplace",
    "serious payment issue",

    # CRITICAL
    "worker has suffered a serious injury",
    "life threatening safety issue",
    "major accident at workplace",
    "critical medical emergency",
    "extremely dangerous working condition"
]


priorities = [

    # LOW
    "LOW",
    "LOW",
    "LOW",
    "LOW",
    "LOW",

    # MEDIUM
    "MEDIUM",
    "MEDIUM",
    "MEDIUM",
    "MEDIUM",
    "MEDIUM",

    # HIGH
    "HIGH",
    "HIGH",
    "HIGH",
    "HIGH",
    "HIGH",

    # CRITICAL
    "CRITICAL",
    "CRITICAL",
    "CRITICAL",
    "CRITICAL",
    "CRITICAL"
]


# ============================================================
# TRAIN CATEGORY MODEL
# ============================================================

category_vectorizer = TfidfVectorizer(
    lowercase=True
)

category_features = category_vectorizer.fit_transform(
    complaints
)

category_model = LogisticRegression(
    max_iter=1000
)

category_model.fit(
    category_features,
    categories
)


# ============================================================
# TRAIN PRIORITY MODEL
# ============================================================

priority_vectorizer = TfidfVectorizer(
    lowercase=True
)

priority_features = priority_vectorizer.fit_transform(
    priority_complaints
)

priority_model = LogisticRegression(
    max_iter=1000
)

priority_model.fit(
    priority_features,
    priorities
)


# ============================================================
# HOME
# ============================================================

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "message": "WorkVoice AI Service is running",
        "endpoints": [
            "/predict",
            "/rag/search",
            "/rag/ask"
        ]
    })


# ============================================================
# COMPLAINT PREDICTION
# ============================================================

@app.route(
    "/predict",
    methods=["POST"]
)
def predict():

    data = request.get_json()

    if not data:
        return jsonify({
            "message": "JSON body is required"
        }), 400

    complaint = data.get("complaint")

    if not complaint:

        return jsonify({
            "message": "Complaint text is required"
        }), 400


    # --------------------------------------------------------
    # CATEGORY
    # --------------------------------------------------------

    category_input = (
        category_vectorizer.transform(
            [complaint]
        )
    )

    predicted_category = (
        category_model.predict(
            category_input
        )[0]
    )


    # --------------------------------------------------------
    # PRIORITY
    # --------------------------------------------------------

    priority_input = (
        priority_vectorizer.transform(
            [complaint]
        )
    )

    predicted_priority = (
        priority_model.predict(
            priority_input
        )[0]
    )


    return jsonify({

        "complaint": complaint,

        "category": predicted_category,

        "priority": predicted_priority

    })


# ============================================================
# RAG SEARCH
# ============================================================

@app.route(
    "/rag/search",
    methods=["POST"]
)
def rag_search():

    data = request.get_json()

    if not data:

        return jsonify({
            "message": "JSON body is required"
        }), 400

    query = data.get("query")

    if not query:

        return jsonify({
            "message": "Query is required"
        }), 400


    # --------------------------------------------------------
    # SEARCH KNOWLEDGE BASE
    # --------------------------------------------------------

    results = search_knowledge_base(
        query,
        top_k=2
    )


    return jsonify({

        "query": query,

        "results": results

    })


# ============================================================
# RAG ASK
# ============================================================

@app.route(
    "/rag/ask",
    methods=["POST"]
)
def rag_ask():

    data = request.get_json()

    if not data:

        return jsonify({
            "message": "JSON body is required"
        }), 400

    question = data.get("question")

    if not question:

        return jsonify({
            "message": "Question is required"
        }), 400


    # --------------------------------------------------------
    # STEP 1: RETRIEVE RELEVANT DOCUMENTS
    # --------------------------------------------------------

    results = search_knowledge_base(
        question,
        top_k=2
    )


    # --------------------------------------------------------
    # STEP 2: GENERATE ANSWER
    # --------------------------------------------------------

    answer = generate_answer(
        question,
        results
    )


    # --------------------------------------------------------
    # STEP 3: RETURN RESPONSE
    # --------------------------------------------------------

    return jsonify({

        "question": question,

        "answer": answer,

        "sources": [
            result["document"]
            for result in results
        ]

    })


# ============================================================
# START SERVER
# ============================================================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )