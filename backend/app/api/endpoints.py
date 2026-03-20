from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, Float, Integer, case
from typing import List, Optional
from datetime import datetime, timedelta, date
from ..database import get_db
from ..models import Transaction
from ..schemas import TransactionResponse, SummaryStats, TrendData, DistributionItem, AmenitySummary, FilterParams

router = APIRouter()

def apply_filters(query, filters: FilterParams, default_sales: bool = True):
    # Apply default 'Sales' filter if no group is specified
    target_group = filters.group or ('Sales' if default_sales else None)
    if target_group:
        query = query.filter(Transaction.group_en == target_group)

    if filters.start_date:
        query = query.filter(Transaction.instance_date >= filters.start_date)
    if filters.end_date:
        query = query.filter(Transaction.instance_date <= filters.end_date)
    
    if filters.area:
        # Handle common synonyms
        area_term = filters.area.strip().lower()
        synonyms = {
            "dubai marina": "Marsa Dubai",
            "marina": "Marsa Dubai",
            "downtown": "BURJ KHALIFA",
            "jvc": "JUMEIRAH VILLAGE CIRCLE",
            "jvt": "JUMEIRAH VILLAGE TRIANGLE",
            "jlt": "JUMEIRAH LAKES TOWERS",
            "jbr": "JUMEIRAH BEACH RESIDENCE",
            "palm": "Palm Jumeirah",
            "springs": "The Springs",
            "meadows": "The Meadows"
        }
        
        if area_term in synonyms:
            query = query.filter(Transaction.area_en.ilike(f"%{synonyms[area_term]}%"))
        else:
            query = query.filter(Transaction.area_en.ilike(f"%{area_term}%"))
            
    if filters.prop_type:
        pt = filters.prop_type.upper()
        if pt == "FLAT":
            query = query.filter(Transaction.prop_type_en == "Unit", Transaction.usage_en == "Residential")
        elif pt == "VILLA":
            query = query.filter(Transaction.prop_sb_type_en.ilike("%Villa%"))
        elif pt == "OFFICE":
            query = query.filter(Transaction.usage_en == "Commercial")
        elif pt == "LAND":
            query = query.filter(Transaction.prop_type_en == "Land")
        else:
            query = query.filter(Transaction.prop_type_en.ilike(f"%{filters.prop_type}%"))
            
    if filters.is_offplan:
        offplan_val = filters.is_offplan.title() # Convert OFF-PLAN to Off-Plan
        query = query.filter(Transaction.is_offplan_en == offplan_val)
    if filters.rooms:
        query = query.filter(Transaction.rooms_en == filters.rooms)
    return query

