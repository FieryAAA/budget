import { useState } from 'react';
import { useStore, calculateBufferTarget, monthlyEssentials, calcTopUpAmount } from '../store';
import ProgressBar from './ProgressBar';
import GoalCard from './GoalCard';

export default function Dashboard({ onTabChange }) {
    const { state, dispatch } = useStore();
    const { balance, cash, monthly, goals, safetyMonths, monthlyTransferred, settings } = state;
    const cur = settings.currency;

    const [toast, setToast] = useState(null);

    const bufferGoal = goals.find(g => g.isBuffer);
    const totalAllocated = goals.reduce((s, g) => s + g.saved, 0);
    const totalTargets = goals.reduce((s, g) => s + g.target, 0);
    const spendPct = monthly.budget > 0 ? (monthly.spent / monthly.budget) * 100 : 0;
    const essentials = monthlyEssentials(state);
    const balancePct = essentials > 0 ? (balance / essentials) * 100 : 0;
    const topUpAmt = calcTopUpAmount(state);
    const day = new Date().getDate();

    const topGoals = goals
        .filter(g => !g.isBuffer && g.saved < g.target)
        .sort((a, b) => ({ High: 0, Medium: 1, Low: 2 }[a.priority] - { High: 0, Medium: 1, Low: 2 }[b.priority]))
        .slice(0, 3);
    const readyGoals = goals.filter(g => !g.isBuffer && !g.isRecurring && g.saved >= g.target);

    function handleTopUp() {
        dispatch({ type: 'TOP_UP_BALANCE' });
        if (topUpAmt > 0) {
            setToast(`Transferred ${topUpAmt} ${cur} from Buffer to Current Balance`);
            setTimeout(() => setToast(null), 4000);
        } else {
            setToast('Buffer is empty — add income first');
            setTimeout(() => setToast(null), 3000);
        }
    }

    return (
        <div>
            {/* Toast */}
            {toast && (
                <div style={{
                    position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
                    background: 'var(--card-bg)', border: '1px solid var(--green)',
                    borderRadius: 12, padding: '10px 18px', zIndex: 1000,
                    fontSize: '0.82rem', color: 'var(--green)', boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
                    whiteSpace: 'nowrap',
                }}>
                    ✅ {toast}
                </div>
            )}

            {/* ── CURRENT BALANCE ─────────────────────────────────────────── */}
            <div className="card" style={balance < 30 && balance > 0 ? { borderColor: 'rgba(234,179,8,0.4)' } : {}}>
                <div className="flex-between mb-4">
                    <div className="card-title"><span className="icon">💳</span> Current Balance</div>
                    <button
                        className={`btn btn-sm ${topUpAmt > 0 ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={handleTopUp}
                        style={{ fontSize: '0.68rem' }}
                    >
                        ↑ Top Up from Buffer
                    </button>
                </div>
                <div className="card-value" style={{ color: balance < 30 ? 'var(--yellow)' : 'var(--green)' }}>
                    {balance.toLocaleString()} {cur}
                </div>
                <ProgressBar
                    value={balance}
                    max={essentials}
                    label={`${Math.round(balancePct)}% of month covered`}
                    rightLabel={`Goal: ${essentials} ${cur}`}
                    color={balancePct >= 80 ? 'green' : balancePct >= 40 ? 'yellow' : 'red'}
                />
                {monthly.spent > 0 && (
                    <div className="card-sub mt-8">
                        🛒 Spent this month: <strong>{monthly.spent.toLocaleString()} {cur}</strong>
                    </div>
                )}
                {balance < 30 && balance >= 0 && (
                    <div className="alert alert-warning mt-8" style={{ marginBottom: 0 }}>
                        <span>⚠️</span>
                        <span>Balance is low! Top up from Buffer or log new income.</span>
                    </div>
                )}
                {monthlyTransferred > 0 && (
                    <div className="card-sub mt-4" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.68rem' }}>
                        Buffer → Balance this month: {monthlyTransferred} {cur}
                        {day <= 14 ? ` · Day ${day} (First half: target ${Math.round(essentials / 2)} ${cur})` : ` · Day ${day} (Second half)`}
                    </div>
                )}
            </div>

            {/* Free cash alert */}
            {cash > 0 && (
                <div className="alert alert-info mt-12" style={{ cursor: 'pointer' }} onClick={() => onTabChange('income')}>
                    <span>🧠</span>
                    <span>You have <strong>{cash} {cur}</strong> unallocated. <strong>Allocate it →</strong></span>
                </div>
            )}

            {/* ── BUFFER ──────────────────────────────────────────────────── */}
            {bufferGoal && (
                <div className="card mt-12">
                    <div className="flex-between mb-4">
                        <div className="card-title"><span className="icon">🛡️</span> Safety Buffer</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span className="text-muted" style={{ fontSize: '0.65rem' }}>Cover:</span>
                            <select
                                value={safetyMonths}
                                onChange={e => dispatch({ type: 'SET_SAFETY_MONTHS', value: parseInt(e.target.value) })}
                                style={{ background: 'var(--card-bg)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, color: '#fff', padding: '2px 6px', fontSize: '0.7rem', cursor: 'pointer' }}
                            >
                                {[2, 3, 4, 5, 6].map(m => <option key={m} value={m}>{m} months</option>)}
                            </select>
                        </div>
                    </div>
                    <ProgressBar
                        value={bufferGoal.saved}
                        max={bufferGoal.target}
                        label={`${bufferGoal.saved.toLocaleString()} ${cur}`}
                        rightLabel={`Target: ${bufferGoal.target.toLocaleString()} ${cur}`}
                        color={bufferGoal.saved >= bufferGoal.target ? 'green' : bufferGoal.saved / bufferGoal.target > 0.5 ? 'yellow' : 'red'}
                    />
                    <div className="card-sub mt-8">
                        {bufferGoal.saved >= bufferGoal.target
                            ? <span className="text-green">✅ Buffer fully funded ({safetyMonths} months of essentials)</span>
                            : <span style={{ color: 'var(--red)' }}>⚠️ {(bufferGoal.target - bufferGoal.saved).toLocaleString()} {cur} to reach safety target</span>
                        }
                    </div>
                </div>
            )}

            {/* ── MONTHLY ESSENTIALS ──────────────────────────────────────── */}
            <div className="card mt-12">
                <div className="card-title"><span className="icon">🛒</span> Monthly Essentials</div>
                <div className="mini-grid">
                    <div className="mini-card"><div className="label">Survival</div><div className="value">{monthly.budget} {cur}</div></div>
                    <div className="mini-card"><div className="label">Gym / Recurring</div><div className="value">{essentials - monthly.budget} {cur}</div></div>
                    <div className="mini-card"><div className="label">Total</div><div className="value text-blue">{essentials} {cur}</div></div>
                </div>
            </div>

            {/* ── READY TO BUY ─────────────────────────────────────────────── */}
            {readyGoals.length > 0 && (
                <>
                    <div className="section-title">🎁 Ready to Buy</div>
                    {readyGoals.map(goal => <GoalCard key={goal.id} goal={goal} compact />)}
                </>
            )}

            {/* ── NEXT PRIORITIES ─────────────────────────────────────────── */}
            {topGoals.length > 0 && (
                <>
                    <div className="section-title">🎯 Next Priorities</div>
                    {topGoals.map(goal => <GoalCard key={goal.id} goal={goal} compact />)}
                </>
            )}

            {/* ── SAVING HEALTH ───────────────────────────────────────────── */}
            {totalTargets > 0 && (
                <div className="card mt-24" style={{ background: 'rgba(59,130,246,0.05)', border: '1px dashed rgba(59,130,246,0.3)' }}>
                    <div className="card-title" style={{ fontSize: '0.8rem', opacity: 0.7 }}>Overall Goal Progress</div>
                    <ProgressBar
                        value={totalAllocated}
                        max={totalTargets}
                        label={`${Math.round((totalAllocated / totalTargets) * 100)}% funded`}
                        color="blue"
                    />
                </div>
            )}
        </div>
    );
}
