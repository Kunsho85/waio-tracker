from typing import List, Dict, Any
from datetime import datetime
from app.analytics.stats import StatisticalAnalyzer

class DailyReportGenerator:
    def __init__(self):
        self.stats_analyzer = StatisticalAnalyzer()

    def generate_text_report(self, visits: List[Dict[str, Any]]) -> str:
        """
        Generates a text-based daily report from a list of visit dictionaries.
        """
        total_visits = len(visits)
        crawlers = {}
        response_times = []

        for v in visits:
            agent = v.get('crawler', 'Unknown')
            crawlers[agent] = crawlers.get(agent, 0) + 1
            if 'response_time' in v:
                response_times.append(v['response_time'])

        # Performance Analysis (Mocking groups for demo)
        google_times = [v['response_time'] for v in visits if v.get('crawler') == 'Googlebot' and 'response_time' in v]
        gpt_times = [v['response_time'] for v in visits if v.get('crawler') == 'GPTBot' and 'response_time' in v]
        
        perf_stats = self.stats_analyzer.calculate_ttest(google_times, gpt_times)

        report = f"""
========================================
WAIO DAILY CRAWLER REPORT
Date: {datetime.now().strftime('%Y-%m-%d')}
========================================

SUMMARY
-------
Total Visits: {total_visits}
Avg Response Time: {sum(response_times)/len(response_times) if response_times else 0:.2f}ms

CRAWLER BREAKDOWN
-----------------
"""
        for agent, count in crawlers.items():
            report += f"{agent}: {count} ({count/total_visits*100:.1f}%)\n"

        report += f"""
PERFORMANCE INSIGHTS
--------------------
Googlebot vs GPTBot:
  - Googlebot Mean: {sum(google_times)/len(google_times) if google_times else 0:.2f}ms
  - GPTBot Mean: {sum(gpt_times)/len(gpt_times) if gpt_times else 0:.2f}ms
  - Statistically Significant Diff: {'YES' if perf_stats['significant'] else 'NO'} (p={perf_stats['p_value']:.4f})

RECOMMENDATIONS
---------------
"""
        if perf_stats['significant']:
            report += "- Investigate performance disparity between bot types.\n"
        
        if total_visits == 0:
            report += "- No traffic detected. Verify server reachability.\n"
        elif total_visits < 10:
            report += "- Low traffic volume. Consider submitting sitemap.\n"
        else:
            report += "- Traffic levels normal.\n"

        return report
