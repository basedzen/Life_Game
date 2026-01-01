from sqlmodel import SQLModel, create_engine, Session
import os

# Ensure data directory exists
os.makedirs("/app/data", exist_ok=True)

sqlite_file_name = "/app/data/gameoflife.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, echo=True, connect_args=connect_args)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
