import { createContext, useContext, useReducer, useEffect } from 'react';

const STORAGE_KEY = 'finplan_data';

// Generate unique ids
let _idCounter = Date.now();
export function uid() {
  return (++_idCounter).toString(36);
}

const defaultState = {
  cash: 0,
  monthly: {
    budget: 200,
    spent: 0,
    expenses: [],
    resetDate: new Date().toISOString().slice(0, 7),
  },
  goals: [
    // Special: safety buffer
    { id: 'buffer', name: 'Emergency Buffer', target: 600, saved: 0, priority: 'High', category: 'Essential', targetDate: '', isBuffer: true, isRecurring: false, monthlyCost: 0 },
    // Recurring: gym
    { id: 'gym', name: 'Gym Membership', target: 60, saved: 0, priority: 'High', category: 'Essential', targetDate: '', isBuffer: false, isRecurring: true, monthlyCost: 60 },
    // Regular goals (from old wishlist)
    { id: 'g1', name: 'Desk Chair', target: 600, saved: 0, priority: 'Medium', category: 'Comfort', targetDate: '', isBuffer: false, isRecurring: false, monthlyCost: 0 },
    { id: 'g2', name: 'Phone Charger', target: 55, saved: 0, priority: 'High', category: 'Essential', targetDate: '', isBuffer: false, isRecurring: false, monthlyCost: 0 },
    { id: 'g3', name: 'Jeans', target: 160, saved: 0, priority: 'Medium', category: 'Comfort', targetDate: '', isBuffer: false, isRecurring: false, monthlyCost: 0 },
    { id: 'g4', name: 'Kindle Case', target: 30, saved: 0, priority: 'Low', category: 'Comfort', targetDate: '', isBuffer: false, isRecurring: false, monthlyCost: 0 },
    { id: 'g5', name: 'Coursera Subscription', target: 60, saved: 0, priority: 'High', category: 'Education', targetDate: '', isBuffer: false, isRecurring: false, monthlyCost: 0 },
    { id: 'g6', name: 'Pixel 9a', target: 1500, saved: 0, priority: 'Medium', category: 'Productivity', targetDate: '', isBuffer: false, isRecurring: false, monthlyCost: 0 },
  ],
  incomeEvents: [],
  settings: { currency: 'TND' },
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Migration: if old format (has wishlist/funds), convert to new
      if (parsed.wishlist || parsed.funds) {
        return migrateOldState(parsed);
      }
      return parsed;
    }
  } catch { }
  return defaultState;
}

function migrateOldState(old) {
  const goals = [];
  // Add buffer as goal
  goals.push({
    id: 'buffer', name: 'Emergency Buffer',
    target: old.buffer?.target || 600,
    saved: old.buffer?.current || 0,
    priority: 'High', category: 'Essential', targetDate: '',
    isBuffer: true, isRecurring: false, monthlyCost: 0,
  });
  // Migrate funds
  if (old.funds) {
    for (const f of old.funds) {
      goals.push({
        id: f.id, name: f.name, target: f.target, saved: f.saved || 0,
        priority: 'Medium', category: 'Comfort', targetDate: '',
        isBuffer: false, isRecurring: !!f.isGym, monthlyCost: f.monthlyCost || 0,
      });
    }
  }
  // Migrate wishlist (avoid duplicates by name)
  const existingNames = new Set(goals.map(g => g.name.toLowerCase()));
  if (old.wishlist) {
    for (const w of old.wishlist) {
      if (existingNames.has(w.name.toLowerCase())) continue;
      goals.push({
        id: w.id, name: w.name, target: w.price, saved: w.funded || 0,
        priority: w.priority || 'Medium', category: w.category || 'Comfort',
        targetDate: w.targetDate || '',
        isBuffer: false, isRecurring: false, monthlyCost: 0,
      });
    }
  }
  return {
    cash: old.cash || 0,
    monthly: old.monthly || defaultState.monthly,
    goals,
    incomeEvents: old.incomeEvents || [],
    settings: old.settings || defaultState.settings,
  };
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { }
}

// Helper: get monthly saving needed for a goal
export function getMonthlySaving(goal) {
  if (!goal.targetDate || goal.saved >= goal.target) return null;
  const now = new Date();
  const target = new Date(goal.targetDate + '-01');
  const months = (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());
  if (months <= 0) return { needed: goal.target - goal.saved, months: 0, status: 'overdue' };
  const remaining = goal.target - goal.saved;
  const perMonth = Math.ceil(remaining / months);
  return { needed: perMonth, months, status: 'active' };
}

