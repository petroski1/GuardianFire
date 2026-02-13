from fastapi import FastAPI, APIRouter, HTTPException, Response, Request, Depends
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import asyncio
import resend
import httpx
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
import random
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Resend config
resend.api_key = os.environ.get('RESEND_API_KEY', '')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')

# LLM config
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

# Create the main app
app = FastAPI(title="GuardianFire AI")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============== MODELS ==============

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Sector(BaseModel):
    model_config = ConfigDict(extra="ignore")
    sector_id: str = Field(default_factory=lambda: f"sector_{uuid.uuid4().hex[:8]}")
    name: str
    description: Optional[str] = None
    risk_level: float = 0.0  # 0-100
    status: str = "safe"  # safe, warning, critical
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SectorCreate(BaseModel):
    name: str
    description: Optional[str] = None

class Sensor(BaseModel):
    model_config = ConfigDict(extra="ignore")
    sensor_id: str = Field(default_factory=lambda: f"sensor_{uuid.uuid4().hex[:8]}")
    sector_id: str
    name: str
    sensor_type: str  # temperature, vibration, energy, smoke, humidity
    unit: str
    current_value: float = 0.0
    min_threshold: float = 0.0
    max_threshold: float = 100.0
    status: str = "normal"  # normal, warning, critical
    last_reading: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SensorCreate(BaseModel):
    sector_id: str
    name: str
    sensor_type: str
    unit: str
    min_threshold: float = 0.0
    max_threshold: float = 100.0

class SensorReading(BaseModel):
    sensor_id: str
    value: float
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Alert(BaseModel):
    model_config = ConfigDict(extra="ignore")
    alert_id: str = Field(default_factory=lambda: f"alert_{uuid.uuid4().hex[:8]}")
    sector_id: str
    sensor_id: Optional[str] = None
    alert_type: str  # prediction, incident, maintenance
    severity: str  # low, medium, high, critical
    title: str
    description: str
    probability: float  # 0-100
    prescribed_action: str
    status: str = "active"  # active, acknowledged, resolved
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    resolved_at: Optional[datetime] = None

class AlertCreate(BaseModel):
    sector_id: str
    sensor_id: Optional[str] = None
    alert_type: str
    severity: str
    title: str
    description: str
    probability: float
    prescribed_action: str

class WorkOrder(BaseModel):
    model_config = ConfigDict(extra="ignore")
    order_id: str = Field(default_factory=lambda: f"WO-{uuid.uuid4().hex[:8].upper()}")
    alert_id: Optional[str] = None
    sector_id: str
    title: str
    description: str
    priority: str  # low, medium, high, urgent
    assigned_to: Optional[str] = None
    status: str = "pending"  # pending, in_progress, completed, cancelled
    due_date: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None

class WorkOrderCreate(BaseModel):
    alert_id: Optional[str] = None
    sector_id: str
    title: str
    description: str
    priority: str
    assigned_to: Optional[str] = None
    due_date: Optional[datetime] = None

class ContextVariables(BaseModel):
    model_config = ConfigDict(extra="ignore")
    context_id: str = Field(default_factory=lambda: f"ctx_{uuid.uuid4().hex[:8]}")
    temperature_external: float = 25.0  # Celsius
    humidity: float = 50.0  # Percentage
    machine_load: float = 70.0  # Percentage
    team_fatigue: float = 30.0  # Percentage (shift duration based)
    last_maintenance_days: int = 7
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BehavioralReport(BaseModel):
    model_config = ConfigDict(extra="ignore")
    report_id: str = Field(default_factory=lambda: f"report_{uuid.uuid4().hex[:8]}")
    sector_id: str
    reporter_name: str
    description: str  # "cheiro estranho", "barulho na esteira"
    category: str  # smell, noise, visual, other
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BehavioralReportCreate(BaseModel):
    sector_id: str
    reporter_name: str
    description: str
    category: str

class EmailRequest(BaseModel):
    recipient_email: EmailStr
    subject: str
    html_content: str

class RiskAnalysisRequest(BaseModel):
    sector_id: str

# ============== AUTH HELPERS ==============

