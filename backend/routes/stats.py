from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func
from database import get_session
from models import Log, Ritual, Quota, MetricType
from datetime import datetime, timedelta
from typing import List, Dict, Any

router = APIRouter(prefix="/stats", tags=["stats"])

@router.get("/weekly")
def get_weekly_stats(session: Session = Depends(get_session)):
    # Calculate start of week (Monday)
    today = datetime.utcnow().date()
    start_of_week = today - timedelta(days=today.weekday())
    start_datetime = datetime.combine(start_of_week, datetime.min.time())
    
    # Get all rituals ordered by sort_order
    rituals = session.exec(select(Ritual).order_by(Ritual.sort_order)).all()
    
    stats = []
    total_completed = 0
    total_targets = 0
    
    for ritual in rituals:
        # Sum logs for this ritual this week
        logs = session.exec(
            select(Log)
            .where(Log.ritual_id == ritual.id)
            .where(Log.timestamp >= start_datetime)
            .where(Log.metric_type == MetricType.ritual)
        ).all()
        
        current_value = sum(log.value for log in logs)
        percent = min(100, (current_value / ritual.target_value) * 100) if ritual.target_value > 0 else 0
        
        stats.append({
            "ritual_id": ritual.id,
            "name": ritual.name,
            "current": current_value,
            "target": ritual.target_value,
            "unit": ritual.unit,
            "percent": percent,
            "icon": ritual.icon
        })
        
        if current_value >= ritual.target_value:
            total_completed += 1
        total_targets += 1
        
    unlock_percent = (total_completed / total_targets * 100) if total_targets > 0 else 0
    
    # Get quota stats for the week
    quotas = session.exec(select(Quota)).all()
    quota_stats = []
    
    for quota in quotas:
        logs = session.exec(
            select(Log)
            .where(Log.quota_id == quota.id)
            .where(Log.timestamp >= start_datetime)
            .where(Log.metric_type == MetricType.quota)
        ).all()
        
        total_value = sum(log.value for log in logs)
        quota_stats.append({
            "quota_id": quota.id,
            "name": quota.name,
            "total": total_value,
            "unit": quota.unit,
            "category": quota.category,
            "icon": quota.icon,
            "label": quota.label
        })
    
    return {
        "rituals": stats,
        "quotas": quota_stats,
        "unlock_percent": unlock_percent,
        "week_start": start_of_week
    }

@router.get("/yearly")
def get_yearly_stats(session: Session = Depends(get_session)):
    today = datetime.utcnow().date()
    start_of_year = datetime(today.year, 1, 1)
    
    # Year progress
    days_in_year = 366 if (today.year % 4 == 0 and today.year % 100 != 0) or (today.year % 400 == 0) else 365
    day_of_year = today.timetuple().tm_yday
    year_progress = (day_of_year / days_in_year) * 100
    
    # Monthly breakdown (simplified)
    # Group logs by month
    logs = session.exec(select(Log).where(Log.timestamp >= start_of_year)).all()
    monthly_counts = {}
    
    for log in logs:
        month = log.timestamp.strftime("%Y-%m")
        monthly_counts[month] = monthly_counts.get(month, 0) + 1
    
    # Quota statistics
    quotas = session.exec(select(Quota).order_by(Quota.sort_order)).all()
    quota_stats = []
    
    for quota in quotas:
        logs = session.exec(
            select(Log)
            .where(Log.quota_id == quota.id)
            .where(Log.timestamp >= start_of_year)
            .where(Log.metric_type == MetricType.quota)
        ).all()
        
        total_value = sum(log.value for log in logs)
        
        # Monthly breakdown for this quota
        monthly_breakdown = {}
        for log in logs:
            month = log.timestamp.strftime("%Y-%m")
            monthly_breakdown[month] = monthly_breakdown.get(month, 0) + log.value
        
        quota_stats.append({
            "quota_id": quota.id,
            "name": quota.name,
            "total": total_value,
            "unit": quota.unit,
            "category": quota.category,
            "icon": quota.icon,
            "label": quota.label,
            "monthly_breakdown": monthly_breakdown
        })
        
    return {
        "year_progress": year_progress,
        "monthly_activity": monthly_counts,
        "quotas": quota_stats
    }

@router.get("/monthly")
def get_monthly_stats(session: Session = Depends(get_session)):
    """Get statistics for the current month"""
    today = datetime.utcnow().date()
    start_of_month = datetime(today.year, today.month, 1)
    
    # Get all rituals
    rituals = session.exec(select(Ritual)).all()
    ritual_stats = []
    
    for ritual in rituals:
        # Sum logs for this ritual this month
        logs = session.exec(
            select(Log)
            .where(Log.ritual_id == ritual.id)
            .where(Log.timestamp >= start_of_month)
            .where(Log.metric_type == MetricType.ritual)
        ).all()
        
        current_value = sum(log.value for log in logs)
        
        # Calculate monthly target (weekly target * ~4.33 weeks per month)
        monthly_target = ritual.target_value * 4.33 if ritual.period == "weekly" else ritual.target_value / 12
        percent = min(100, (current_value / monthly_target) * 100) if monthly_target > 0 else 0
        
        ritual_stats.append({
            "ritual_id": ritual.id,
            "name": ritual.name,
            "current": current_value,
            "target": monthly_target,
            "unit": ritual.unit,
            "percent": percent,
            "icon": ritual.icon
        })
    
    # Get quota stats for the month
    quotas = session.exec(select(Quota).order_by(Quota.sort_order)).all()
    quota_stats = []
    
    for quota in quotas:
        logs = session.exec(
            select(Log)
            .where(Log.quota_id == quota.id)
            .where(Log.timestamp >= start_of_month)
            .where(Log.metric_type == MetricType.quota)
        ).all()
        
        total_value = sum(log.value for log in logs)
        quota_stats.append({
            "quota_id": quota.id,
            "name": quota.name,
            "total": total_value,
            "unit": quota.unit,
            "category": quota.category,
            "icon": quota.icon,
            "label": quota.label
        })
    
    return {
        "rituals": ritual_stats,
        "quotas": quota_stats,
        "month_start": start_of_month.date()
    }
