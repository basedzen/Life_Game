from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database import get_session
from models import Ritual, Reward, Setting
from typing import List
from pydantic import BaseModel

router = APIRouter(prefix="/config", tags=["config"])

# --- Rituals ---
@router.post("/rituals", response_model=Ritual)
def create_ritual(ritual: Ritual, session: Session = Depends(get_session)):
    session.add(ritual)
    session.commit()
    session.refresh(ritual)
    return ritual

@router.get("/rituals", response_model=List[Ritual])
def read_rituals(session: Session = Depends(get_session)):
    rituals = session.exec(select(Ritual)).all()
    return rituals

@router.delete("/rituals/{ritual_id}")
def delete_ritual(ritual_id: int, session: Session = Depends(get_session)):
    ritual = session.get(Ritual, ritual_id)
    if not ritual:
        raise HTTPException(status_code=404, detail="Ritual not found")
    session.delete(ritual)
    session.commit()
    return {"ok": True}

@router.put("/rituals/{ritual_id}", response_model=Ritual)
def update_ritual(ritual_id: int, ritual: Ritual, session: Session = Depends(get_session)):
    db_ritual = session.get(Ritual, ritual_id)
    if not db_ritual:
        raise HTTPException(status_code=404, detail="Ritual not found")
    db_ritual.name = ritual.name
    db_ritual.target_value = ritual.target_value
    db_ritual.unit = ritual.unit
    db_ritual.period = ritual.period
    db_ritual.sort_order = ritual.sort_order
    db_ritual.icon = ritual.icon
    db_ritual.default_tag = ritual.default_tag
    session.add(db_ritual)
    session.commit()
    session.refresh(db_ritual)
    return db_ritual

class ReorderRequest(BaseModel):
    ritual_ids: List[int]

@router.post("/rituals/reorder")
def reorder_rituals(request: ReorderRequest, session: Session = Depends(get_session)):
    for index, ritual_id in enumerate(request.ritual_ids):
        ritual = session.get(Ritual, ritual_id)
        if ritual:
            ritual.sort_order = index
            session.add(ritual)
    session.commit()
    return {"ok": True}

# --- Rewards ---
@router.post("/rewards", response_model=Reward)
def create_reward(reward: Reward, session: Session = Depends(get_session)):
    existing = session.get(Reward, reward.roll_number)
    if existing:
        existing.reward_description = reward.reward_description
        existing.rarity = reward.rarity
        session.add(existing)
    else:
        session.add(reward)
    session.commit()
    session.refresh(reward if not existing else existing)
    return reward if not existing else existing

@router.get("/rewards", response_model=List[Reward])
def read_rewards(session: Session = Depends(get_session)):
    return session.exec(select(Reward).order_by(Reward.roll_number)).all()

# --- Settings ---
@router.post("/settings", response_model=Setting)
def update_setting(setting: Setting, session: Session = Depends(get_session)):
    existing = session.get(Setting, setting.key)
    if existing:
        existing.value = setting.value
        session.add(existing)
    else:
        session.add(setting)
    session.commit()
    session.refresh(setting if not existing else existing)
    return setting if not existing else existing

@router.get("/settings", response_model=List[Setting])
def read_settings(session: Session = Depends(get_session)):
    return session.exec(select(Setting)).all()
