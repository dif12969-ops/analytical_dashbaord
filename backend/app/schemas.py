from pydantic import BaseModel, Field
from datetime import datetime, date
from typing import List, Optional
from decimal import Decimal

class TransactionBase(BaseModel):
    transaction_number: str
    instance_date: datetime
    group_en: str
    procedure_en: str
    is_offplan_en: str
    is_free_hold_en: str
    usage_en: str
    area_en: str
    prop_type_en: str
    prop_sb_type_en: str
    trans_value: Decimal
    procedure_area: float
    actual_area: float
    rooms_en: str
    parking: str
    nearest_metro_en: str
    nearest_mall_en: str
    nearest_landmark_en: str
    total_buyer: int
    total_seller: int
    master_project_en: str
    project_en: str

class TransactionResponse(TransactionBase):
    id: int

    class Config:
        from_attributes = True

class SummaryStats(BaseModel):
    total_value: Decimal
    transaction_count: int
    avg_price: Decimal
    avg_area: float
    price_per_sqft: Decimal

class TrendData(BaseModel):
    date: datetime
    value: Decimal
    volume: int
    avg_price_per_sqft: Decimal

class DistributionItem(BaseModel):
    label: Optional[str] = "Unknown"
    value: Decimal
    count: int

class AmenitySummary(BaseModel):
    top_metros: List[DistributionItem]
    top_malls: List[DistributionItem]
    top_landmarks: List[DistributionItem]

class RoomStats(BaseModel):
    rooms: str
    avg_value: Decimal
    count: int

class UsageStats(BaseModel):
    usage: str
    total_value: Decimal
    percentage: float

class FilterParams(BaseModel):
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    area: Optional[str] = None
    prop_type: Optional[str] = None
    is_offplan: Optional[str] = None
    rooms: Optional[str] = None
    group: Optional[str] = None
