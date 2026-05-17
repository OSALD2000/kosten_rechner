from pydantic import BaseModel
from typing import Optional
from datetime import date


class AusgabeCreate(BaseModel):
    betrag: float
    kategorie: str
    beschreibung: Optional[str] = ""
    datum: date


class AusgabeUpdate(BaseModel):
    betrag: Optional[float] = None
    kategorie: Optional[str] = None
    beschreibung: Optional[str] = None
    datum: Optional[date] = None
