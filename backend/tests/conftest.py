import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
from app.core.database import Base, get_db
from app.main import app

# In-memory SQLite engine for fast, isolated testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session")
def db_engine():
    Base.metadata.create_all(bind=engine)
    with TestingSessionLocal() as s:
        from app.models.emission_factor import EmissionFactor
        s.add_all([
            EmissionFactor(source_name="grid_electricity", factor_value=0.716, unit="kgCO2e/kWh", reference="India CEA CO2 Baseline Database v19 (2024)", version="v19-2024", scope="Scope 2", is_active=True),
            EmissionFactor(source_name="natural_gas", factor_value=1.930, unit="kgCO2e/m3", reference="IPCC 2006 / GAIL India Reference Data", version="v2023", scope="Scope 1", is_active=True),
            EmissionFactor(source_name="diesel", factor_value=2.680, unit="kgCO2e/L", reference="IPCC 2006 Guidelines", version="v2023", scope="Scope 1", is_active=True),
            EmissionFactor(source_name="coal", factor_value=2.420, unit="kgCO2e/kg", reference="BEE India", version="v2023", scope="Scope 1", is_active=True),
        ])
        s.commit()
    yield engine
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def db_session(db_engine):
    connection = db_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
