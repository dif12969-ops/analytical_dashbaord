from app.database import SessionLocal
from app.models import Transaction
from sqlalchemy import func

db = SessionLocal()
try:
    print("Unique Property Types:")
    prop_types = db.query(Transaction.prop_type_en).distinct().all()
    for p in prop_types:
        print(f"- '{p[0]}'")

    print("Searching for 'Burj' or 'Downtown':")
    downtown = db.query(Transaction.area_en).filter(
        (Transaction.area_en.ilike('%Burj%')) | (Transaction.area_en.ilike('%Downtown%'))
    ).distinct().all()
    for d in downtown:
        print(f"'{d[0]}'")

    print("\nMore Sample Areas (Searching for Maria/Marina):")
    marina_areas = db.query(Transaction.area_en).filter(Transaction.area_en.ilike('%Marsa%')).distinct().all()
    for a in marina_areas:
        print(f"- '{a[0]}'")
finally:
    db.close()
