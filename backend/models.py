from typing import Optional
from sqlmodel import Field, SQLModel
from datetime import datetime
from enum import Enum

class MetricType(str, Enum):
    ritual = "ritual"
    vice = "vice"
    pomodoro = "pomodoro"
    quota = "quota"

class Ritual(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    target_value: float
    unit: str  # e.g., "minutes", "count"
    period: str = "weekly" # "weekly", "annual"
    sort_order: int = 0  # For custom ordering
    icon: Optional[str] = None  # e.g., "Book", "Dumbbell"

class Quota(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    unit: str  # e.g., "sessions", "glasses", "count"
    category: Optional[str] = None  # e.g., "productivity", "health"
    icon: Optional[str] = None  # e.g., "Wine", "Pill", "Cigarette"
    label: Optional[str] = None  # Optional custom label
    sort_order: int = 0  # For custom ordering

class Log(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    ritual_id: Optional[int] = Field(default=None, foreign_key="ritual.id")
    quota_id: Optional[int] = Field(default=None, foreign_key="quota.id")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    value: float
    tag: Optional[str] = None
    metric_type: MetricType

class Reward(SQLModel, table=True):
    roll_number: int = Field(primary_key=True)
    reward_description: str
    rarity: str = "Common"

class Setting(SQLModel, table=True):
    key: str = Field(primary_key=True)
    value: str
