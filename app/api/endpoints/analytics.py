from fastapi import APIRouter, Depends
from typing import List
from app.analytics.stats import StatisticalAnalyzer
# import schemas and db dependency

router = APIRouter()

@router.get("/summary")
async def get_analytics_summary():
    """
    Returns high-level analytics summary.
    """
    # Mock data for demonstration
    mock_data = [
        {"crawler": "Googlebot", "response_time": 120},
        {"crawler": "Googlebot", "response_time": 130},
        {"crawler": "Googlebot", "response_time": 125},
        {"crawler": "GPTBot", "response_time": 45},
        {"crawler": "GPTBot", "response_time": 50},
        {"crawler": "GPTBot", "response_time": 48},
    ]
    
    analysis = StatisticalAnalyzer.analyze_crawler_performance(mock_data)
    return analysis

@router.get("/realtime")
async def get_realtime_metrics():
    """
    Returns real-time metrics (can be polled by frontend if WS fails).
    """
    return {"active_crawlers": 5, "requests_per_second": 12}
