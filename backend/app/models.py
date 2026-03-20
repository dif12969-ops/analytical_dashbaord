from sqlalchemy import Column, Integer, String, Float, DateTime, Numeric, Index
from .database import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    transaction_number = Column(String, index=True)
    instance_date = Column(DateTime, index=True)
    group_en = Column(String, index=True)
    procedure_en = Column(String)
    is_offplan_en = Column(String, index=True)
    is_free_hold_en = Column(String)
    usage_en = Column(String, index=True)
    area_en = Column(String, index=True)
    prop_type_en = Column(String, index=True)
    prop_sb_type_en = Column(String, index=True)
    trans_value = Column(Numeric(precision=20, scale=2), index=True)
    procedure_area = Column(Float)
    actual_area = Column(Float)
    rooms_en = Column(String)
    parking = Column(String)
    nearest_metro_en = Column(String)
    nearest_mall_en = Column(String)
    nearest_landmark_en = Column(String)
    total_buyer = Column(Integer)
    total_seller = Column(Integer)
    master_project_en = Column(String)
    project_en = Column(String, index=True)

    # Composite indexes for common query patterns
    __table_args__ = (
        Index('idx_area_date', 'area_en', 'instance_date'),
        Index('idx_prop_type_date', 'prop_type_en', 'instance_date'),
    )
