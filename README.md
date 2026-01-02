# Life Game

A gamified life tracker application to monitor rituals, vices, and progress.

## Quick Start

1.  **Configure Environment**:
    Copy the example configuration and adjust as needed:
    ```bash
    cp .env.example .env
    ```
    Ensure `APP_DATA_DIR` points to your desired data directory (e.g., `/DATA/AppData/life_game`).

2.  **Run with Docker**:
    ```bash
    docker-compose up -d
    ```

3.  **Access**:
    - Frontend: `http://localhost:3001` (or configured port)
    - Backend: `http://localhost:8001`

## Configuration

Key variables in `.env`:
- `PUID`/`PGID`: User/Group IDs for file permissions.
- `TZ`: Timezone.
- `APP_DATA_DIR`: Path to store persistent data.
