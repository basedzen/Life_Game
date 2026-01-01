from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database import get_session
from models import Quota
from typing import List
from pydantic import BaseModel

router = APIRouter(prefix="/quotas", tags=["quotas"])

@router.post("/", response_model=Quota)
def create_quota(quota: Quota, session: Session = Depends(get_session)):
    session.add(quota)
    session.commit()
    session.refresh(quota)
    return quota

@router.get("/", response_model=List[Quota])
def read_quotas(session: Session = Depends(get_session)):
    quotas = session.exec(select(Quota)).all()
    return quotas

@router.put("/{quota_id}", response_model=Quota)
def update_quota(quota_id: int, quota: Quota, session: Session = Depends(get_session)):
    db_quota = session.get(Quota, quota_id)
    if not db_quota:
        raise HTTPException(status_code=404, detail="Quota not found")
    db_quota.name = quota.name
    db_quota.unit = quota.unit
    db_quota.category = quota.category
    db_quota.icon = quota.icon
    db_quota.label = quota.label
    db_quota.sort_order = quota.sort_order
    session.add(db_quota)
    session.commit()
    session.refresh(db_quota)
    return db_quota

@router.delete("/{quota_id}")
def delete_quota(quota_id: int, session: Session = Depends(get_session)):
    quota = session.get(Quota, quota_id)
    if not quota:
        raise HTTPException(status_code=404, detail="Quota not found")
    session.delete(quota)
    session.commit()
    return {"ok": True}

class ReorderRequest(BaseModel):
    quota_ids: List[int]

@router.post("/reorder")
def reorder_quotas(request: ReorderRequest, session: Session = Depends(get_session)):
    for index, quota_id in enumerate(request.quota_ids):
        quota = session.get(Quota, quota_id)
        if quota:
            quota.sort_order = index
            session.add(quota)
    session.commit()
    return {"ok": True}
