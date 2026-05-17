import firebase_admin
from firebase_admin import credentials, firestore

_app = None

def get_db():
    global _app
    if not _app:
        cred = credentials.Certificate("serviceAccountKey.json")
        _app = firebase_admin.initialize_app(cred)
    return firestore.client()
