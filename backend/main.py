from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="The Game of Life")

origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:80",
    "http://localhost",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    pass

from routes import config, logs, stats, quotas

app.include_router(config.router)
app.include_router(logs.router)
app.include_router(stats.router)
app.include_router(quotas.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to The Game of Life"}
