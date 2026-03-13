import { useState } from 'react';
import { useStore } from '../store';

export default function IncomeEvents() {
    const { state, dispatch } = useStore();
    const { incomeEvents, goals, cash, settings } = state;
    const cur = settings.currency;

    const [source, setSource] = useState('');
    const [amount, setAmount] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [lastIncome, setLastIncome] = useState(null);

    function handleAdd(e) {
        e.preventDefault();
        const val = parseFloat(amount);
        if (!source.trim() || !val || val <= 0) return;
        dispatch({ type: 'ADD_INCOME', source: source.trim(), amount: val });
        setLastIncome({ source: source.trim(), amount: val });
        setSource('');
        setAmount('');
        setShowSuggestions(true);
    }

    // Allocation suggestions from goals
    const bufferGoal = goals.find(g => g.isBuffer && g.saved < g.target);
    const recurringGoals = goals.filter(g => g.isRecurring && g.saved < g.target);
    const priorityGoals = goals
        .filter(g => !g.isBuffer && !g.isRecurring && g.saved < g.target)
        .sort((a, b) => {
            const p = { High: 0, Medium: 1, Low: 2 };
            return p[a.priority] - p[b.priority];
        });

    return (
        <div>
            <div className="section-title">💵 Income Events</div>

            {/* Add Income */}
            <div className="card">
                <div className="card-title">Log Income</div>
                <form onSubmit={handleAdd}>
                    <div className="input-row">
                        <input type="text" placeholder="Source (e.g. Salary)" value={source} onChange={e => setSource(e.target.value)} />
                        <input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} min="0" style={{ maxWidth: 120 }} />
                        <button className="btn btn-primary" type="submit">+</button>
                    </div>
                </form>
                <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                    {['Salary', 'Freelance', 'Gift', 'Refund', 'Bonus'].map(s => (
                        <button key={s} className="btn btn-sm btn-ghost" onClick={() => setSource(s)} style={{ fontSize: '0.7rem' }}>{s}</button>
                    ))}
                </div>
            </div>

            {/* Allocation Suggestions */}
            {showSuggestions && lastIncome && (
                <div className="card" style={{ borderColor: 'rgba(34,197,94,0.3)' }}>
                    <div className="card-title"><span className="icon">🧠</span> Allocation Suggestions</div>
                    <div className="card-sub mb-12">
                        You just received {lastIncome.amount.toLocaleString()} {cur} from {lastIncome.source}. Allocate wisely:
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {bufferGoal && (
                            <div className="alert alert-warning" style={{ marginBottom: 0 }}>
                                <span>🛡️</span>
                                <div>
                                    <strong>1. Rebuild Safety Buffer</strong><br />
                                    {(bufferGoal.target - bufferGoal.saved).toLocaleString()} {cur} short of {bufferGoal.target.toLocaleString()} {cur} target.
                                </div>
                            </div>
                        )}

                        {recurringGoals.map((g, i) => (
                            <div key={g.id} className="alert alert-info" style={{ marginBottom: 0 }}>
                                <span>🔄</span>
                                <div>
                                    <strong>{bufferGoal ? i + 2 : i + 1}. Fund {g.name}</strong><br />
                                    {(g.target - g.saved).toLocaleString()} {cur} remaining for next payment.
                                </div>
                            </div>
                        ))}

                        {priorityGoals.length > 0 && (
                            <div className="alert alert-success" style={{ marginBottom: 0 }}>
                                <span>🎯</span>
                                <div>
                                    <strong>{(bufferGoal ? 1 : 0) + recurringGoals.length + 1}. Fund Goals</strong><br />
                                    Top priority: {priorityGoals[0].name} ({(priorityGoals[0].target - priorityGoals[0].saved).toLocaleString()} {cur} left)
                                </div>
                            </div>
                        )}

                        {!bufferGoal && recurringGoals.length === 0 && priorityGoals.length === 0 && (
                            <div className="alert alert-success" style={{ marginBottom: 0 }}>
                                <span>🎉</span>
                                <span>All goals are funded! Your cash is free to use.</span>
                            </div>
                        )}
                    </div>

                    <button className="btn btn-sm btn-ghost mt-12" onClick={() => setShowSuggestions(false)}>Dismiss</button>
                </div>
            )}

            {/* Income History */}
            <div className="card">
                <div className="card-title">Income History</div>
                {incomeEvents.length === 0 ? (
                    <div className="empty-state">
                        <div className="icon">💵</div>
                        <div>No income logged yet</div>
                    </div>
                ) : (
                    incomeEvents.slice(0, 20).map(inc => (
                        <div key={inc.id} className="list-item">
                            <div className="list-item-info">
                                <div className="list-item-name">{inc.source}</div>
                                <div className="list-item-meta">{new Date(inc.date).toLocaleDateString()}</div>
                            </div>
                            <span className="text-green" style={{ fontWeight: 700, fontSize: '0.9rem' }}>+{inc.amount.toLocaleString()} {cur}</span>
                        </div>
                    ))
                )}
            </div>

            {/* Totals */}
            <div className="card">
                <div className="mini-grid">
                    <div className="mini-card">
                        <div className="label">Total Earned</div>
                        <div className="value text-green">{incomeEvents.reduce((s, i) => s + i.amount, 0).toLocaleString()}</div>
                    </div>
                    <div className="mini-card">
                        <div className="label">Cash on Hand</div>
                        <div className="value">{cash.toLocaleString()}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
