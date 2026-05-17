from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.firebase import get_db
from backend.auth import verify_password, create_token
from google.cloud.firestore_v1 import FieldFilter

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginData(BaseModel):
    email: str
    password: str


class RegisterData(BaseModel):
    name: str
    email: str
    password: str

def _find_user(email: str):
    db = get_db()
    docs = db.collection("users").where(filter=FieldFilter("email", "==", email)).limit(1).stream()
    return next(docs, None)

@router.post("/login")
def login(data: LoginData):
    doc = _find_user(data.email)
    if not doc:
        raise HTTPException(status_code=401, detail="Email oder Passwort falsch")
    user = doc.to_dict()
    if not user.get("password") or not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Email oder Passwort falsch")
    token = create_token(doc.id, user["email"])
    return {
        "token": token,
        "user": {
            "id": doc.id,
            "email": user["email"],
            "name": user.get("name") or user.get("first", ""),
        },
    }

@router.get("/me")
def me():
    return {"ok": True}
