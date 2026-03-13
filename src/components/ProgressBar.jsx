export default function ProgressBar({ value, max, label, rightLabel, color }) {
    const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;

    // Auto-color based on percentage if no override
    let colorClass = color;
    if (!colorClass) {
        if (pct >= 80) colorClass = 'green';
        else if (pct >= 50) colorClass = 'yellow';
        else colorClass = 'red';
    }

    return (
        <div className="progress-wrap">
            {(label || rightLabel) && (
                <div className="progress-label">
                    <span>{label}</span>
                    <span>{rightLabel}</span>
                </div>
            )}
            <div className="progress-track">
                <div
                    className={`progress-fill ${colorClass}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}