async def get_current_user(request: Request) -> Optional[User]:
    """Get user from session token in cookie or Authorization header"""
    session_token = request.cookies.get("session_token")
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]
    
    if not session_token:
        return None
    
    session_doc = await db.user_sessions.find_one(
        {"session_token": session_token},
        {"_id": 0}
    )
    
    if not session_doc:
        return None
    
    expires_at = session_doc.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at < datetime.now(timezone.utc):
        return None
    
    user_doc = await db.users.find_one(
        {"user_id": session_doc["user_id"]},
        {"_id": 0}
    )
    
    if not user_doc:
        return None
    
    return User(**user_doc)

# ============== AUTH ROUTES ==============

@api_router.post("/auth/session")
async def create_session(request: Request, response: Response):
    """Exchange session_id for session_token"""
    body = await request.json()
    session_id = body.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    
    # Call Emergent Auth to get user data
    async with httpx.AsyncClient() as http_client:
        try:
            auth_response = await http_client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_id}
            )
            auth_response.raise_for_status()
            user_data = auth_response.json()
        except Exception as e:
            logger.error(f"Auth error: {e}")
            raise HTTPException(status_code=401, detail="Invalid session")
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    
    # Check if user exists
    existing_user = await db.users.find_one(
        {"email": user_data["email"]},
        {"_id": 0}
    )
    
    if existing_user:
        user_id = existing_user["user_id"]
    else:
        # Create new user
        new_user = {
            "user_id": user_id,
            "email": user_data["email"],
            "name": user_data["name"],
            "picture": user_data.get("picture"),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(new_user)
    
    # Create session
    session_token = user_data.get("session_token", f"session_{uuid.uuid4().hex}")
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60
    )
    
    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    return user_doc

