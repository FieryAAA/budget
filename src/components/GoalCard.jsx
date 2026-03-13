import { useState } from 'react';
import { useStore, getMonthlySaving } from '../store';
import ProgressBar from './ProgressBar';

export default function GoalCard({ goal, compact = false }) {
    const { state, dispatch } = useStore();
    const { cash, settings } = state;
    const cur = settings.currency;

    const [fundAmt, setFundAmt] = useState('');
    const [withdrawAmt, setWithdrawAmt] = useState('');
    const [mode, setMode] = useState(null); // 'fund' | 'withdraw' | null

    const remaining = Math.max(0, goal.target - goal.saved);
    const pct = goal.target > 0 ? Math.round((goal.saved / goal.target) * 100) : 0;
    const isFunded = remaining <= 0;
    const plan = getMonthlySaving(goal);

    // Color based on funding
    const barColor = isFunded ? 'green' : pct >= 50 ? 'yellow' : 'red';
    const pctColor = isFunded ? 'var(--green)' : pct >= 50 ? 'var(--yellow)' : 'var(--red)';

    function handleFund(e) {
        e.preventDefault();
        const val = parseFloat(fundAmt);
        if (!val || val <= 0) return;
        dispatch({ type: 'FUND_GOAL', id: goal.id, amount: val });
        setFundAmt('');
        setMode(null);
    }

    function handleWithdraw(e) {
        e.preventDefault();
        const val = parseFloat(withdrawAmt);
        if (!val || val <= 0) return;
        dispatch({ type: 'WITHDRAW_GOAL', id: goal.id, amount: val });
        setWithdrawAmt('');
        setMode(null);
    }

    // Compact mode for dashboard
    if (compact) {
        return (
            <div className="card" style={isFunded ? { borderColor: 'rgba(34,197,94,0.3)' } : {}}>
                <div className="flex-between">
                    <div>
                        <div className="list-item-name" style={{ fontSize: '0.9rem' }}>
                            {goal.isBuffer ? '🛡️' : goal.isRecurring ? '🔄' : '🎯'} {goal.name}
                        </div>
                        <div className="list-item-meta" style={{ marginTop: 3 }}>
                            <span className={`badge ${goal.priority.toLowerCase()}`}>{goal.priority}</span>
                            {goal.isRecurring && <span className="badge essential">Recurring</span>}
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: pctColor }}>{pct}%</div>
                        <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                            {goal.saved.toLocaleString()} / {goal.target.toLocaleString()}
                        </div>
                    </div>
                </div>
                <ProgressBar value={goal.saved} max={goal.target} color={barColor} />
            </div>
        );
    }

    return (
        <div className="card" style={isFunded ? { borderColor: 'rgba(34,197,94,0.3)' } : {}}>
            {/* Header */}
            <div className="flex-between">
                <div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                        {goal.isBuffer ? '🛡️' : goal.isRecurring ? '🔄' : '🎯'}
                        {goal.name}
                        {isFunded && <span style={{ color: 'var(--green)', fontSize: '0.85rem' }}>✅</span>}
                    </div>
                    <div className="list-item-meta" style={{ marginTop: 4 }}>
                        <span className={`badge ${goal.priority.toLowerCase()}`}>{goal.priority}</span>
                        <span className={`badge ${goal.category.toLowerCase()}`}>{goal.category}</span>
                        {goal.isRecurring && <span className="badge essential">Monthly: {goal.monthlyCost} {cur}</span>}
                        {goal.targetDate && <span>📅 {goal.targetDate}</span>}
                    </div>
                </div>
                <div style={{ textAlign: 'right', minWidth: 80 }}>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: pctColor }}>{pct}%</div>
                    {!goal.isBuffer && !goal.isRecurring && (
                        <button
                            className="btn btn-sm btn-danger mt-8"
                            onClick={() => dispatch({ type: 'DELETE_GOAL', id: goal.id })}
                            style={{ fontSize: '0.65rem' }}
                        >
                            Remove
                        </button>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="mini-grid mt-12" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                <div className="mini-card">
                    <div className="label">Target</div>
                    <div className="value" style={{ fontSize: '1rem' }}>{goal.target.toLocaleString()}</div>
                </div>
                <div className="mini-card">
                    <div className="label">Saved</div>
                    <div className="value" style={{ fontSize: '1rem', color: 'var(--green)' }}>{goal.saved.toLocaleString()}</div>
                </div>
                <div className="mini-card">
                    <div className="label">Left</div>
                    <div className="value" style={{ fontSize: '1rem', color: remaining > 0 ? 'var(--yellow)' : 'var(--green)' }}>{remaining.toLocaleString()}</div>
                </div>
            </div>

            {/* Progress */}
            <ProgressBar
                value={goal.saved}
                max={goal.target}
                label={`${pct}% funded`}
                rightLabel={isFunded ? '✅ Ready!' : `${remaining.toLocaleString()} ${cur} left`}
                color={barColor}
            />

            {/* Saving Plan */}
            {plan && !isFunded && (
                <div className={`alert ${plan.status === 'overdue' ? 'alert-danger' : 'alert-info'} mt-8`} style={{ marginBottom: 0 }}>
                    <span>{plan.status === 'overdue' ? '🚨' : '📆'}</span>
                    <span>
                        {plan.status === 'overdue'
                            ? `Behind schedule! Target date passed. Still need ${plan.needed.toLocaleString()} ${cur}.`
                            : `Save ${plan.needed.toLocaleString()} ${cur}/month for ${plan.months} months to stay on track.`
                        }
                    </span>
                </div>
            )}

            {/* Recurring status */}
            {goal.isRecurring && (
                <div className={`alert ${goal.saved >= goal.monthlyCost ? 'alert-success' : 'alert-warning'} mt-8`} style={{ marginBottom: 0 }}>
                    <span>{goal.saved >= goal.monthlyCost ? '✅' : '⚠️'}</span>
                    <span>
                        {goal.saved >= goal.monthlyCost
                            ? 'Next payment is fully funded!'
                            : `${(goal.monthlyCost - goal.saved).toLocaleString()} ${cur} needed to fund next payment.`
                        }
                    </span>
                </div>
            )}

            {/* Action Buttons */}
            {!isFunded && (
                <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                    <button
                        className={`btn btn-sm ${mode === 'fund' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setMode(mode === 'fund' ? null : 'fund')}
                    >
                        + Fund
                    </button>
                    {goal.saved > 0 && (
                        <button
                            className={`btn btn-sm ${mode === 'withdraw' ? 'btn-danger' : 'btn-ghost'}`}
                            onClick={() => setMode(mode === 'withdraw' ? null : 'withdraw')}
                        >
                            − Withdraw
                        </button>
                    )}
                </div>
            )}

            {/* Fund Form */}
            {mode === 'fund' && (
                <form onSubmit={handleFund} className="input-row mt-8">
                    <input
                        type="number"
                        placeholder={`Max ${Math.min(remaining, cash)}`}
                        value={fundAmt}
                        onChange={e => setFundAmt(e.target.value)}
                        min="0"
                        max={Math.min(remaining, cash)}
                        autoFocus
                    />
                    <button className="btn btn-sm btn-primary" type="submit">Add</button>
                </form>
            )}

            {/* Withdraw Form */}
            {mode === 'withdraw' && (
                <form onSubmit={handleWithdraw} className="input-row mt-8">
                    <input
                        type="number"
                        placeholder={`Max ${goal.saved}`}
                        value={withdrawAmt}
                        onChange={e => setWithdrawAmt(e.target.value)}
                        min="0"
                        max={goal.saved}
                        autoFocus
                    />
                    <button className="btn btn-sm btn-danger" type="submit">Withdraw</button>
                </form>
            )}
        </div>
    );
}
