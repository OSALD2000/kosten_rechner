from fastapi import APIRouter, HTTPException, Depends
from backend.firebase import get_db
from backend.models import AusgabeCreate, AusgabeUpdate
from backend.auth import get_current_user
from datetime import datetime
from google.cloud.firestore_v1 import FieldFilter

router = APIRouter(prefix="/ausgaben", tags=["ausgaben"])


def _col(user_id: str):
    return get_db().collection("users").document(user_id).collection("ausgaben")


def _doc_to_dict(doc):
    d = doc.to_dict()
    d["id"] = doc.id
    if "datum" in d and hasattr(d["datum"], "isoformat"):
        d["datum"] = d["datum"].isoformat()[:10]
    return d


@router.get("/monate")
def verfuegbare_monate(user=Depends(get_current_user)):
    docs = _col(user["id"]).order_by("datum", direction="DESCENDING").stream()
    seen = set()
    monate = []
    for doc in docs:
        dt = doc.to_dict().get("datum")
        if dt:
            key = (dt.year, dt.month)
            if key not in seen:
                seen.add(key)
                monate.append({"jahr": dt.year, "monat": dt.month})
    return monate


@router.get("/jahres-uebersicht/{jahr}")
def jahres_uebersicht(jahr: int, user=Depends(get_current_user)):
    start = datetime(jahr, 1, 1)
    end = datetime(jahr + 1, 1, 1)
    docs = (
        _col(user["id"])
        .where(filter=FieldFilter("datum", ">=", start))
        .where(filter=FieldFilter("datum", "<", end))
        .stream()
    )
    monats_summen: dict[int, dict] = {}
    for doc in docs:
        d = doc.to_dict()
        m = d["datum"].month
        if m not in monats_summen:
            monats_summen[m] = {"summe": 0.0, "anzahl": 0}
        monats_summen[m]["summe"] += d["betrag"]
        monats_summen[m]["anzahl"] += 1
    return [{"monat": m, **v} for m, v in sorted(monats_summen.items())]


@router.get("/monat/{jahr}/{monat}")
def ausgaben_nach_monat(jahr: int, monat: int, user=Depends(get_current_user)):
    start = datetime(jahr, monat, 1)
    end = datetime(jahr + 1, 1, 1) if monat == 12 else datetime(jahr, monat + 1, 1)
    docs = (
        _col(user["id"])
        .where(filter=FieldFilter("datum", ">=", start))
        .where(filter=FieldFilter("datum", "<", end))
        .order_by("datum", direction="DESCENDING")
        .stream()
    )
    return [_doc_to_dict(d) for d in docs]


@router.get("/zusammenfassung/{jahr}/{monat}")
def zusammenfassung(jahr: int, monat: int, user=Depends(get_current_user)):
    ausgaben = ausgaben_nach_monat(jahr, monat, user)
    gesamt = sum(a["betrag"] for a in ausgaben)
    nach_kategorie: dict[str, float] = {}
    for a in ausgaben:
        nach_kategorie[a["kategorie"]] = nach_kategorie.get(a["kategorie"], 0) + a["betrag"]
    return {
        "gesamt": gesamt,
        "nach_kategorie": nach_kategorie,
        "anzahl": len(ausgaben),
    }


@router.get("/")
def alle_ausgaben(user=Depends(get_current_user)):
    docs = _col(user["id"]).order_by("datum", direction="DESCENDING").stream()
    return [_doc_to_dict(d) for d in docs]


@router.post("/", status_code=201)
def ausgabe_erstellen(ausgabe: AusgabeCreate, user=Depends(get_current_user)):
    data = ausgabe.model_dump()
    data["datum"] = datetime(data["datum"].year, data["datum"].month, data["datum"].day)
    _, ref = _col(user["id"]).add(data)
    return _doc_to_dict(ref.get())


@router.put("/{ausgabe_id}")
def ausgabe_aktualisieren(ausgabe_id: str, ausgabe: AusgabeUpdate, user=Depends(get_current_user)):
    ref = _col(user["id"]).document(ausgabe_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Ausgabe nicht gefunden")
    data = {k: v for k, v in ausgabe.model_dump().items() if v is not None}
    if "datum" in data:
        d = data["datum"]
        data["datum"] = datetime(d.year, d.month, d.day)
    ref.update(data)
    return _doc_to_dict(ref.get())


@router.delete("/{ausgabe_id}", status_code=204)
def ausgabe_loeschen(ausgabe_id: str, user=Depends(get_current_user)):
    ref = _col(user["id"]).document(ausgabe_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Ausgabe nicht gefunden")
    ref.delete()
