from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import os, traceback
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction import text
from dotenv import load_dotenv

# 🔹 NEW: imports for database + models
import psycopg2
from psycopg2.extras import RealDictCursor, Json
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

# ================================================================
# 🚀 VeiBelle Skincare Recommender API (Weighted TF-IDF Version)
# ================================================================

# Load .env
load_dotenv()
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
DATABASE_URL = os.getenv("DATABASE_URL")

# 🔹 NEW: simple helper to connect to Supabase Postgres
def get_db_connection():
    if not DATABASE_URL:
        raise RuntimeError("DATABASE_URL is not set in environment variables.")
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)


app = FastAPI(title="VeiBelle Skincare Recommender API")

# --- Allow CORS for frontend ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://veibelle-skincare-d4hyg12tt-darlinas-projects.vercel.app",
        "https://veibelleskin.vercel.app",
        "https://veibelleskin-git-main-darlinas-projects.vercel.app",
        "https://veibelleskin-fydjetmhq-darlinas-projects.vercel.app",
        "https://veibelleskin-darlinas-projects.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================================================================
# 📦 Load Datasets
# ================================================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROCESSED = os.path.join(BASE_DIR, "processed")

paths = {
    "products": os.path.join(PROCESSED, "products_clean.csv"),
    "ingredients": os.path.join(PROCESSED, "ingredients_cleaned_preprocessed.csv"),
    "product_ingredients": os.path.join(PROCESSED, "product_ingredients.csv"),
    "product_allergens": os.path.join(PROCESSED, "product_allergens.csv"),
}

try:
    products_df = pd.read_csv(paths["products"])
    ingredients_df = pd.read_csv(paths["ingredients"])
    product_ing = pd.read_csv(paths["product_ingredients"])
    product_allergens = pd.read_csv(paths["product_allergens"])
    print("✅ All datasets loaded successfully.")
except Exception as e:
    print("❌ Failed to load one or more datasets:", e)
    traceback.print_exc()
    products_df = ingredients_df = product_ing = product_allergens = None

# ================================================================
# 🧠 Improved TF-IDF Training (Model C)
# ================================================================
# Category synonyms to strengthen semantic signal
CATEGORY_SYNONYMS = {
    "cleanser": ["cleanser", "face wash", "foam cleanser", "gel cleanser"],
    "toner": ["toner", "lotion", "skin softener"],
    "serum": ["serum", "ampoule", "essence serum"],
    "essence": ["essence", "treatment essence", "treatment lotion"],
    "moisturizer": ["moisturizer", "cream", "gel cream", "lotion"],
    "sunscreen": ["sunscreen", "sunblock", "uv protection", "spf"],
}

def expand_category_words(label: str) -> str:
    if not label:
        return ""
    label_lower = label.lower()
    base = [label_lower]
    extra = []
    for key, syns in CATEGORY_SYNONYMS.items():
        if key in label_lower:
            extra.extend(syns)
    return " ".join(base + extra)

# Domain-specific stopwords (extra noise words in skincare ingredients)
domain_stopwords = {
    "extract", "leaf", "root", "flower", "oil", "water",
    "juice", "powder", "seed", "kernel", "fruit",
}

MY_STOP_WORDS = list(text.ENGLISH_STOP_WORDS.union(domain_stopwords))

