import pandas as pd
import os
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models import Transaction
from datetime import datetime

# Path to the data file
CSV_FILE = os.path.join(os.path.dirname(__file__), '../../data/transactions.csv')

def clean_data(df):
    """
    Cleans the dataframe for database ingestion.
    """
    # Convert instance_date to datetime
    df['INSTANCE_DATE'] = pd.to_datetime(df['INSTANCE_DATE'])
    
    # Handle numeric conversions
    df['TRANS_VALUE'] = pd.to_numeric(df['TRANS_VALUE'], errors='coerce').fillna(0)
    df['PROCEDURE_AREA'] = pd.to_numeric(df['PROCEDURE_AREA'], errors='coerce').fillna(0)
    df['ACTUAL_AREA'] = pd.to_numeric(df['ACTUAL_AREA'], errors='coerce').fillna(0)
    df['TOTAL_BUYER'] = pd.to_numeric(df['TOTAL_BUYER'], errors='coerce').fillna(0).astype(int)
    df['TOTAL_SELLER'] = pd.to_numeric(df['TOTAL_SELLER'], errors='coerce').fillna(0).astype(int)
    
    # Fill NaN for strings
    df = df.fillna("NA")
    
    return df

from sqlalchemy import text

def ingest_data():
    print(f"Reading CSV from {CSV_FILE}...")
    # Read CSV in chunks or all at once if memory allows. 55k rows should fit in memory.
    df = pd.read_csv(CSV_FILE)
    print(f"Read {len(df)} rows. Cleaning data...")
    df = clean_data(df)
    
    print("Creating tables if they don't exist...")
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    try:
        print("Truncating existing transactions (optional but good for clean loads)...")
        db.execute(text("TRUNCATE TABLE transactions RESTART IDENTITY"))
        db.commit()
        
        print("Ingesting rows into database...")
        # Use pandas to_sql or a more efficient bulk insert method
        # Mapping CSV headers to Model columns
        column_mapping = {
            'TRANSACTION_NUMBER': 'transaction_number',
            'INSTANCE_DATE': 'instance_date',
            'GROUP_EN': 'group_en',
            'PROCEDURE_EN': 'procedure_en',
            'IS_OFFPLAN_EN': 'is_offplan_en',
            'IS_FREE_HOLD_EN': 'is_free_hold_en',
            'USAGE_EN': 'usage_en',
            'AREA_EN': 'area_en',
            'PROP_TYPE_EN': 'prop_type_en',
            'PROP_SB_TYPE_EN': 'prop_sb_type_en',
            'TRANS_VALUE': 'trans_value',
            'PROCEDURE_AREA': 'procedure_area',
            'ACTUAL_AREA': 'actual_area',
            'ROOMS_EN': 'rooms_en',
            'PARKING': 'parking',
            'NEAREST_METRO_EN': 'nearest_metro_en',
            'NEAREST_MALL_EN': 'nearest_mall_en',
            'NEAREST_LANDMARK_EN': 'nearest_landmark_en',
            'TOTAL_BUYER': 'total_buyer',
            'TOTAL_SELLER': 'total_seller',
            'MASTER_PROJECT_EN': 'master_project_en',
            'PROJECT_EN': 'project_en'
        }
        
        df_to_load = df[column_mapping.keys()].rename(columns=column_mapping)
        
        # Using to_sql with multi-row inserting
        df_to_load.to_sql('transactions', con=engine, if_exists='append', index=False, method='multi', chunksize=1000)
        
        print(f"Successfully ingested {len(df)} transactions.")
        
    except Exception as e:
        print(f"Error during ingestion: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    ingest_data()