@api_router.get("/auth/me")
async def get_me(request: Request):
    """Get current user from session"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user.model_dump()

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    """Logout user"""
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    response.delete_cookie("session_token", path="/")
    return {"message": "Logged out"}

# ============== SECTOR ROUTES ==============

@api_router.get("/sectors", response_model=List[Sector])
async def get_sectors():
    """Get all sectors"""
    sectors = await db.sectors.find({}, {"_id": 0}).to_list(100)
    return sectors

@api_router.post("/sectors", response_model=Sector)
async def create_sector(sector_data: SectorCreate):
    """Create a new sector"""
    sector = Sector(**sector_data.model_dump())
    doc = sector.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.sectors.insert_one(doc)
    return sector

@api_router.get("/sectors/{sector_id}", response_model=Sector)
async def get_sector(sector_id: str):
    """Get a specific sector"""
    sector = await db.sectors.find_one({"sector_id": sector_id}, {"_id": 0})
    if not sector:
        raise HTTPException(status_code=404, detail="Sector not found")
    return sector

@api_router.put("/sectors/{sector_id}/risk")
async def update_sector_risk(sector_id: str, risk_level: float, status: str):
    """Update sector risk level"""
    await db.sectors.update_one(
        {"sector_id": sector_id},
        {"$set": {"risk_level": risk_level, "status": status}}
    )
    return {"message": "Risk updated"}

# ============== SENSOR ROUTES ==============

@api_router.get("/sensors", response_model=List[Sensor])
async def get_sensors(sector_id: Optional[str] = None):
    """Get all sensors, optionally filtered by sector"""
    query = {"sector_id": sector_id} if sector_id else {}
    sensors = await db.sensors.find(query, {"_id": 0}).to_list(100)
    return sensors

@api_router.post("/sensors", response_model=Sensor)
async def create_sensor(sensor_data: SensorCreate):
    """Create a new sensor"""
    sensor = Sensor(**sensor_data.model_dump())
    doc = sensor.model_dump()
    doc["last_reading"] = doc["last_reading"].isoformat()
    await db.sensors.insert_one(doc)
    return sensor

@api_router.post("/sensors/{sensor_id}/reading")
async def record_sensor_reading(sensor_id: str, reading: SensorReading):
    """Record a sensor reading and update status"""
    sensor = await db.sensors.find_one({"sensor_id": sensor_id}, {"_id": 0})
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
    
    # Determine status based on thresholds
    status = "normal"
    if reading.value > sensor["max_threshold"]:
        status = "critical"
    elif reading.value > sensor["max_threshold"] * 0.8:
        status = "warning"
    elif reading.value < sensor["min_threshold"]:
        status = "critical"
    elif reading.value < sensor["min_threshold"] * 1.2:
        status = "warning"
    
    await db.sensors.update_one(
        {"sensor_id": sensor_id},
        {"$set": {
            "current_value": reading.value,
            "status": status,
            "last_reading": reading.timestamp.isoformat()
        }}
    )
    
    # Store reading history
    await db.sensor_readings.insert_one({
        "sensor_id": sensor_id,
        "value": reading.value,
        "timestamp": reading.timestamp.isoformat()
    })
    
    return {"status": status, "value": reading.value}

@api_router.get("/sensors/{sensor_id}/history")
async def get_sensor_history(sensor_id: str, limit: int = 50):
    """Get sensor reading history"""
    readings = await db.sensor_readings.find(
        {"sensor_id": sensor_id},
        {"_id": 0}
    ).sort("timestamp", -1).to_list(limit)
    return readings

# ============== ALERT ROUTES ==============

@api_router.get("/alerts", response_model=List[Alert])
async def get_alerts(status: Optional[str] = None, sector_id: Optional[str] = None):
    """Get all alerts"""
    query = {}
    if status:
        query["status"] = status
    if sector_id:
        query["sector_id"] = sector_id
    alerts = await db.alerts.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return alerts

@api_router.post("/alerts", response_model=Alert)
async def create_alert(alert_data: AlertCreate):
    """Create a new alert"""
    alert = Alert(**alert_data.model_dump())
    doc = alert.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    if doc["resolved_at"]:
        doc["resolved_at"] = doc["resolved_at"].isoformat()
    await db.alerts.insert_one(doc)
    return alert

@api_router.put("/alerts/{alert_id}/status")
async def update_alert_status(alert_id: str, status: str):
    """Update alert status"""
    update_data = {"status": status}
    if status == "resolved":
        update_data["resolved_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.alerts.update_one(
        {"alert_id": alert_id},
        {"$set": update_data}
    )
    return {"message": "Alert status updated"}

# ============== WORK ORDER ROUTES ==============

@api_router.get("/work-orders", response_model=List[WorkOrder])
async def get_work_orders(status: Optional[str] = None, sector_id: Optional[str] = None):
    """Get all work orders"""
    query = {}
    if status:
        query["status"] = status
    if sector_id:
        query["sector_id"] = sector_id
    orders = await db.work_orders.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return orders

@api_router.post("/work-orders", response_model=WorkOrder)
async def create_work_order(order_data: WorkOrderCreate):
    """Create a new work order"""
    order = WorkOrder(**order_data.model_dump())
    doc = order.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    if doc["due_date"]:
        doc["due_date"] = doc["due_date"].isoformat()
    if doc["completed_at"]:
        doc["completed_at"] = doc["completed_at"].isoformat()
    await db.work_orders.insert_one(doc)
    return order

@api_router.put("/work-orders/{order_id}/status")
async def update_work_order_status(order_id: str, status: str):
    """Update work order status"""
    update_data = {"status": status}
    if status == "completed":
        update_data["completed_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.work_orders.update_one(
        {"order_id": order_id},
        {"$set": update_data}
    )
    return {"message": "Work order status updated"}

# ============== CONTEXT VARIABLES ==============

@api_router.get("/context", response_model=ContextVariables)
async def get_context():
    """Get current context variables"""
    ctx = await db.context_variables.find_one({}, {"_id": 0}, sort=[("timestamp", -1)])
    if not ctx:
        # Return simulated context if none exists
        return ContextVariables()
    return ContextVariables(**ctx)

@api_router.post("/context", response_model=ContextVariables)
async def update_context(ctx: ContextVariables):
    """Update context variables"""
    doc = ctx.model_dump()
    doc["timestamp"] = doc["timestamp"].isoformat()
    await db.context_variables.insert_one(doc)
    return ctx

# ============== BEHAVIORAL REPORTS ==============

@api_router.get("/reports", response_model=List[BehavioralReport])
async def get_behavioral_reports(sector_id: Optional[str] = None):
    """Get behavioral reports"""
    query = {"sector_id": sector_id} if sector_id else {}
    reports = await db.behavioral_reports.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return reports

@api_router.post("/reports", response_model=BehavioralReport)
async def create_behavioral_report(report_data: BehavioralReportCreate):
    """Create a new behavioral report"""
    report = BehavioralReport(**report_data.model_dump())
    doc = report.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.behavioral_reports.insert_one(doc)
    return report

# ============== AI RISK ANALYSIS ==============

@api_router.post("/analyze-risk")
async def analyze_risk(request: RiskAnalysisRequest):
    """Use AI to analyze risk and generate prescriptive actions"""
    sector_id = request.sector_id
    
    # Gather all data for the sector
    sector = await db.sectors.find_one({"sector_id": sector_id}, {"_id": 0})
    if not sector:
        raise HTTPException(status_code=404, detail="Sector not found")
    
    sensors = await db.sensors.find({"sector_id": sector_id}, {"_id": 0}).to_list(50)
    reports = await db.behavioral_reports.find({"sector_id": sector_id}, {"_id": 0}).sort("created_at", -1).to_list(10)
    context = await db.context_variables.find_one({}, {"_id": 0}, sort=[("timestamp", -1)])
    
    if not context:
        context = ContextVariables().model_dump()
    
    # Prepare data for AI analysis
    sensor_data = "\n".join([
        f"- {s['name']} ({s['sensor_type']}): {s['current_value']}{s['unit']} (Status: {s['status']}, Max: {s['max_threshold']})"
        for s in sensors
    ])
    
    report_data = "\n".join([
        f"- {r['category']}: {r['description']} (by {r['reporter_name']})"
        for r in reports
    ]) or "Nenhum relato recente"
    
    prompt = f"""Você é o GuardianFire AI, um sistema de previsão de riscos industriais. Analise os dados abaixo e forneça uma análise prescritiva.

