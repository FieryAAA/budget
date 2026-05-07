export default function ProgressBar({ value, max, label, rightLabel, color }) {
    const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;

    let colorClass = color;
    if (!colorClass) {
        if (pct >= 80)      colorClass = 'green';
        else if (pct >= 50) colorClass = 'yellow';
        else                colorClass = 'red';
    }

    return (
        <div
            className="progress-wrap"
            role="progressbar"
            aria-valuenow={Math.round(pct)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={label || 'Progress'}
        >
            {(label || rightLabel) && (
                <div className="progress-label">
                    <span>{label}</span>
                    <span className="mono">{rightLabel}</span>
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