@router.get("/summary", response_model=SummaryStats)
def get_summary(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    area: Optional[str] = Query(None),
    prop_type: Optional[str] = Query(None),
    is_offplan: Optional[str] = Query(None),
    rooms: Optional[str] = Query(None),
    group: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    filters = FilterParams(
        start_date=start_date, end_date=end_date, area=area, 
        prop_type=prop_type, is_offplan=is_offplan, rooms=rooms,
        group=group
    )
    query = apply_filters(db.query(Transaction), filters)
    
    stats = db.query(
        func.sum(Transaction.trans_value).label("total_value"),
        func.count(Transaction.id).label("count"),
        func.avg(Transaction.trans_value).label("avg_value"),
        func.sum(Transaction.actual_area).label("total_area")
    ).filter(Transaction.id.in_(query.with_entities(Transaction.id))).first()
    
    if not stats or stats.count == 0:
        return {
            "total_value": 0, "transaction_count": 0, "avg_price": 0, "avg_area": 0, "price_per_sqft": 0
        }
    
    from decimal import Decimal
    SQFT_CONVERSION = Decimal('10.7639')
    total_area_sqft = Decimal(stats.total_area) * SQFT_CONVERSION if stats.total_area else Decimal(1)
    price_per_sqft = stats.total_value / total_area_sqft if total_area_sqft > 0 else 0
    
    return {
        "total_value": float(stats.total_value) if stats.total_value else 0,
        "transaction_count": stats.count,
        "avg_price": float(stats.avg_value) if stats.avg_value else 0,
        "avg_area": (float(stats.total_area) * 10.7639) / stats.count if stats.count and stats.total_area else 0,
        "price_per_sqft": float(price_per_sqft) if price_per_sqft else 0
    }

@router.get("/amenities", response_model=AmenitySummary)
def get_amenities(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    area: Optional[str] = Query(None),
    prop_type: Optional[str] = Query(None),
    is_offplan: Optional[str] = Query(None),
    rooms: Optional[str] = Query(None),
    group: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    filters = FilterParams(
        start_date=start_date, end_date=end_date, area=area, 
        prop_type=prop_type, is_offplan=is_offplan, rooms=rooms,
        group=group
    )
    query = apply_filters(db.query(Transaction), filters)
    ids = query.with_entities(Transaction.id)

    def get_top(col):
        clean_col = func.upper(func.trim(col))
        return db.query(
            case(
                (clean_col == "NA", "Other / Mixed"),
                (col == None, "Not Specified"),
                (clean_col == "UNKNOWN", "Other"),
                else_=col
            ).label("label"),
            func.cast(func.sum(Transaction.trans_value), Float).label("value"),
            func.count(Transaction.id).label("count")
        ).filter(
            Transaction.id.in_(ids)
        ).group_by(case(
                (clean_col == "NA", "Other / Mixed"),
                (col == None, "Not Specified"),
                (clean_col == "UNKNOWN", "Other"),
                else_=col
            )).order_by(desc("count")).limit(10).all()

    return {
        "top_metros": get_top(Transaction.nearest_metro_en),
        "top_malls": get_top(Transaction.nearest_mall_en),
        "top_landmarks": get_top(Transaction.nearest_landmark_en)
    }

@router.get("/trends", response_model=List[TrendData])
def get_trends(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    area: Optional[str] = Query(None),
    prop_type: Optional[str] = Query(None),
    is_offplan: Optional[str] = Query(None),
    rooms: Optional[str] = Query(None),
    group: Optional[str] = Query(None),
    interval: str = Query("month"),
    db: Session = Depends(get_db)
):
    filters = FilterParams(
        start_date=start_date, end_date=end_date, area=area, 
        prop_type=prop_type, is_offplan=is_offplan, rooms=rooms,
        group=group
    )
    query = apply_filters(db.query(Transaction), filters)
    trends = db.query(
        func.date_trunc(interval, Transaction.instance_date).label("date"),
        func.sum(Transaction.trans_value).label("value"),
        func.count(Transaction.id).label("volume"),
        (func.sum(Transaction.trans_value) / func.nullif(func.sum(Transaction.actual_area) * 10.7639, 0)).label("avg_price_per_sqft")
    ).filter(Transaction.id.in_(query.with_entities(Transaction.id))).group_by("date").order_by("date").all()
    
    return [
        {
            "date": t.date,
            "value": float(t.value) if t.value else 0,
            "volume": t.volume,
            "avg_price_per_sqft": float(t.avg_price_per_sqft) if t.avg_price_per_sqft else 0
        }
        for t in trends
    ]

@router.get("/projects", response_model=List[DistributionItem])
def get_projects(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    area: Optional[str] = Query(None),
    prop_type: Optional[str] = Query(None),
    is_offplan: Optional[str] = Query(None),
    rooms: Optional[str] = Query(None),
    group: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    filters = FilterParams(
        start_date=start_date, end_date=end_date, area=area, 
        prop_type=prop_type, is_offplan=is_offplan, rooms=rooms,
        group=group
    )
    query = apply_filters(db.query(Transaction), filters)
    
    # Aggregate by master project
    projects = db.query(
        case(
            (Transaction.master_project_en == "NA", "Individual Projects"),
            (Transaction.master_project_en == None, "Individual Projects"),
            else_=Transaction.master_project_en
        ).label("label"),
        func.sum(Transaction.trans_value).label("value"),
        func.count(Transaction.id).label("count")
    ).filter(
        Transaction.id.in_(query.with_entities(Transaction.id))
    ).group_by(case(
            (Transaction.master_project_en == "NA", "Individual Projects"),
            (Transaction.master_project_en == None, "Individual Projects"),
            else_=Transaction.master_project_en
        )).order_by(desc("count")).limit(20).all()
    
    return projects

@router.get("/distribution/{category}", response_model=List[DistributionItem])
def get_distribution(
    category: str, 
    limit: Optional[int] = Query(15),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    area: Optional[str] = Query(None),
    prop_type: Optional[str] = Query(None),
    is_offplan: Optional[str] = Query(None),
    rooms: Optional[str] = Query(None),
    group: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    if category not in ["prop_type_en", "area_en", "usage_en", "rooms_en", "parking", "group_en", "is_offplan_en"]:
        raise HTTPException(status_code=400, detail="Invalid category")
    
    filters = FilterParams(
        start_date=start_date, end_date=end_date, area=area, 
        prop_type=prop_type, is_offplan=is_offplan, rooms=rooms,
        group=group
    )
    # Don't apply default 'Sales' filter if we're asking for the group distribution itself (Strategic Split)
    query = apply_filters(db.query(Transaction), filters, default_sales=(category != "group_en"))
    column = getattr(Transaction, category)
    clean_col = func.upper(func.trim(column))
    
    db_query = db.query(
        case(
            (clean_col == "NA", "Other / Mixed"),
            (column == None, "Other"),
            (clean_col == "UNKNOWN", "Other"),
            else_=column
        ).label("label"),
        func.cast(func.sum(Transaction.trans_value), Float).label("value"),
        func.count(Transaction.id).label("count")
    ).filter(Transaction.id.in_(query.with_entities(Transaction.id))).group_by(
        case(
            (clean_col == "NA", "Other / Mixed"),
            (column == None, "Other"),
            (clean_col == "UNKNOWN", "Other"),
            else_=column
        )
    ).order_by(desc("count"))
    
    if limit:
        db_query = db_query.limit(limit)
        
    return db_query.all()

@router.get("/transactions", response_model=List[TransactionResponse])
def get_transactions(
    skip: int = 0, 
    limit: int = 50, 
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    area: Optional[str] = Query(None),
    prop_type: Optional[str] = Query(None),
    is_offplan: Optional[str] = Query(None),
    rooms: Optional[str] = Query(None),
    group: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    filters = FilterParams(
        start_date=start_date, end_date=end_date, area=area, 
        prop_type=prop_type, is_offplan=is_offplan, rooms=rooms,
        group=group
    )
    query = apply_filters(db.query(Transaction), filters)
    transactions = query.order_by(desc(Transaction.instance_date)).offset(skip).limit(limit).all()
    
    # Sanitize labels for raw data display
    for t in transactions:
        if t.rooms_en == "NA": t.rooms_en = "Other / Mixed"
        if t.parking == "NA": t.parking = "Not Specified"
        if t.master_project_en == "NA" or t.master_project_en is None: 
            t.master_project_en = "Individual Projects"
        if t.nearest_landmark_en == "NA": t.nearest_landmark_en = "Other / Mixed"
        if t.nearest_metro_en == "NA": t.nearest_metro_en = "Other / Mixed"
        if t.nearest_mall_en == "NA": t.nearest_mall_en = "Other / Mixed"
        
    return transactions
