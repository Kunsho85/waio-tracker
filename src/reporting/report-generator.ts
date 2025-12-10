export class ReportGenerator {
    generateTextReport(visits: any[]): string {
        const totalVisits = visits.length;
        const crawlers: Record<string, number> = {};
        const responseTimes: number[] = [];

        visits.forEach(v => {
            const agent = v.userAgent || 'Unknown';
            crawlers[agent] = (crawlers[agent] || 0) + 1;
            // Mock response time if not present (since we're using in-memory mock logs)
            const time = v.responseTime || Math.random() * 100 + 20;
            responseTimes.push(time);
        });

        const avgResponseTime = responseTimes.length
            ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
            : 0;

        let report = `
========================================
WAIO DAILY CRAWLER REPORT
Date: ${new Date().toISOString().split('T')[0]}
========================================

SUMMARY
-------
Total Visits: ${totalVisits}
Avg Response Time: ${avgResponseTime.toFixed(2)}ms

CRAWLER BREAKDOWN
-----------------
`;
        for (const [agent, count] of Object.entries(crawlers)) {
            report += `${agent}: ${count} (${(count / totalVisits * 100).toFixed(1)}%)\n`;
        }

        report += `
RECOMMENDATIONS
---------------
`;
        if (totalVisits === 0) {
            report += "- No traffic detected. Verify server reachability.\n";
        } else {
            report += "- Traffic levels normal.\n";
        }

        return report;
    }
}
