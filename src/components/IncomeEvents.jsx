import { useState } from 'react';
import { useStore } from '../store';

export default function IncomeEvents() {
    const { state, dispatch } = useStore();
    const { incomeEvents, goals, cash, settings } = state;
    const cur = settings.currency;

    const [source, setSource] = useState('');
    const [amount, setAmount] = useState('');
    const [draft, setDraft] = useState(null);

    function previewAllocation(incAmount) {
        let pool = incAmount;
        const suggestion = { survival: 0, installments: [], priorities: [], cash: 0, total: incAmount };

        const buffer = goals.find(g => g.isBuffer);
        const essentials = state.monthly.budget + goals.filter(g => g.isRecurring).reduce((s, g) => s + (g.monthlyCost || 0), 0);

        // 1. Survival
        if (buffer) {
            const neededForSurvival = Math.max(0, essentials - buffer.saved);
            const toSurvival = Math.min(neededForSurvival, pool);
            suggestion.survival = toSurvival; pool -= toSurvival;
        }

        // 2. Installments
        goals.filter(g => !g.isBuffer && g.saved < g.target).forEach(g => {
            const plan = state.goals.find(goal => goal.id === g.id); // Refresh via state
            const targetDate = g.targetDate;
            if (targetDate) {
                // Manual calc for preview parity
                const now = new Date();
                const curMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                const [tYear, tMonth] = targetDate.split('-');
                const targetDateObj = new Date(parseInt(tYear, 10), parseInt(tMonth, 10) - 1, 1);
                const diff = (targetDateObj.getFullYear() - curMonth.getFullYear()) * 12 + (targetDateObj.getMonth() - curMonth.getMonth());
                if (diff >= 0) {
                    const inst = Math.ceil((g.target - g.saved) / (diff + 1));
                    const take = Math.min(inst, pool);
                    if (take > 0) { suggestion.installments.push({ name: g.name, amount: take }); pool -= take; }
                }
            }
        });

        // 3. Priorities
        const pOrder = { High: 0, Medium: 1, Low: 2 };
        goals.filter(g => !g.isBuffer && g.saved < g.target)
            .sort((a, b) => pOrder[a.priority] - pOrder[b.priority])
            .forEach(g => {
                const take = Math.min(Math.max(0, g.target - g.saved), pool);
                if (take > 0) { suggestion.priorities.push({ name: g.name, amount: take }); pool -= take; }
            });

        // 4. Back to Buffer or Cash
        suggestion.cash = pool;
        return suggestion;
    }

    function handleSubmit(e) {
        e.preventDefault();
        const val = parseFloat(amount);
        if (!source.trim() || !val || val <= 0) return;
        setDraft({ source: source.trim(), amount: val, split: previewAllocation(val) });
    }

    function confirmAllocation() {
        if (!draft) return;
        dispatch({ type: 'ALLOCATE_INCOME', source: draft.source, amount: draft.amount });
        setDraft(null); setSource(''); setAmount('');
    }

    function quickAdd(e) {
        e.preventDefault();
        const val = parseFloat(amount);
        if (!source.trim() || !val || val <= 0) return;
        dispatch({ type: 'ADD_INCOME', source: source.trim(), amount: val });
        setSource(''); setAmount('');
    }

    return (
        <div>
            <div className="section-title">💵 Income Management</div>

    // Balance context
            {cash > 0 && (
                <div className="card" style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.2)' }}>
                    <div style={{ display: 'flex', gap: 24 }}>
                        <div><div className="label" style={{ fontSize: '0.65rem' }}>UNALLOCATED CASH</div><div className="value text-blue" style={{ fontSize: '1.1rem', fontWeight: 800 }}>{cash} {cur}</div></div>
                    </div>
                </div>
            )}

            {/* Income Form */}
            {!draft && (
                <div className="card mt-12">
                    <div className="card-title">Log New Income</div>
                    <form onSubmit={handleSubmit}>
                        <div className="input-row">
                            <input type="text" placeholder="Source (e.g. Salary)" value={source} onChange={e => setSource(e.target.value)} />
                            <input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} min="0" />
                            <button className="btn btn-primary" type="submit">Allocate</button>
                        </div>
                    </form>
                    <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                        {['Salary', 'Freelance', 'Refund', 'Bonus'].map(s => (
                            <button key={s} className="btn btn-sm btn-ghost" onClick={() => setSource(s)} style={{ fontSize: '0.7rem' }}>{s}</button>
                        ))}
                        <span style={{ opacity: 0.3, fontSize: '0.7rem', marginLeft: 'auto' }}>or</span>
                        <button className="btn btn-sm btn-ghost" onClick={quickAdd} style={{ fontSize: '0.7rem', color: 'var(--blue)' }}>Quick Add to Cash</button>
                    </div>
                </div>
            )}

            {/* Allocation Wizard */}
            {draft && (
                <div className="card" style={{ border: '2px solid var(--blue)' }}>
                    <div className="card-title"><span className="icon">🧠</span> Intelligent Allocation</div>
                    <div className="card-sub mb-12">
                        Received <strong>{draft.amount.toLocaleString()} {cur}</strong> from <em>{draft.source}</em>. Suggested disciplined split:
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {draft.split.survival > 0 && (
                            <div className="list-item">
                                <div>🛡️ Survival Needs</div>
                                <div className="text-yellow" style={{ fontWeight: 700 }}>+{draft.split.survival.toLocaleString()}</div>
                            </div>
                        )}
                        {draft.split.installments.map((r, i) => (
                            <div className="list-item" key={i}>
                                <div>📆 {r.name} (Installment)</div>
                                <div className="text-blue" style={{ fontWeight: 700 }}>+{r.amount.toLocaleString()}</div>
                            </div>
                        ))}
                        {draft.split.priorities.map((g, i) => (
                            <div className="list-item" key={i}>
                                <div>{i === 0 ? '🔥' : '🎯'} {g.name}</div>
                                <div className="text-green" style={{ fontWeight: 700 }}>+{g.amount.toLocaleString()}</div>
                            </div>
                        ))}
                        {draft.split.cash > 0 && (
                            <div className="list-item" style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: 8 }}>
                                <div>💰 Remains as Free Cash</div>
                                <div style={{ fontWeight: 700 }}>+{draft.split.cash.toLocaleString()}</div>
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
                        <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setDraft(null)}>Cancel</button>
                        <button className="btn btn-primary" style={{ flex: 2 }} onClick={confirmAllocation}>Apply Split 🚀</button>
                    </div>
                </div>
            )}

            {/* History */}
            <div className="card mt-24">
                <div className="card-title">Recent Income</div>
                {(!incomeEvents || incomeEvents.length === 0)
                    ? <div className="empty-state">No income logged yet</div>
                    : incomeEvents.slice(0, 10).map(inc => (
                        <div key={inc.id} className="list-item">
                            <div className="list-item-info">
                                <div className="list-item-name">{inc.source}</div>
                                <div className="list-item-meta">{new Date(inc.date).toLocaleDateString()}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <span className="text-green" style={{ fontWeight: 700 }}>+{inc.amount.toLocaleString()} {cur}</span>
                                <button 
                                    className="btn btn-sm btn-danger" 
                                    onClick={() => dispatch({ type: 'DELETE_INCOME', id: inc.id })}
                                    aria-label={`Delete ${inc.source} income`}
                                    style={{ padding: '4px 8px', fontSize: '0.65rem' }}
                                >✕</button>
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    );
}
