from fastapi import APIRouter
from typing import List, Dict, Any
from app.reporting.daily_report import DailyReportGenerator
import random

router = APIRouter()
report_generator = DailyReportGenerator()

@router.get("/daily")
async def get_daily_report():
    """
    Generates a daily report based on recent traffic (Mocked data for now).
    """
    # Mock data generation since we don't have a DB query handy in this context
    # In prod, this would `await db.execute(select(Visit)...)`
    mock_visits = []
    
    # Generate some Googlebot visits
    for _ in range(random.randint(50, 150)):
        mock_visits.append({
            "crawler": "Googlebot",
            "response_time": random.normalvariate(120, 20),
            "path": "/blog/post-1"
        })
        
    # Generate some GPTBot visits
    for _ in range(random.randint(30, 80)):
        mock_visits.append({
            "crawler": "GPTBot",
            "response_time": random.normalvariate(45, 10), # Faster because blocked? or optimized?
            "path": "/products/123"
        })

    # Generate random others
    for _ in range(random.randint(10, 30)):
        mock_visits.append({
            "crawler": "Bingbot",
            "response_time": random.normalvariate(200, 50),
            "path": "/"
        })

    report_text = report_generator.generate_text_report(mock_visits)
    
    return {
        "date": "2023-10-27", # Dynamic in real app ofc
        "format": "text",
        "content": report_text
    }
