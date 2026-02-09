export const exportToCSV = (logs: any[]) => {
    const headers = ["Timestamp", "Method", "Path", "IP Address", "Location", "Severity", "Threat Vector", "Threat Score", "Entropy"];
    const rows = logs.map(log => [
        new Date(log.timestamp).toISOString(),
        log.method,
        log.path,
        log.ipAddress,
        log.location,
        log.severityLevel,
        log.threatVector || 'NONE',
        log.threatScore || 0,
        log.shannonEntropy
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security_logs_${new Date().getTime()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
};
