import { useStore } from '../store';
import ProgressBar from './ProgressBar';
import GoalCard from './GoalCard';

export default function Dashboard() {
    const { state } = useStore();
    const { cash, monthly, goals, settings } = state;
    const cur = settings.currency;

    const bufferGoal = goals.find(g => g.isBuffer);
    const totalAllocated = goals.reduce((s, g) => s + g.saved, 0);
    const totalTargets = goals.reduce((s, g) => s + g.target, 0);
    const spendPct = monthly.budget > 0 ? (monthly.spent / monthly.budget) * 100 : 0;
    const bufferPct = bufferGoal ? Math.round((bufferGoal.saved / bufferGoal.target) * 100) : 0;

    // Top priority unfunded goals (excluding buffer)
    const topGoals = goals
        .filter(g => !g.isBuffer && g.saved < g.target)
        .sort((a, b) => {
            const p = { High: 0, Medium: 1, Low: 2 };
            return p[a.priority] - p[b.priority];
        })
        .slice(0, 3);

    return (
        <div>
            {/* Total Cash */}
            <div className="card">
                <div className="card-title"><span className="icon">💰</span> Total Cash</div>
                <div className="card-value text-green">{cash.toLocaleString()} {cur}</div>
                <div className="card-sub">Available to allocate</div>
            </div>

            {/* Mini Stats */}
            <div className="mini-grid">
                <div className="mini-card">
                    <div className="label">Allocated</div>
                    <div className="value text-blue" style={{ fontSize: '1.2rem' }}>{totalAllocated.toLocaleString()}</div>
                </div>
                <div className="mini-card">
                    <div className="label">Spent</div>
                    <div className="value" style={{
                        fontSize: '1.2rem',
                        color: spendPct > 100 ? 'var(--red)' : spendPct >= 80 ? 'var(--yellow)' : 'var(--green)'
                    }}>
                        {monthly.spent} / {monthly.budget}
                    </div>
                </div>
            </div>

            {/* Buffer Progress */}
            {bufferGoal && (
                <div className="card mt-12">
                    <div className="card-title"><span className="icon">🛡️</span> Safety Buffer</div>
                    <ProgressBar
                        value={bufferGoal.saved}
                        max={bufferGoal.target}
                        label={`${bufferGoal.saved.toLocaleString()} ${cur}`}
                        rightLabel={`Target: ${bufferGoal.target.toLocaleString()} ${cur}`}
                    />
                    {bufferGoal.saved < bufferGoal.target ? (
                        <div className="card-sub mt-8" style={{ color: 'var(--yellow)' }}>
                            ⚠️ {(bufferGoal.target - bufferGoal.saved).toLocaleString()} {cur} remaining to safety
                        </div>
                    ) : (
                        <div className="card-sub mt-8" style={{ color: 'var(--green)' }}>
                            ✅ Buffer fully funded!
                        </div>
                    )}
                </div>
            )}

            {/* Monthly Spending */}
            <div className="card">
                <div className="card-title"><span className="icon">📊</span> Monthly Spending</div>
                <ProgressBar
                    value={monthly.spent}
                    max={monthly.budget}
                    label={`${monthly.spent.toLocaleString()} ${cur} used`}
                    rightLabel={`${Math.max(0, monthly.budget - monthly.spent).toLocaleString()} ${cur} left`}
                    color={spendPct > 100 ? 'red' : spendPct >= 80 ? 'yellow' : 'green'}
                />
            </div>

            {/* Overall Goals Progress */}
            <div className="card">
                <div className="card-title"><span className="icon">🎯</span> Goals Overall</div>
                <ProgressBar
                    value={totalAllocated}
                    max={totalTargets || 1}
                    label={`${totalAllocated.toLocaleString()} ${cur} saved`}
                    rightLabel={`${totalTargets.toLocaleString()} ${cur} total`}
                    color="blue"
                />
                <div className="card-sub mt-8">{goals.length} goals tracked</div>
            </div>

            {/* Top Priority Goals */}
            {topGoals.length > 0 && (
                <>
                    <div className="section-title">🔥 Top Priority Goals</div>
                    {topGoals.map(goal => (
                        <GoalCard key={goal.id} goal={goal} compact />
                    ))}
                </>
            )}

            {/* Buffer Warning */}
            {bufferGoal && bufferGoal.saved < bufferGoal.target && (
                <div className="alert alert-warning">
                    <span>⚠️</span>
                    <span>Your safety buffer is below target. Prioritise rebuilding it before funding other goals.</span>
                </div>
            )}
        </div>
    );
}
