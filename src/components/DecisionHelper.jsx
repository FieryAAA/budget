import { useEffect, useMemo, useRef } from 'react';
import { useStore } from '../store';
import {
    IconBrain, IconShield, IconAlertOctagon, IconChart,
    IconArrowDown, IconCheckCircle, IconRocket, IconX,
} from './icons';

export default function DecisionHelper({ goal, amount, onClose, onConfirm }) {
    const { state } = useStore();
    const { goals, monthly, cash } = state;
    const cur = state.settings.currency;
    const dialogRef = useRef(null);

    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        dialogRef.current?.focus();
        return () => document.removeEventListener('keydown', onKey);
    }, [onClose]);

    const warnings = useMemo(() => {
        const res = [];
        const bufferGoal = goals.find(g => g.isBuffer);

        if (bufferGoal && bufferGoal.saved < bufferGoal.target && !goal.isBuffer) {
            res.push({
                type: 'danger',
                Icon: IconShield,
                text: `Your safety buffer is ${(bufferGoal.target - bufferGoal.saved).toLocaleString()} ${cur} below target. Prioritise building your buffer first.`,
            });
        }

        if (amount > cash) {
            res.push({
                type: 'danger',
                Icon: IconAlertOctagon,
                text: `You don't have enough cash. Available: ${cash.toLocaleString()} ${cur}.`,
            });
        }

        const afterSpend = monthly.spent + amount;
        if (afterSpend > monthly.budget) {
            res.push({
                type: 'warning',
                Icon: IconChart,
                text: `Combined with monthly spending, this exceeds your ${monthly.budget.toLocaleString()} ${cur} budget.`,
            });
        }

        if (goal.priority === 'Low') {
            res.push({
                type: 'warning',
                Icon: IconArrowDown,
                text: `This is a low-priority goal. Consider funding higher-priority goals first.`,
            });
        }

        if (res.length === 0) {
            res.push({
                type: 'success',
                Icon: IconCheckCircle,
                text: `This allocation looks safe. Buffer is healthy and you're within budget.`,
            });
        }
        return res;
    }, [goal, amount, goals, monthly, cash, cur]);

    return (
        <div className="modal-overlay" onClick={onClose} role="presentation">
            <div
                className="modal"
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-labelledby="decision-helper-title"
                aria-modal="true"
                ref={dialogRef}
                tabIndex={-1}
            >
                <div className="flex-between mb-3">
                    <div className="modal-title" id="decision-helper-title">
                        <IconBrain /> Decision Helper
                    </div>
                    <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close">
                        <IconX />
                    </button>
                </div>
                <div className="mb-4">
                    <div style={{ fontWeight: 700, fontSize: 'var(--text-md)' }}>{goal.name}</div>
                    <div className="text-muted" style={{ fontSize: 'var(--text-xs)', marginTop: 'var(--space-1)' }}>
                        Amount: <span className="mono">{amount.toLocaleString()} {cur}</span> · Priority: {goal.priority} · Cash: <span className="mono">{cash.toLocaleString()} {cur}</span>
                    </div>
                </div>
                <div className="stack-3">
                    {warnings.map((w, i) => (
                        <div key={i} className={`alert alert-${w.type}`}>
                            <w.Icon />
                            <span>{w.text}</span>
                        </div>
                    ))}
                </div>
                <div className="row mt-4">
                    <button className="btn btn-ghost flex-1" onClick={onClose}>Cancel</button>
                    {amount <= cash && (
                        <button className="btn btn-primary flex-1" onClick={onConfirm}>
                            <IconRocket /> Allocate {amount.toLocaleString()} {cur}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