// Helper: check if goal is on track
export function getGoalStatus(goal) {
  if (goal.saved >= goal.target) return 'funded';
  const plan = getMonthlySaving(goal);
  if (!plan) return goal.saved > 0 ? 'partial' : 'unfunded';
  if (plan.status === 'overdue') return 'behind';
  return 'active';
}

function reducer(state, action) {
  switch (action.type) {
    // ---- Cash ----
    case 'SET_CASH':
      return { ...state, cash: Math.max(0, action.value) };

    // ---- Goals ----
    case 'ADD_GOAL':
      return {
        ...state,
        goals: [...state.goals, {
          id: uid(), saved: 0, isBuffer: false, isRecurring: false, monthlyCost: 0,
          ...action.goal,
        }],
      };

    case 'EDIT_GOAL':
      return {
        ...state,
        goals: state.goals.map(g => g.id === action.id ? { ...g, ...action.updates } : g),
      };

    case 'DELETE_GOAL':
      return {
        ...state,
        // Return saved amount back to cash
        cash: state.cash + (state.goals.find(g => g.id === action.id)?.saved || 0),
        goals: state.goals.filter(g => g.id !== action.id),
      };

    case 'FUND_GOAL': {
      const goal = state.goals.find(g => g.id === action.id);
      if (!goal) return state;
      const maxFund = goal.target - goal.saved;
      const amt = Math.min(action.amount, state.cash, maxFund);
      if (amt <= 0) return state;
      return {
        ...state,
        cash: state.cash - amt,
        goals: state.goals.map(g =>
          g.id === action.id ? { ...g, saved: g.saved + amt } : g
        ),
      };
    }

    case 'WITHDRAW_GOAL': {
      const goal = state.goals.find(g => g.id === action.id);
      if (!goal) return state;
      const amt = Math.min(action.amount, goal.saved);
      if (amt <= 0) return state;
      return {
        ...state,
        cash: state.cash + amt,
        goals: state.goals.map(g =>
          g.id === action.id ? { ...g, saved: g.saved - amt } : g
        ),
      };
    }

    case 'MOVE_FUNDS': {
      const from = state.goals.find(g => g.id === action.fromId);
      const to = state.goals.find(g => g.id === action.toId);
      if (!from || !to) return state;
      const maxFrom = from.saved;
      const maxTo = to.target - to.saved;
      const amt = Math.min(action.amount, maxFrom, maxTo);
      if (amt <= 0) return state;
      return {
        ...state,
        goals: state.goals.map(g => {
          if (g.id === action.fromId) return { ...g, saved: g.saved - amt };
          if (g.id === action.toId) return { ...g, saved: g.saved + amt };
          return g;
        }),
      };
    }

    // ---- Monthly ----
    case 'SET_MONTHLY_BUDGET':
      return { ...state, monthly: { ...state.monthly, budget: action.value } };

    case 'ADD_EXPENSE': {
      const exp = { id: uid(), name: action.name, amount: action.amount, date: new Date().toISOString() };
      return {
        ...state,
        cash: state.cash - action.amount,
        monthly: {
          ...state.monthly,
          spent: state.monthly.spent + action.amount,
          expenses: [...state.monthly.expenses, exp],
        },
      };
    }

    case 'DELETE_EXPENSE': {
      const exp = state.monthly.expenses.find(e => e.id === action.id);
      if (!exp) return state;
      return {
        ...state,
        cash: state.cash + exp.amount,
        monthly: {
          ...state.monthly,
          spent: state.monthly.spent - exp.amount,
          expenses: state.monthly.expenses.filter(e => e.id !== action.id),
        },
      };
    }

    case 'RESET_MONTHLY':
      return {
        ...state,
        monthly: { ...state.monthly, spent: 0, expenses: [], resetDate: new Date().toISOString().slice(0, 7) },
      };

    // ---- Income ----
    case 'ADD_INCOME': {
      const inc = { id: uid(), source: action.source, amount: action.amount, date: new Date().toISOString() };
      return {
        ...state,
        cash: state.cash + action.amount,
        incomeEvents: [inc, ...state.incomeEvents],
      };
    }

    // ---- Reset ----
    case 'RESET_ALL':
      localStorage.removeItem(STORAGE_KEY);
      return defaultState;

    default:
      return state;
  }
}

const StoreContext = createContext();

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}
