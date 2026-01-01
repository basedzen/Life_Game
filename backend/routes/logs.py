from fastapi import APIRouter, Depends, HTTPException, Response
from sqlmodel import Session, select
from database import get_session
from models import Log, MetricType
from typing import List, Optional
from pydantic import BaseModel
import csv
import io
from datetime import datetime

router = APIRouter(prefix="/logs", tags=["logs"])

class LogCreate(BaseModel):
    ritual_id: Optional[int] = None
    quota_id: Optional[int] = None
    timestamp: Optional[str] = None
    value: float
    tag: Optional[str] = None
    metric_type: str

@router.post("/", response_model=Log)
def create_log(log_data: LogCreate, session: Session = Depends(get_session)):
    # Parse timestamp if provided, otherwise use current time
    if log_data.timestamp:
        timestamp = datetime.fromisoformat(log_data.timestamp.replace('Z', '+00:00'))
    else:
        timestamp = datetime.utcnow()
    
    log = Log(
        ritual_id=log_data.ritual_id,
        quota_id=log_data.quota_id,
        timestamp=timestamp,
        value=log_data.value,
        tag=log_data.tag,
        metric_type=log_data.metric_type
    )
    session.add(log)
    session.commit()
    session.refresh(log)
    return log

@router.get("/", response_model=List[Log])
def read_logs(session: Session = Depends(get_session)):
    return session.exec(select(Log).order_by(Log.timestamp.desc()).limit(100)).all()

@router.put("/{log_id}", response_model=Log)
def update_log(log_id: int, log_update: LogCreate, session: Session = Depends(get_session)):
    db_log = session.get(Log, log_id)
    if not db_log:
        raise HTTPException(status_code=404, detail="Log not found")
    
    db_log.ritual_id = log_update.ritual_id
    db_log.quota_id = log_update.quota_id
    db_log.value = log_update.value
    db_log.tag = log_update.tag
    db_log.metric_type = log_update.metric_type
    
    # Update timestamp if provided
    if log_update.timestamp:
        db_log.timestamp = datetime.fromisoformat(log_update.timestamp.replace('Z', '+00:00'))
    
    session.add(db_log)
    session.commit()
    session.refresh(db_log)
    return db_log

@router.delete("/{log_id}")
def delete_log(log_id: int, session: Session = Depends(get_session)):
    log = session.get(Log, log_id)
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    session.delete(log)
    session.commit()
    return {"ok": True}

@router.get("/export")
def export_logs(session: Session = Depends(get_session)):
    logs = session.exec(select(Log)).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["id", "ritual_id", "quota_id", "timestamp", "value", "tag", "metric_type"])
    
    for log in logs:
        writer.writerow([log.id, log.ritual_id, log.quota_id, log.timestamp, log.value, log.tag, log.metric_type])
    
    return Response(content=output.getvalue(), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=logs.csv"})

@router.get("/tags", response_model=List[str])
def get_tags(session: Session = Depends(get_session)):
    """
    Fetch all unique tags used in logs.
    Splits tag strings by space to handle multiple tags per entry.
    """
    logs = session.exec(select(Log.tag).where(Log.tag != None)).all()
    unique_tags = set()
    for tag_str in logs:
        if tag_str:
            # Split by space to handle multiple tags
            parts = tag_str.split()
            for part in parts:
                unique_tags.add(part)
    
    return sorted(list(unique_tags))
