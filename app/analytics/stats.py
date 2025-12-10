import numpy as np
from scipy import stats
from typing import List, Dict, Any

class StatisticalAnalyzer:
    @staticmethod
    def calculate_ttest(control_group: List[float], test_group: List[float]) -> Dict[str, float]:
        """
        Performs an independent t-test between two groups.
        Returns t-statistic and p-value.
        """
        if len(control_group) < 2 or len(test_group) < 2:
            return {"t_stat": 0.0, "p_value": 1.0, "significant": False}
            
        t_stat, p_value = stats.ttest_ind(control_group, test_group)
        
        return {
            "t_stat": float(t_stat),
            "p_value": float(p_value),
            "significant": p_value < 0.05
        }

    @staticmethod
    def calculate_effect_size(control_group: List[float], test_group: List[float]) -> float:
        """
        Calculates Cohen's d effect size.
        """
        if len(control_group) < 2 or len(test_group) < 2:
            return 0.0
            
        mean1, mean2 = np.mean(control_group), np.mean(test_group)
        std1, std2 = np.std(control_group, ddof=1), np.std(test_group, ddof=1)
        
        n1, n2 = len(control_group), len(test_group)
        pooled_std = np.sqrt(((n1 - 1) * std1**2 + (n2 - 1) * std2**2) / (n1 + n2 - 2))
        
        if pooled_std == 0:
            return 0.0
            
        return float((mean1 - mean2) / pooled_std)

    @staticmethod
    def analyze_crawler_performance(data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyzes performance metrics for different crawlers.
        """
        # Mock implementation for data processing
        # In reality, this would group by crawler type from DB models
        
        # Example structure
        google_times = [x['response_time'] for x in data if x['crawler'] == 'Googlebot']
        gpt_times = [x['response_time'] for x in data if x['crawler'] == 'GPTBot']
        
        ttest = StatisticalAnalyzer.calculate_ttest(google_times, gpt_times)
        effect_size = StatisticalAnalyzer.calculate_effect_size(google_times, gpt_times)
        
        return {
            "comparison": "Googlebot vs GPTBot",
            "metrics": {
                "google_mean": float(np.mean(google_times)) if google_times else 0,
                "gpt_mean": float(np.mean(gpt_times)) if gpt_times else 0,
                "diff_percent": 0 # TODO calculate
            },
            "statistics": {
                "p_value": ttest["p_value"],
                "significant": ttest["significant"],
                "effect_size": effect_size
            }
        }
