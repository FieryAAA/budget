import { useState } from 'react';
import { useStore } from '../store';
import ProgressBar from './ProgressBar';

export default function MonthlySpending() {
    const { state, dispatch } = useStore();
    const { monthly, cash, settings } = state;
    const cur = settings.currency;
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [editBudget, setEditBudget] = useState(false);
    const [newBudget, setNewBudget] = useState(monthly.budget);

    const remaining = Math.max(0, monthly.budget - monthly.spent);
    const pct = monthly.budget > 0 ? (monthly.spent / monthly.budget) * 100 : 0;

    function handleAdd(e) {
        e.preventDefault();
        const val = parseFloat(amount);
        if (!name.trim() || !val || val <= 0) return;
        if (val > cash) return;
        dispatch({ type: 'ADD_EXPENSE', name: name.trim(), amount: val });
        setName('');
        setAmount('');
    }

    function handleBudgetSave() {
        const val = parseFloat(newBudget);
        if (val > 0) dispatch({ type: 'SET_MONTHLY_BUDGET', value: val });
        setEditBudget(false);
    }

    return (
        <div>
            {/* Warnings */}
            {pct > 100 && (
                <div className="alert alert-danger">
                    <span>🚨</span>
                    <span>You've exceeded your monthly budget by {(monthly.spent - monthly.budget).toLocaleString()} {cur}!</span>
                </div>
            )}
            {pct >= 80 && pct <= 100 && (
                <div className="alert alert-warning">
                    <span>⚠️</span>
                    <span>You've used {Math.round(pct)}% of your monthly budget. Only {remaining.toLocaleString()} {cur} left.</span>
                </div>
            )}

            {/* Budget Overview */}
            <div className="card">
                <div className="flex-between">
                    <div className="card-title"><span className="icon">📊</span> Monthly Budget</div>
                    <button className="btn btn-sm btn-ghost" onClick={() => setEditBudget(!editBudget)}>✏️</button>
                </div>

                {editBudget && (
                    <div className="input-row mb-12">
                        <input
                            type="number"
                            value={newBudget}
                            onChange={e => setNewBudget(e.target.value)}
                            placeholder="New budget"
                        />
                        <button className="btn btn-sm btn-primary" onClick={handleBudgetSave}>Save</button>
                    </div>
                )}

                <div className="mini-grid">
                    <div className="mini-card">
                        <div className="label">Spent</div>
                        <div className="value" style={{ color: pct > 100 ? 'var(--red)' : pct >= 80 ? 'var(--yellow)' : 'var(--text)' }}>
                            {monthly.spent.toLocaleString()}
                        </div>
                    </div>
                    <div className="mini-card">
                        <div className="label">Remaining</div>
                        <div className="value" style={{ color: remaining <= 0 ? 'var(--red)' : 'var(--green)' }}>
                            {remaining.toLocaleString()}
                        </div>
                    </div>
                </div>

                <ProgressBar
                    value={monthly.spent}
                    max={monthly.budget}
                    label={`${Math.round(pct)}% used`}
                    rightLabel={`Budget: ${monthly.budget.toLocaleString()} ${cur}`}
                    color={pct > 100 ? 'red' : pct >= 80 ? 'yellow' : 'green'}
                />
            </div>

            {/* Add Expense */}
            <div className="card">
                <div className="card-title">Add Expense</div>
                <form onSubmit={handleAdd}>
                    <div className="input-row">
                        <input
                            type="text"
                            placeholder="Expense name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                        <input
                            type="number"
                            placeholder="Amount"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            min="0"
                            style={{ maxWidth: 100 }}
                        />
                        <button className="btn btn-primary" type="submit">+</button>
                    </div>
                </form>
            </div>

            {/* Expense List */}
            <div className="card">
                <div className="flex-between">
                    <div className="card-title">Expenses This Month</div>
                    {monthly.expenses.length > 0 && (
                        <button className="btn btn-sm btn-danger" onClick={() => dispatch({ type: 'RESET_MONTHLY' })}>
                            Reset
                        </button>
                    )}
                </div>

                {monthly.expenses.length === 0 ? (
                    <div className="empty-state">
                        <div className="icon">📝</div>
                        <div>No expenses logged yet</div>
                    </div>
                ) : (
                    monthly.expenses.map(exp => (
                        <div key={exp.id} className="list-item">
                            <div className="list-item-info">
                                <div className="list-item-name">{exp.name}</div>
                                <div className="list-item-meta">
                                    {new Date(exp.date).toLocaleDateString()}
                                </div>
                            </div>
                            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{exp.amount} {cur}</span>
                            <button
                                className="btn btn-sm btn-danger"
                                onClick={() => dispatch({ type: 'DELETE_EXPENSE', id: exp.id })}
                            >
                                ✕
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