if products_df is not None:
    for col in ["ingredients", "Label", "brand", "name"]:
        if col not in products_df.columns:
            products_df[col] = ""

    def build_search_text(row):
        ingredients = str(row.get("ingredients", "")).lower()
        label = str(row.get("Label", "")).lower()
        brand = str(row.get("brand", "")).lower()
        name = str(row.get("name", "")).lower()

        # clean label like "Serum/Essence"
        category_clean = (
            label.replace("/", " ")
                 .replace("-", " ")
                 .replace(",", " ")
        )
        category_expanded = expand_category_words(label)

        parts = [
            (ingredients + " ") * 2,        # ingredients, medium weight
            (category_clean + " ") * 4,     # category words, strong weight
            (category_expanded + " ") * 4,  # synonyms, strong weight
            (label + " ") * 4,              # raw label repeated
            brand,
            name,
        ]
        return " ".join(parts)

    products_df["search_text"] = products_df.apply(build_search_text, axis=1)

    vectorizer = TfidfVectorizer(
        stop_words=MY_STOP_WORDS,
        ngram_range=(1, 2),
        min_df=2,
        max_df=0.85,
        sublinear_tf=True,
        norm="l2",
        lowercase=True,
        smooth_idf=True,
    )
    full_tfidf = vectorizer.fit_transform(products_df["search_text"].fillna(""))

    print("✅ Improved TF-IDF (Model C) search_text created and vectorized successfully.")
else:
    vectorizer, full_tfidf = None, None

# ================================================================
# 🧴 Concern Synonyms
# ================================================================
CONCERN_SYNONYMS = {
    "acne": ["acne", "pimple", "blemish", "breakout", "salicylic acid", "niacinamide"],
    "hydrating": ["hydrating", "moisturiz", "hyaluronic", "glycerin", "ceramide"],
    "dry": ["dry", "dehydrated", "flaky", "ceramide"],
    "wrinkle": ["wrinkle", "fine line", "retinol", "peptide", "anti-aging"],
    "pigmentation": ["pigment", "dark spot", "vitamin c", "niacinamide"],
    "sensitive": ["sensitive", "calm", "soothe", "aloe", "centella"],
    "puffiness": ["puff", "eye bag", "de-puff", "caffeine"],
    "dark circles": ["dark circle", "eye bag"],
    "uv protection": ["spf", "sunscreen", "broad spectrum", "uva", "uvb"],
    "dullness": ["dull", "lack of radiance", "brightening", "radiance"],
}

def expand_concerns(concern_list):
    expanded = []
    for c in concern_list:
        c_lower = c.strip().lower()
        if c_lower in CONCERN_SYNONYMS:
            expanded.extend(CONCERN_SYNONYMS[c_lower])
        else:
            expanded.append(c_lower)
    return " ".join(sorted(set(expanded)))

# ================================================================
# 🔍 Core Recommendation Logic
# ================================================================
SKIN_TYPE_MAPPING = {
    "Dry Skin": "Dry",
    "Oily Skin": "Oily",
    "Normal Skin": "Normal",
    "Combination Skin": "Combination",
    "Sensitive Skin": "Sensitive",
}

def get_recommendations(
    skin_type=None,
    product_type=None,
    concerns=None,
    allergens_list=None,
    pregnancy_safe=None,
    top_n=5,
):
    if products_df is None:
        return []

    df = products_df.copy()

    # --- Skin type filter ---
    if skin_type:
        col_name = SKIN_TYPE_MAPPING.get(skin_type)
        if col_name and col_name in df.columns:
            df = df[df[col_name] == 1]

    # --- Product type filter ---
    if product_type:
        types = [t.strip() for t in product_type.replace("/", ",").split(",")]
        df = df[df["Label"].str.lower().apply(lambda x: any(t.lower() in x for t in types))]

    # --- Allergens filter ---
    if allergens_list and product_allergens is not None:
        allergens_lower = [a.lower() for a in allergens_list]
        bad_products = product_allergens[
            product_allergens["allergen_name"].str.lower().isin(allergens_lower)
        ]["product_id"].unique()
        df = df[~df.index.isin(bad_products)]

    # --- Pregnancy-safe filter ---
    if pregnancy_safe and pregnancy_safe.lower() == "yes" and ingredients_df is not None:
        unsafe_ing = ingredients_df[
            ingredients_df["who_should_avoid"].str.contains("Pregnancy", case=False, na=False)
        ]["name"].str.lower().tolist()
        df = df[~df["ingredients"].fillna("").str.lower().apply(
            lambda x: any(u in x for u in unsafe_ing)
        )]
        print("🍼 Pregnancy-safe filter applied.")

    if df.empty:
        return []

    # --- TF-IDF similarity ---
    subset_indices = df.index.tolist()
    subset_matrix = full_tfidf[subset_indices]

    concern_text = expand_concerns(concerns) if concerns else "hydrating soothing gentle"
    user_vector = vectorizer.transform([concern_text])

    sims = cosine_similarity(user_vector, subset_matrix).flatten()
    df["similarity"] = sims
    df = df.sort_values(by="similarity", ascending=False).head(top_n)

    return df[["Label", "brand", "name", "similarity"]].to_dict(orient="records")