SETOR: {sector['name']}
NÍVEL DE RISCO ATUAL: {sector['risk_level']}%

DADOS DOS SENSORES:
{sensor_data}

RELATOS COMPORTAMENTAIS RECENTES:
{report_data}

CONTEXTO AMBIENTAL:
- Temperatura Externa: {context.get('temperature_external', 25)}°C
- Umidade: {context.get('humidity', 50)}%
- Carga das Máquinas: {context.get('machine_load', 70)}%
- Fadiga da Equipe: {context.get('team_fatigue', 30)}%
- Dias desde última manutenção: {context.get('last_maintenance_days', 7)}

Com base nesses dados, forneça em JSON:
{{
  "risk_score": <0-100>,
  "risk_status": "<safe|warning|critical>",
  "primary_concern": "<descrição curta do principal risco>",
  "prescribed_actions": [
    {{
      "priority": "<urgent|high|medium|low>",
      "action": "<ação específica>",
      "reason": "<motivo>",
      "estimated_time": "<tempo estimado>"
    }}
  ],
  "prediction": "<previsão do que pode acontecer se não agir>",
  "confidence": <0-100>
}}

Seja prescritivo e específico. Não diga apenas "risco alto", diga exatamente o que fazer."""

    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"risk_analysis_{sector_id}_{uuid.uuid4().hex[:8]}",
            system_message="Você é o GuardianFire AI, especialista em previsão de riscos industriais. Sempre responda em JSON válido."
        ).with_model("gemini", "gemini-3-flash-preview")
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        # Parse JSON response
        import json
        # Clean response if it has markdown code blocks
        response_text = response.strip()
        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]
        response_text = response_text.strip()
        
        analysis = json.loads(response_text)
        
        # Update sector risk level
        await db.sectors.update_one(
            {"sector_id": sector_id},
            {"$set": {
                "risk_level": analysis["risk_score"],
                "status": analysis["risk_status"]
            }}
        )
        
        # Create alerts for urgent actions
        for action in analysis.get("prescribed_actions", []):
            if action["priority"] in ["urgent", "high"]:
                alert = Alert(
                    sector_id=sector_id,
                    alert_type="prediction",
                    severity="critical" if action["priority"] == "urgent" else "high",
                    title=action["action"][:100],
                    description=action["reason"],
                    probability=analysis["confidence"],
                    prescribed_action=action["action"]
                )
                doc = alert.model_dump()
                doc["created_at"] = doc["created_at"].isoformat()
                doc["resolved_at"] = None
                await db.alerts.insert_one(doc)
        
        return analysis
        
    except Exception as e:
        logger.error(f"AI analysis error: {e}")
        # Return a simulated analysis
        return {
            "risk_score": sector.get("risk_level", 30),
            "risk_status": sector.get("status", "safe"),
            "primary_concern": "Análise automática indisponível",
            "prescribed_actions": [],
            "prediction": "Continuar monitoramento normal",
            "confidence": 50,
            "error": str(e)
        }

# ============== EMAIL NOTIFICATIONS ==============

@api_router.post("/send-alert-email")
async def send_alert_email(email_request: EmailRequest):
    """Send alert email via Resend"""
    if not resend.api_key or resend.api_key == "re_placeholder":
        return {"status": "skipped", "message": "Email not configured"}
    
    params = {
        "from": SENDER_EMAIL,
        "to": [email_request.recipient_email],
        "subject": email_request.subject,
        "html": email_request.html_content
    }
    
    try:
        email = await asyncio.to_thread(resend.Emails.send, params)
        return {
            "status": "success",
            "message": f"Email sent to {email_request.recipient_email}",
            "email_id": email.get("id")
        }
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")

# ============== DASHBOARD STATS ==============

@api_router.get("/dashboard/stats")
async def get_dashboard_stats():
    """Get dashboard statistics"""
    total_sectors = await db.sectors.count_documents({})
    total_sensors = await db.sensors.count_documents({})
    active_alerts = await db.alerts.count_documents({"status": "active"})
    pending_orders = await db.work_orders.count_documents({"status": "pending"})
    
    # Get sensors by status
    critical_sensors = await db.sensors.count_documents({"status": "critical"})
    warning_sensors = await db.sensors.count_documents({"status": "warning"})
    
    # Get sectors by status
    sectors = await db.sectors.find({}, {"_id": 0}).to_list(100)
    avg_risk = sum(s.get("risk_level", 0) for s in sectors) / max(len(sectors), 1)
    
    return {
        "total_sectors": total_sectors,
        "total_sensors": total_sensors,
        "active_alerts": active_alerts,
        "pending_orders": pending_orders,
        "critical_sensors": critical_sensors,
        "warning_sensors": warning_sensors,
        "average_risk": round(avg_risk, 1),
        "sectors": sectors
    }

# ============== SIMULATION / SEED DATA ==============

@api_router.post("/seed-demo-data")
async def seed_demo_data():
    """Seed demo data for testing"""
    # Clear existing data
    await db.sectors.delete_many({})
    await db.sensors.delete_many({})
    await db.alerts.delete_many({})
    await db.work_orders.delete_many({})
    await db.behavioral_reports.delete_many({})
    await db.context_variables.delete_many({})
    
    # Create sectors
    sectors_data = [
        {"name": "Setor A - Produção", "description": "Linha de produção principal", "risk_level": 25, "status": "safe"},
        {"name": "Setor B - Armazenamento", "description": "Área de armazenamento de materiais", "risk_level": 45, "status": "warning"},
        {"name": "Setor C - Elétrica", "description": "Subestação e painéis elétricos", "risk_level": 72, "status": "critical"},
        {"name": "Setor D - Caldeiras", "description": "Sistema de caldeiras e vapor", "risk_level": 38, "status": "warning"},
    ]
    
    created_sectors = []
    for s in sectors_data:
        sector = Sector(**s)
        doc = sector.model_dump()
        doc["created_at"] = doc["created_at"].isoformat()
        await db.sectors.insert_one(doc)
        created_sectors.append(sector)
    
    # Create sensors for each sector
    sensor_types = [
        {"type": "temperature", "unit": "°C", "min": 15, "max": 45},
        {"type": "vibration", "unit": "mm/s", "min": 0, "max": 10},
        {"type": "energy", "unit": "kW", "min": 0, "max": 500},
        {"type": "smoke", "unit": "ppm", "min": 0, "max": 50},
        {"type": "humidity", "unit": "%", "min": 30, "max": 80},
    ]
    
    for sector in created_sectors:
        for st in sensor_types:
            # Generate realistic values
            if sector.status == "critical":
                value = st["max"] * random.uniform(0.85, 1.1)
            elif sector.status == "warning":
                value = st["max"] * random.uniform(0.7, 0.85)
            else:
                value = st["max"] * random.uniform(0.3, 0.6)
            
            status = "normal"
            if value > st["max"]:
                status = "critical"
            elif value > st["max"] * 0.8:
                status = "warning"
            
            sensor = Sensor(
                sector_id=sector.sector_id,
                name=f"{st['type'].title()} - {sector.name[:10]}",
                sensor_type=st["type"],
                unit=st["unit"],
                current_value=round(value, 1),
                min_threshold=st["min"],
                max_threshold=st["max"],
                status=status
            )
            doc = sensor.model_dump()
            doc["last_reading"] = doc["last_reading"].isoformat()
            await db.sensors.insert_one(doc)
    
    # Create alerts for critical sector
    critical_sector = created_sectors[2]  # Setor C
    alerts_data = [
        {
            "sector_id": critical_sector.sector_id,
            "alert_type": "prediction",
            "severity": "critical",
            "title": "Risco de curto-circuito iminente",
            "description": "Consumo elétrico instável detectado. 2 relatos de estalos nas últimas 4 horas.",
            "probability": 92,
            "prescribed_action": "Interromper a máquina 04 por 20 minutos e substituir o contator X. Técnico notificado."
        },
        {
            "sector_id": created_sectors[1].sector_id,
            "alert_type": "prediction",
            "severity": "high",
            "title": "Acúmulo de poeira crítico",
            "description": "Sensor de partículas indicando 88% acima do normal. Temperatura do motor elevada.",
            "probability": 78,
            "prescribed_action": "Executar limpeza do setor em 30 minutos para resetar o risco."
        },
        {
            "sector_id": created_sectors[3].sector_id,
            "alert_type": "maintenance",
            "severity": "medium",
            "title": "Manutenção preventiva programada",
            "description": "15 dias desde última inspeção das caldeiras. Verificar válvulas de segurança.",
            "probability": 45,
            "prescribed_action": "Agendar inspeção para próximo turno."
        }
    ]
    
    for a in alerts_data:
        alert = Alert(**a)
        doc = alert.model_dump()
        doc["created_at"] = doc["created_at"].isoformat()
        doc["resolved_at"] = None
        await db.alerts.insert_one(doc)
    
    # Create work orders
    orders_data = [
        {
            "sector_id": critical_sector.sector_id,
            "title": "Substituição do contator X - Máquina 04",
            "description": "Substituir contator danificado detectado pela análise preditiva.",
            "priority": "urgent",
            "assigned_to": "Carlos Silva"
        },
        {
            "sector_id": created_sectors[1].sector_id,
            "title": "Limpeza de emergência - Setor B",
            "description": "Remover acúmulo de poeira detectado pelos sensores.",
            "priority": "high",
            "assigned_to": "Equipe Manutenção"
        }
    ]
    
    for o in orders_data:
        order = WorkOrder(**o)
        doc = order.model_dump()
        doc["created_at"] = doc["created_at"].isoformat()
        doc["due_date"] = None
        doc["completed_at"] = None
        await db.work_orders.insert_one(doc)
    
    # Create behavioral reports
    reports_data = [
        {"sector_id": critical_sector.sector_id, "reporter_name": "João", "description": "Ouvi estalos vindos do painel elétrico", "category": "noise"},
        {"sector_id": critical_sector.sector_id, "reporter_name": "Maria", "description": "Cheiro de queimado perto da máquina 04", "category": "smell"},
        {"sector_id": created_sectors[1].sector_id, "reporter_name": "Pedro", "description": "Muita poeira acumulada nas caixas", "category": "visual"},
    ]
    
    for r in reports_data:
        report = BehavioralReport(**r)
        doc = report.model_dump()
        doc["created_at"] = doc["created_at"].isoformat()
        await db.behavioral_reports.insert_one(doc)
    
    # Create context variables (simulating hot, dry day with high load)
    context = ContextVariables(
        temperature_external=32.0,
        humidity=35.0,
        machine_load=95.0,
        team_fatigue=65.0,
        last_maintenance_days=12
    )
    doc = context.model_dump()
    doc["timestamp"] = doc["timestamp"].isoformat()
    await db.context_variables.insert_one(doc)
    
    return {"message": "Demo data seeded successfully", "sectors": len(created_sectors)}

# ============== HEALTH CHECK ==============

@api_router.get("/")
async def root():
    return {"message": "GuardianFire AI API", "status": "online"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
