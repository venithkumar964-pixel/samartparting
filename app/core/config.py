from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parents[2]
DEFAULT_DB = BASE_DIR / "database" / "smart-parking.db"


class Settings(BaseSettings):
    app_name: str = "Smart Parking API"
    database_url: str = f"sqlite:///{DEFAULT_DB.as_posix()}"
    schema_path: Path = BASE_DIR / "database" / "schema.sql"
    cors_origins: list[str] = ["http://localhost:3000"]
    port: int = 5000

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