# ================================================================
# 🔹 NEW: Models & Endpoints for Recommendation History
# ================================================================

class SaveHistoryRequest(BaseModel):
    """
    Payload format when frontend saves one recommendation session.
    `quiz_answers` can be any dict (skin type, concerns, etc.).
    `recommendations` is the list returned from get_recommendations().
    """
    email: str
    user_id: Optional[str] = None  # Supabase auth user id (optional for now)
    quiz_answers: Dict[str, Any]
    recommendations: List[Dict[str, Any]]


@app.post("/history")
def save_history(payload: SaveHistoryRequest):
    """
    Save one recommendation session into Supabase DB.
    """
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        insert_query = """
            insert into recommendation_history (user_id, email, quiz_answers, recommendations)
            values (%s, %s, %s, %s)
            returning id, created_at;
        """

        cur.execute(
            insert_query,
            (
                payload.user_id,
                payload.email,
                Json(payload.quiz_answers),
                Json(payload.recommendations),
            ),
        )
        row = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()

        return {
            "status": "success",
            "history_id": row["id"],
            "created_at": row["created_at"].isoformat(),
        }
    except Exception as e:
        print("❌ Error saving history:", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to save history")


@app.get("/history")
def get_history(
    email: str = Query(..., description="User email to fetch history"),
):
    """
    Fetch all past recommendation sessions for a given email.
    Later we can switch to verifying JWT & using user_id.
    """
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        select_query = """
            select id, user_id, email, quiz_answers, recommendations, created_at
            from recommendation_history
            where email = %s
            order by created_at desc;
        """

        cur.execute(select_query, (email,))
        rows = cur.fetchall()
        cur.close()
        conn.close()

        history = []
        for r in rows:
            history.append(
                {
                    "id": r["id"],
                    "user_id": r["user_id"],
                    "email": r["email"],
                    "quiz_answers": r["quiz_answers"],
                    "recommendations": r["recommendations"],
                    "created_at": r["created_at"].isoformat(),
                }
            )

        return {"status": "success", "data": history}
    except Exception as e:
        print("❌ Error fetching history:", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to load history")

# ================================================================
# 🌐 FastAPI Endpoint – Recommendations
# ================================================================
@app.get("/recommend")
def recommend_products(
    skin_type: str = Query(None),
    product_type: str = Query(None),
    concerns: str = Query(None),
    allergens_list: str = Query(None),
    pregnancy_safe: str = Query(None),
    top_n: int = Query(5),
):
    try:
        concern_list = [c.strip() for c in concerns.split(",")] if concerns else []
        allergen_list = [a.strip() for a in allergens_list.split(",")] if allergens_list else []

        results = get_recommendations(
            skin_type=skin_type,
            product_type=product_type,
            concerns=concern_list,
            allergens_list=allergen_list,
            pregnancy_safe=pregnancy_safe,
            top_n=top_n,
        )

        if not results:
            return {"results": [], "message": "No matches found for your filters."}
        return {"results": results}

    except Exception as e:
        print("❌ Error in /recommend:", e)
        traceback.print_exc()
        return {"results": [], "message": "Error occurred during recommendation."}
