/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Calendar as CalendarIcon, 
  History as HistoryIcon, 
  LayoutDashboard, 
  Trophy, 
  Frown, 
  TrendingUp, 
  Trash2, 
  Edit2, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  BarChart3,
  User,
  Camera,
  Upload,
  MapPin,
  Users,
  Target,
  Zap
} from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  parseISO,
  startOfDay
} from 'date-fns';
import { 
  AreaChart,
  Area,
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  Cell
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { Match, Result, Profile } from './types';

const STORAGE_KEY = 'badminton_matches';
const PROFILE_KEY = 'badminton_profile';

export default function App() {
  const [activeTab, setActiveTab] = useState<'entry' | 'calendar' | 'history' | 'profile'>('entry');
  const [matches, setMatches] = useState<Match[]>([]);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [profile, setProfile] = useState<Profile>({
    name: 'Player',
    racket: { name: '' },
    shoes: { name: '' }
  });

  // Load profile from local storage
  useEffect(() => {
    const saved = localStorage.getItem(PROFILE_KEY);
    if (saved) {
      try {
        setProfile(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse profile', e);
      }
    }
  }, []);

  // Save profile to local storage
  useEffect(() => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }, [profile]);

  // Load matches from local storage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migration: rename partner to teammate and split score if necessary
        const migrated = parsed.map((m: any) => {
          let yourScore = m.yourScore ?? 0;
          let opponentScore = m.opponentScore ?? 0;
          if (m.score && (m.yourScore === undefined || m.opponentScore === undefined)) {
            const parts = m.score.split('-').map((p: string) => parseInt(p.trim()));
            if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
              yourScore = parts[0];
              opponentScore = parts[1];
            }
          }
          return {
            ...m,
            teammate: m.teammate || m.partner || '',
            yourScore,
            opponentScore
          };
        });
        setMatches(migrated);
      } catch (e) {
        console.error('Failed to parse matches', e);
      }
    }
  }, []);

  // Save matches to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(matches));
  }, [matches]);

  const addMatch = (match: Omit<Match, 'id'>) => {
    const newMatch = { ...match, id: crypto.randomUUID() };
    setMatches(prev => [newMatch, ...prev]);
  };

  const updateMatch = (updated: Match) => {
    setMatches(prev => prev.map(m => m.id === updated.id ? updated : m));
    setEditingMatch(null);
  };

  const deleteMatch = (id: string) => {
    if (confirm('Are you sure you want to delete this match?')) {
      setMatches(prev => prev.filter(m => m.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans">
      {/* Header */}
      <header className="bg-white border-b border-[#E2E8F0] sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#10B981] rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
              <Trophy size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[#0F172A]">Badminton Pro</h1>
          </div>
          
          {/* Desktop Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-[#F1F5F9] p-1 rounded-lg">
            <TabButton 
              active={activeTab === 'entry'} 
              onClick={() => setActiveTab('entry')}
              icon={<Plus size={18} />}
              label="Entry"
            />
            <TabButton 
              active={activeTab === 'calendar'} 
              onClick={() => setActiveTab('calendar')}
              icon={<CalendarIcon size={18} />}
              label="Calendar"
            />
            <TabButton 
              active={activeTab === 'history'} 
              onClick={() => setActiveTab('history')}
              icon={<HistoryIcon size={18} />}
              label="History"
            />
            <TabButton 
              active={activeTab === 'profile'} 
              onClick={() => setActiveTab('profile')}
              icon={<User size={18} />}
              label="Profile"
            />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 pb-24 md:pb-8">
        <AnimatePresence mode="wait">
          {activeTab === 'entry' && (
            <motion.div
              key="entry"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <section className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6">
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <Plus className="text-[#10B981]" size={20} />
                  {editingMatch ? 'Edit Match' : 'Add New Match'}
                </h2>
                <MatchForm 
                  onSubmit={editingMatch ? updateMatch : addMatch} 
                  initialData={editingMatch}
                  onCancel={() => setEditingMatch(null)}
                />
              </section>

              <section className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <LayoutDashboard className="text-[#64748B]" size={20} />
                  Recent Matches
                </h2>
                <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden">
                  <MatchList 
                    matches={[...matches].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10)} 
                    onEdit={setEditingMatch} 
                    onDelete={deleteMatch} 
                  />
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'calendar' && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <CalendarView matches={matches} />
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <HistoryView matches={matches} onEdit={setEditingMatch} onDelete={deleteMatch} onTabChange={setActiveTab} />
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <ProfileView matches={matches} profile={profile} onUpdateProfile={setProfile} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2E8F0] px-6 py-3 flex justify-between items-center z-20">
        <MobileTabButton 
          active={activeTab === 'entry'} 
          onClick={() => setActiveTab('entry')}
          icon={<Plus size={24} />}
          label="Entry"
        />
        <MobileTabButton 
          active={activeTab === 'calendar'} 
          onClick={() => setActiveTab('calendar')}
          icon={<CalendarIcon size={24} />}
          label="Calendar"
        />
        <MobileTabButton 
          active={activeTab === 'history'} 
          onClick={() => setActiveTab('history')}
          icon={<HistoryIcon size={24} />}
          label="History"
        />
        <MobileTabButton 
          active={activeTab === 'profile'} 
          onClick={() => setActiveTab('profile')}
          icon={<User size={24} />}
          label="Profile"
        />
      </nav>
    </div>
  );
}

// --- UI Components ---

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-md transition-all text-sm font-medium",
        active 
          ? "bg-white text-[#10B981] shadow-sm" 
          : "text-[#64748B] hover:text-[#1E293B] hover:bg-white/50"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function MobileTabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 transition-all",
        active ? "text-[#10B981]" : "text-[#94A3B8]"
      )}
    >
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}

function MatchForm({ onSubmit, initialData, onCancel }: { 
  onSubmit: (match: any) => void, 
  initialData?: Match | null,
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    gameName: 'Friendly',
    yourScore: 21,
    opponentScore: 0,
    result: 'Win' as Result,
    improvement: '',
    location: '',
    teammate: '',
  });
  const [opponentsInput, setOpponentsInput] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        date: initialData.date,
        gameName: initialData.gameName || 'Friendly',
        yourScore: initialData.yourScore ?? 21,
        opponentScore: initialData.opponentScore ?? 0,
        result: initialData.result,
        improvement: initialData.improvement,
        location: initialData.location || '',
        teammate: initialData.teammate || '',
      });
      setOpponentsInput(initialData.opponents?.filter(o => o).join(', ') || '');
    } else {
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        gameName: 'Friendly',
        yourScore: 21,
        opponentScore: 0,
        result: 'Win',
        improvement: '',
        location: '',
        teammate: '',
      });
      setOpponentsInput('');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.gameName || !formData.location || !formData.teammate || !opponentsInput) return;
    
    const opponents = opponentsInput.split(',').map(v => v.trim()).filter(v => v);
    if (opponents.length === 0) return;
    // Ensure at least two values if it's doubles, or just pass what's there
    const finalOpponents = [opponents[0] || '', opponents[1] || ''];

    if (initialData) {
      onSubmit({ ...formData, opponents: finalOpponents, id: initialData.id });
    } else {
      onSubmit({ ...formData, opponents: finalOpponents });
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        gameName: 'Friendly',
        yourScore: 21,
        opponentScore: 0,
        result: 'Win',
        improvement: '',
        location: '',
        teammate: '',
      });
      setOpponentsInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Date</label>
        <input 
          type="date" 
          value={formData.date}
          onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
          className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all"
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Location</label>
        <input 
          type="text" 
          placeholder="e.g., Central Court"
          value={formData.location}
          onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
          className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all"
          required
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Game Type</label>
        <select 
          value={formData.gameName}
          onChange={e => setFormData(prev => ({ ...prev, gameName: e.target.value }))}
          className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all appearance-none"
          required
        >
          <option value="Friendly">Friendly</option>
          <option value="Competitive">Competitive</option>
          <option value="Tournament">Tournament</option>
        </select>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Teammate</label>
        <input 
          type="text" 
          placeholder="Teammate's Name"
          value={formData.teammate}
          onChange={e => setFormData(prev => ({ ...prev, teammate: e.target.value }))}
          className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all"
          required
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Opponents</label>
        <input 
          type="text" 
          placeholder="Opponent 1, Opponent 2"
          value={opponentsInput}
          onChange={e => setOpponentsInput(e.target.value)}
          className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all"
          required
        />
        <p className="text-[10px] text-[#94A3B8] font-medium italic">Separate names with a comma for doubles.</p>
      </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Your Score</label>
            <span className="text-[10px] text-[#94A3B8] font-medium italic">if score is 8-0 enter 21-0</span>
          </div>
          <select 
            value={formData.yourScore}
            onChange={e => {
              const val = parseInt(e.target.value);
              setFormData(prev => {
                const updates: any = { yourScore: val };
                if (val < 21) {
                  updates.opponentScore = 21;
                  updates.result = 'Lose';
                } else {
                  updates.result = 'Win';
                  if (prev.opponentScore === 21) {
                    updates.opponentScore = 0;
                  }
                }
                return { ...prev, ...updates };
              });
            }}
            className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all appearance-none text-base"
            required
          >
            {Array.from({ length: 22 }).map((_, i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Opponent Score</label>
          <select 
            value={formData.opponentScore}
            onChange={e => {
              const val = parseInt(e.target.value);
              setFormData(prev => {
                const updates: any = { opponentScore: val };
                if (val < 21) {
                  updates.yourScore = 21;
                  updates.result = 'Win';
                } else {
                  updates.result = 'Lose';
                  if (prev.yourScore === 21) {
                    updates.yourScore = 0;
                  }
                }
                return { ...prev, ...updates };
              });
            }}
            className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all appearance-none text-base"
            required
          >
            {Array.from({ length: 22 }).map((_, i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Result</label>
          <select 
            value={formData.result}
            onChange={e => setFormData(prev => ({ ...prev, result: e.target.value as Result }))}
            className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all appearance-none text-base"
            required
          >
            <option value="Win">Win</option>
            <option value="Lose">Lose</option>
          </select>
        </div>
        <div className="md:col-span-2 space-y-2">
          <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Areas for Improvement</label>
          <textarea 
            placeholder="What can you do better next time?"
            value={formData.improvement}
            onChange={e => setFormData(prev => ({ ...prev, improvement: e.target.value }))}
            className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all min-h-[100px] text-base"
          />
        </div>
        <div className="md:col-span-2 flex gap-3 pt-2">
          <button 
            type="submit"
            className="flex-1 bg-[#10B981] text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-base"
          >
            {initialData ? <Edit2 size={20} /> : <Plus size={20} />}
            {initialData ? 'Update Match' : 'Add Match Entry'}
          </button>
          {initialData && (
            <button 
              type="button"
              onClick={onCancel}
              className="px-6 bg-[#F1F5F9] text-[#64748B] font-bold py-4 rounded-xl active:scale-[0.98] transition-all text-base"
            >
              Cancel
            </button>
          )}
        </div>
    </form>
  );
}

function MatchList({ matches, onEdit, onDelete }: { 
  matches: Match[], 
  onEdit: (match: Match) => void, 
  onDelete: (id: string) => void 
}) {
  if (matches.length === 0) {
    return (
      <div className="p-12 text-center space-y-3">
        <div className="w-16 h-16 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto text-[#94A3B8]">
          <LayoutDashboard size={32} />
        </div>
        <p className="text-[#64748B] font-medium">No matches recorded yet.</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">Location</th>
              <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">Game</th>
              <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">Teammate</th>
              <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">Opponents</th>
              <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">Score</th>
              <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">Result</th>
              <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider text-center">Edit</th>
              <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider text-center">Delete</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {matches.map((match) => (
              <tr key={match.id} className="hover:bg-[#F8FAFC] transition-colors group">
                <td className="px-6 py-4 text-sm font-medium text-[#475569]">
                  {format(parseISO(match.date), 'MMM dd, yyyy')}
                </td>
                <td className="px-6 py-4 text-sm text-[#64748B]">
                  {match.location || '-'}
                </td>
                <td className="px-6 py-4 text-sm font-bold text-[#1E293B]">
                  {match.gameName}
                </td>
                <td className="px-6 py-4 text-sm text-[#64748B]">
                  {match.teammate || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-[#64748B]">
                  {match.opponents?.filter(o => o).join(', ') || '-'}
                </td>
                <td className="px-6 py-4 text-sm font-mono font-bold text-[#64748B]">
                  {match.yourScore}-{match.opponentScore}
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide",
                    match.result === 'Win' 
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                      : "bg-rose-50 text-rose-600 border border-rose-100"
                  )}>
                    {match.result === 'Win' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                    {match.result}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <button 
                    onClick={() => onEdit(match)}
                    className="p-2 text-[#64748B] hover:text-[#10B981] hover:bg-emerald-50 rounded-lg transition-all"
                    title="Edit Match"
                  >
                    <Edit2 size={16} />
                  </button>
                </td>
                <td className="px-6 py-4 text-center">
                  <button 
                    onClick={() => onDelete(match.id)}
                    className="p-2 text-[#64748B] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                    title="Delete Match"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-[#E2E8F0]">
        {matches.map((match) => (
          <div key={match.id} className="p-4 space-y-3 active:bg-[#F8FAFC] transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">
                  {format(parseISO(match.date), 'MMM dd, yyyy')}
                </span>
                <span className="text-sm font-bold text-[#1E293B]">{match.gameName}</span>
              </div>
              <span className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide",
                match.result === 'Win' 
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                  : "bg-rose-50 text-rose-600 border border-rose-100"
              )}>
                {match.result === 'Win' ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                {match.result}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 py-1">
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Score</p>
                <p className="text-lg font-black text-[#0F172A] font-mono">{match.yourScore}-{match.opponentScore}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Location</p>
                <p className="text-xs font-medium text-[#475569] truncate">{match.location || '-'}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex flex-col max-w-[60%]">
                <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Opponents</p>
                <p className="text-xs font-medium text-[#475569] truncate">{match.opponents?.filter(o => o).join(', ') || '-'}</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => onEdit(match)}
                  className="p-3 bg-[#F1F5F9] text-[#64748B] rounded-xl active:scale-95 transition-all"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => onDelete(match.id)}
                  className="p-3 bg-rose-50 text-rose-600 rounded-xl active:scale-95 transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

const MOTIVATIONAL_QUOTES = [
  "The only way to prove that you’re a good sport is to lose.",
  "Age is no barrier. It’s a limitation you put on your mind.",
  "Winning isn’t everything, but wanting to win is.",
  "You miss 100% of the shots you don’t take.",
  "Hard work beats talent when talent doesn’t work hard.",
  "It’s not whether you get knocked down; it’s whether you get up.",
  "The more difficult the victory, the greater the happiness in winning.",
  "Champions keep playing until they get it right.",
  "Don't count the days, make the days count.",
  "Success is where preparation and opportunity meet."
];

function CalendarView({ matches }: { matches: Match[] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const randomQuote = useMemo(() => {
    return MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
  }, [currentMonth]);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = [];
  let day = startDate;

  while (day <= endDate) {
    calendarDays.push(day);
    day = addDays(day, 1);
  }

  const getDayMatches = (d: Date) => {
    return matches.filter(m => isSameDay(parseISO(m.date), d));
  };

  const getDaySummary = (d: Date) => {
    const dayMatches = getDayMatches(d);
    const wins = dayMatches.filter(m => m.result === 'Win').length;
    const losses = dayMatches.filter(m => m.result === 'Lose').length;
    return { wins, losses };
  };

  return (
    <div className="space-y-6 relative overflow-hidden">
      {/* Background Quote */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
        <p className="text-4xl md:text-6xl font-black text-[#1E293B] opacity-[0.03] text-center max-w-4xl leading-tight uppercase tracking-tighter transform -rotate-6">
          {randomQuote}
        </p>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-[#E2E8F0] p-6 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-[#0F172A]">{format(currentMonth, 'MMMM yyyy')}</h2>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="p-2 hover:bg-[#F1F5F9] rounded-lg transition-all text-[#64748B]">
              <ChevronLeft size={20} />
            </button>
            <button onClick={nextMonth} className="p-2 hover:bg-[#F1F5F9] rounded-lg transition-all text-[#64748B]">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px bg-[#E2E8F0] rounded-xl overflow-hidden border border-[#E2E8F0]">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="bg-[#F8FAFC] py-3 text-center text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">
              <span className="hidden md:inline">{d}</span>
              <span className="md:hidden">{d[0]}</span>
            </div>
          ))}
          {calendarDays.map((d, i) => {
            const summary = getDaySummary(d);
            const isCurrentMonth = isSameMonth(d, monthStart);
            const isToday = isSameDay(d, new Date());
            const hasMatches = summary.wins > 0 || summary.losses > 0;

            return (
              <button
                key={i}
                onClick={() => setSelectedDate(d)}
                className={cn(
                  "bg-white min-h-[60px] md:min-h-[100px] p-1 md:p-2 flex flex-col items-center md:items-start gap-1 md:gap-2 transition-all hover:bg-[#F8FAFC] relative group active:scale-95",
                  !isCurrentMonth && "bg-[#F8FAFC]/50 text-[#CBD5E1]"
                )}
              >
                <span className={cn(
                  "text-xs md:text-sm font-bold w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-full transition-all",
                  isToday && "bg-[#10B981] text-white shadow-md shadow-emerald-100",
                  !isToday && isCurrentMonth && "text-[#475569]",
                  !isCurrentMonth && "text-[#CBD5E1]"
                )}>
                  {format(d, 'd')}
                </span>
                
                {hasMatches && (
                  <div className="w-full space-y-0.5 md:space-y-1">
                    {summary.wins > 0 && (
                      <div className="text-[8px] md:text-[10px] font-bold bg-emerald-50 text-emerald-600 px-1 md:px-1.5 py-0.5 rounded flex justify-between items-center">
                        <span className="hidden md:inline">W</span>
                        <span className="md:hidden">W</span>
                        <span>{summary.wins}</span>
                      </div>
                    )}
                    {summary.losses > 0 && (
                      <div className="text-[8px] md:text-[10px] font-bold bg-rose-50 text-rose-600 px-1 md:px-1.5 py-0.5 rounded flex justify-between items-center">
                        <span className="hidden md:inline">L</span>
                        <span className="md:hidden">L</span>
                        <span>{summary.losses}</span>
                      </div>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day Details Modal-like View */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[#0F172A]">
                Matches on {format(selectedDate, 'MMMM dd, yyyy')}
              </h3>
              <button 
                onClick={() => setSelectedDate(null)}
                className="text-[#64748B] hover:text-[#1E293B] font-bold text-sm"
              >
                Close
              </button>
            </div>
            
            {getDayMatches(selectedDate).length > 0 ? (
              <div className="space-y-4">
                {getDayMatches(selectedDate).map(m => (
                  <div key={m.id} className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                    <div>
                      <h4 className="font-bold text-[#1E293B]">{m.gameName}</h4>
                      <p className="text-xs text-[#64748B] font-medium">Score: {m.yourScore}-{m.opponentScore}</p>
                      {m.improvement && (
                        <p className="text-xs text-[#94A3B8] italic mt-1">Note: {m.improvement}</p>
                      )}
                    </div>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      m.result === 'Win' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                    )}>
                      {m.result}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-[#94A3B8] font-medium italic">No matches played on this day.</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function HistoryView({ matches, onEdit, onDelete, onTabChange }: { 
  matches: Match[], 
  onEdit: (match: Match) => void, 
  onDelete: (id: string) => void,
  onTabChange: (tab: 'entry' | 'calendar' | 'history') => void
}) {
  const [filter, setFilter] = useState<'All' | 'Win' | 'Lose'>('All');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [selectedOpponent, setSelectedOpponent] = useState<string | null>(null);
  const [selectedTeammate, setSelectedTeammate] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const years = useMemo(() => {
    const uniqueYears = new Set<number>();
    matches.forEach(m => uniqueYears.add(new Date(m.date).getFullYear()));
    if (uniqueYears.size === 0) uniqueYears.add(new Date().getFullYear());
    return Array.from(uniqueYears).sort((a, b) => b - a);
  }, [matches]);

  const monthlyStats = useMemo(() => {
    const filtered = matches.filter(m => {
      const d = new Date(m.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });
    const total = filtered.length;
    const wins = filtered.filter(m => m.result === 'Win').length;
    const losses = total - wins;
    return { total, wins, losses };
  }, [matches, selectedMonth, selectedYear]);

  const stats = useMemo(() => {
    const total = matches.length;
    const wins = matches.filter(m => m.result === 'Win').length;
    const losses = total - wins;
    const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
    
    let totalPoints = 0;
    let gamesCount = 0;
    matches.forEach(m => {
      totalPoints += m.yourScore;
      gamesCount++;
    });
    const avgPoints = gamesCount > 0 ? (totalPoints / gamesCount).toFixed(1) : '0';

    // Grouped Stats
    const locationStats: Record<string, { wins: number, total: number }> = {};
    const teammateStats: Record<string, { wins: number, total: number }> = {};
    const opponentStats: Record<string, { wins: number, total: number }> = {};

    matches.forEach(m => {
      if (m.location) {
        if (!locationStats[m.location]) locationStats[m.location] = { wins: 0, total: 0 };
        locationStats[m.location].total++;
        if (m.result === 'Win') locationStats[m.location].wins++;
      }
      if (m.teammate) {
        if (!teammateStats[m.teammate]) teammateStats[m.teammate] = { wins: 0, total: 0 };
        teammateStats[m.teammate].total++;
        if (m.result === 'Win') teammateStats[m.teammate].wins++;
      }
      m.opponents?.forEach(opp => {
        if (opp) {
          if (!opponentStats[opp]) opponentStats[opp] = { wins: 0, total: 0 };
          opponentStats[opp].total++;
          if (m.result === 'Win') opponentStats[opp].wins++;
        }
      });
    });

    return { total, wins, losses, winRate, avgPoints, locationStats, teammateStats, opponentStats };
  }, [matches]);

  const filteredMatches = useMemo(() => {
    let result = [...matches];
    if (filter !== 'All') {
      result = result.filter(m => m.result === filter);
    }
    result.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
    return result;
  }, [matches, filter, sortOrder]);

  const chartData = useMemo(() => {
    // Last 7 days trend
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const date = addDays(startOfDay(new Date()), -i);
      const dayMatches = matches.filter(m => isSameDay(parseISO(m.date), date));
      return {
        date: format(date, 'MMM dd'),
        wins: dayMatches.filter(m => m.result === 'Win').length,
        losses: dayMatches.filter(m => m.result === 'Lose').length,
        timestamp: date.getTime()
      };
    }).reverse();
    return last7Days;
  }, [matches]);

  const bestDay = useMemo(() => {
    const dayMap: Record<string, { wins: number, date: string }> = {};
    matches.forEach(m => {
      const d = m.date;
      if (!dayMap[d]) dayMap[d] = { wins: 0, date: d };
      if (m.result === 'Win') dayMap[d].wins++;
    });
    const days = Object.values(dayMap);
    if (days.length === 0) return null;
    return days.reduce((prev, current) => (prev.wins > current.wins) ? prev : current);
  }, [matches]);

  if (matches.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-12 text-center space-y-6">
        <div className="w-20 h-20 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto text-[#94A3B8]">
          <HistoryIcon size={40} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-[#1E293B]">No History Yet</h3>
          <p className="text-[#64748B] max-w-xs mx-auto">Start recording your matches to see your performance analytics and trends.</p>
        </div>
        <button 
          onClick={() => onTabChange('entry')}
          className="bg-[#10B981] text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-emerald-100 hover:bg-[#059669] transition-all"
        >
          Add Your First Match
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Total Matches" value={stats.total} icon={<LayoutDashboard size={16} />} color="blue" />
        <StatCard label="Wins" value={stats.wins} icon={<Trophy size={16} />} color="emerald" />
        <StatCard label="Losses" value={stats.losses} icon={<Frown size={16} />} color="rose" />
        <StatCard label="Win Rate" value={`${stats.winRate}%`} icon={<TrendingUp size={16} />} color="amber" />
        <StatCard label="Avg Points" value={stats.avgPoints} icon={<BarChart3 size={16} />} color="indigo" />
      </div>

      {/* Monthly Summary Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="font-bold text-[#0F172A] flex items-center gap-2">
            <CalendarIcon size={18} className="text-[#10B981]" />
            Monthly Performance
          </h3>
          <div className="flex items-center gap-3">
            <select 
              value={selectedMonth} 
              onChange={e => setSelectedMonth(parseInt(e.target.value))}
              className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-xs font-bold text-[#475569] focus:outline-none cursor-pointer"
            >
              {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => (
                <option key={m} value={i}>{m}</option>
              ))}
            </select>
            <select 
              value={selectedYear} 
              onChange={e => setSelectedYear(parseInt(e.target.value))}
              className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-xs font-bold text-[#475569] focus:outline-none cursor-pointer"
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Total Matches</p>
              <p className="text-2xl font-black text-[#1E293B]">{monthlyStats.total}</p>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500">
              <LayoutDashboard size={20} />
            </div>
          </div>
          <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Matches Won</p>
              <p className="text-2xl font-black text-emerald-600">{monthlyStats.wins}</p>
            </div>
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-500">
              <Trophy size={20} />
            </div>
          </div>
          <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Matches Lost</p>
              <p className="text-2xl font-black text-rose-600">{monthlyStats.losses}</p>
            </div>
            <div className="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center text-rose-500">
              <Frown size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Grouped History Summaries */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GroupedStatCard title="Location History" stats={stats.locationStats} />
        <GroupedStatCard 
          title="Teammate History" 
          stats={stats.teammateStats} 
          onItemClick={(name) => setSelectedTeammate(name)}
        />
        <GroupedStatCard 
          title="Opponent History" 
          stats={stats.opponentStats} 
          onItemClick={(name) => setSelectedOpponent(name)}
        />
      </div>

      {/* Modals */}
      <AnimatePresence>
        {selectedOpponent && (
          <HeadToHeadModal 
            opponent={selectedOpponent} 
            matches={matches.filter(m => m.opponents?.includes(selectedOpponent))}
            onClose={() => setSelectedOpponent(null)}
          />
        )}
        {selectedTeammate && (
          <TeammateHistoryModal 
            teammate={selectedTeammate} 
            matches={matches.filter(m => m.teammate === selectedTeammate)}
            onClose={() => setSelectedTeammate(null)}
          />
        )}
      </AnimatePresence>

      {/* Charts & Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6">
          <h3 className="text-sm font-bold text-[#64748B] uppercase tracking-wider mb-6 flex items-center gap-2">
            <TrendingUp size={16} className="text-[#10B981]" />
            Performance Trend (Last 7 Days)
          </h3>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorWins" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLosses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#F43F5E" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94A3B8', fontSize: 12 }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="wins" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorWins)" 
                  name="Wins"
                />
                <Area 
                  type="monotone" 
                  dataKey="losses" 
                  stroke="#F43F5E" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorLosses)" 
                  name="Losses"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#64748B] uppercase tracking-wider mb-6">Highlights</h3>
            {bestDay && bestDay.wins > 0 ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Best Performance Day</p>
                  <p className="text-lg font-bold text-emerald-900">{format(parseISO(bestDay.date), 'MMMM dd')}</p>
                  <p className="text-sm font-medium text-emerald-700 mt-1">{bestDay.wins} Wins in a single day!</p>
                </div>
                <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">Current Streak</p>
                  <p className="text-lg font-bold text-indigo-900">
                    {matches[0]?.result === 'Win' ? 'Winning' : 'Learning'}
                  </p>
                  <p className="text-sm font-medium text-indigo-700 mt-1">Keep pushing your limits!</p>
                </div>
              </div>
            ) : (
              <p className="text-[#94A3B8] italic text-sm">No highlights yet. Keep playing!</p>
            )}
          </div>
          <div className="mt-6 pt-6 border-t border-[#F1F5F9]">
            <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Pro Tip</p>
            <p className="text-xs text-[#64748B] mt-1 leading-relaxed">Consistency is key. Review your "Areas for Improvement" regularly to level up your game.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function GroupedStatCard({ title, stats, onItemClick }: { 
  title: string, 
  stats: Record<string, { wins: number, total: number }>,
  onItemClick?: (name: string) => void
}) {
  const sortedStats = Object.entries(stats).sort((a, b) => b[1].total - a[1].total);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6">
      <h3 className="text-sm font-bold text-[#64748B] uppercase tracking-wider mb-4">{title}</h3>
      <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
        {sortedStats.length > 0 ? sortedStats.map(([name, data]) => {
          const winRate = Math.round((data.wins / data.total) * 100);
          const isClickable = (title === "Opponent History" || title === "Teammate History") && onItemClick;
          return (
            <div 
              key={name} 
              className={cn(
                "flex items-center justify-between group",
                isClickable && "cursor-pointer hover:bg-[#F8FAFC] -mx-2 px-2 py-1 rounded-xl transition-all"
              )}
              onClick={() => isClickable && onItemClick(name)}
            >
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#1E293B] truncate max-w-[120px]">{name}</span>
                <span className="text-[10px] text-[#94A3B8] font-bold tracking-tight">
                  P-{data.total}, W-{data.wins}, L-{data.total - data.wins}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-24 h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#10B981] transition-all duration-500" 
                    style={{ width: `${winRate}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-[#475569] w-8 text-right">{winRate}%</span>
              </div>
            </div>
          );
        }) : (
          <p className="text-xs text-[#94A3B8] italic">No data available yet.</p>
        )}
      </div>
    </div>
  );
}

function TeammateHistoryModal({ teammate, matches, onClose }: { teammate: string, matches: Match[], onClose: () => void }) {
  const stats = useMemo(() => {
    const total = matches.length;
    const wins = matches.filter(m => m.result === 'Win').length;
    const losses = total - wins;
    const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

    // Morale Calculation
    // Base is win rate
    // +10 for last win, -10 for last loss
    // +5 for each win in last 3
    const sortedMatches = [...matches].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    let moraleScore = winRate;
    if (sortedMatches.length > 0) {
      if (sortedMatches[0].result === 'Win') moraleScore += 10;
      else moraleScore -= 10;

      const last3 = sortedMatches.slice(0, 3);
      last3.forEach(m => {
        if (m.result === 'Win') moraleScore += 5;
      });
    }
    moraleScore = Math.max(0, Math.min(100, moraleScore));

    const getMoraleLevel = (score: number) => {
      if (score >= 81) return { label: 'Elite', color: 'text-emerald-600', bg: 'bg-emerald-50' };
      if (score >= 61) return { label: 'High', color: 'text-blue-600', bg: 'bg-blue-50' };
      if (score >= 41) return { label: 'Steady', color: 'text-indigo-600', bg: 'bg-indigo-50' };
      if (score >= 21) return { label: 'Low', color: 'text-amber-600', bg: 'bg-amber-50' };
      return { label: 'Critical', color: 'text-rose-600', bg: 'bg-rose-50' };
    };

    let biggestWin: Match | null = null;
    let maxWinMargin = -1;
    let biggestLoss: Match | null = null;
    let maxLossMargin = -1;

    matches.forEach(m => {
      const margin = Math.abs(m.yourScore - m.opponentScore);
      if (m.result === 'Win') {
        if (margin > maxWinMargin) {
          maxWinMargin = margin;
          biggestWin = m;
        }
      } else {
        if (margin > maxLossMargin) {
          maxLossMargin = margin;
          biggestLoss = m;
        }
      }
    });

    return { total, wins, losses, winRate, biggestWin, biggestLoss, moraleScore, moraleLevel: getMoraleLevel(moraleScore) };
  }, [matches]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-[#F1F5F9] flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <HistoryIcon size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1E293B]">Teammate History</h3>
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">with {teammate}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-[#E2E8F0] rounded-full transition-all text-[#64748B]"
          >
            <XCircle size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">
          {/* Morale & Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={cn("md:col-span-2 p-5 rounded-2xl border flex flex-col justify-between", stats.moraleLevel.bg, stats.moraleLevel.color.replace('text-', 'border-'))}>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-70">Partnership Morale</p>
                <p className={cn("text-2xl font-black", stats.moraleLevel.color)}>{stats.moraleLevel.label}</p>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-[10px] font-bold mb-1">
                  <span>Chemistry Score</span>
                  <span>{stats.moraleScore}%</span>
                </div>
                <div className="w-full h-2 bg-white/50 rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full transition-all duration-1000", stats.moraleLevel.color.replace('text-', 'bg-'))}
                    style={{ width: `${stats.moraleScore}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] text-center flex flex-col justify-center">
              <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1">Wins</p>
              <p className="text-2xl font-black text-[#1E293B]">{stats.wins}</p>
            </div>
            <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] text-center flex flex-col justify-center">
              <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1">Win Rate</p>
              <p className="text-2xl font-black text-[#1E293B]">{stats.winRate}%</p>
            </div>
          </div>

          {/* Records */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100">
              <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Trophy size={14} /> Best Partnership Win
              </h4>
              {stats.biggestWin ? (
                <div>
                  <p className="text-xl font-black text-emerald-900">{stats.biggestWin.yourScore}-{stats.biggestWin.opponentScore}</p>
                  <p className="text-xs font-bold text-emerald-700 mt-1">
                    {format(parseISO(stats.biggestWin.date), 'MMM dd, yyyy')}
                  </p>
                  <p className="text-[10px] text-emerald-600 italic mt-2">{stats.biggestWin.gameName}</p>
                </div>
              ) : (
                <p className="text-xs text-emerald-600 italic">No wins recorded yet.</p>
              )}
            </div>
            <div className="p-5 bg-rose-50/50 rounded-2xl border border-rose-100">
              <h4 className="text-xs font-bold text-rose-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Frown size={14} /> Toughest Loss
              </h4>
              {stats.biggestLoss ? (
                <div>
                  <p className="text-xl font-black text-rose-900">{stats.biggestLoss.yourScore}-{stats.biggestLoss.opponentScore}</p>
                  <p className="text-xs font-bold text-rose-700 mt-1">
                    {format(parseISO(stats.biggestLoss.date), 'MMM dd, yyyy')}
                  </p>
                  <p className="text-[10px] text-rose-600 italic mt-2">{stats.biggestLoss.gameName}</p>
                </div>
              ) : (
                <p className="text-xs text-rose-600 italic">No losses recorded yet.</p>
              )}
            </div>
          </div>

          {/* Match History List */}
          <div>
            <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-widest mb-4">Partnership History</h4>
            <div className="space-y-3">
              {matches.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(m => (
                <div key={m.id} className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  <div>
                    <p className="text-sm font-bold text-[#1E293B]">{m.gameName}</p>
                    <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">
                      {format(parseISO(m.date), 'MMM dd, yyyy')} • vs {m.opponents?.filter(o => o).join(', ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-[#1E293B]">{m.yourScore}-{m.opponentScore}</p>
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-widest",
                      m.result === 'Win' ? "text-emerald-600" : "text-rose-600"
                    )}>
                      {m.result}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function HeadToHeadModal({ opponent, matches, onClose }: { opponent: string, matches: Match[], onClose: () => void }) {
  const stats = useMemo(() => {
    const total = matches.length;
    const wins = matches.filter(m => m.result === 'Win').length;
    const losses = total - wins;
    const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

    let biggestWin: Match | null = null;
    let maxWinMargin = -1;
    let biggestLoss: Match | null = null;
    let maxLossMargin = -1;

    matches.forEach(m => {
      const margin = Math.abs(m.yourScore - m.opponentScore);
      if (m.result === 'Win') {
        if (margin > maxWinMargin) {
          maxWinMargin = margin;
          biggestWin = m;
        }
      } else {
        if (margin > maxLossMargin) {
          maxLossMargin = margin;
          biggestLoss = m;
        }
      }
    });

    return { total, wins, losses, winRate, biggestWin, biggestLoss };
  }, [matches]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-[#F1F5F9] flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#10B981] rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
              <Trophy size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1E293B]">Head to Head</h3>
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">vs {opponent}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-[#E2E8F0] rounded-full transition-all text-[#64748B]"
          >
            <XCircle size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] text-center">
              <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1">Played</p>
              <p className="text-2xl font-black text-[#1E293B]">{stats.total}</p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Wins</p>
              <p className="text-2xl font-black text-emerald-900">{stats.wins}</p>
            </div>
            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 text-center">
              <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest mb-1">Losses</p>
              <p className="text-2xl font-black text-rose-900">{stats.losses}</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-center">
              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">Win Rate</p>
              <p className="text-2xl font-black text-amber-900">{stats.winRate}%</p>
            </div>
          </div>

          {/* Records */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100">
              <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Trophy size={14} /> Biggest Win
              </h4>
              {stats.biggestWin ? (
                <div>
                  <p className="text-xl font-black text-emerald-900">{stats.biggestWin.yourScore}-{stats.biggestWin.opponentScore}</p>
                  <p className="text-xs font-bold text-emerald-700 mt-1">
                    {format(parseISO(stats.biggestWin.date), 'MMM dd, yyyy')}
                  </p>
                  <p className="text-[10px] text-emerald-600 italic mt-2">{stats.biggestWin.gameName}</p>
                </div>
              ) : (
                <p className="text-xs text-emerald-600 italic">No wins recorded yet.</p>
              )}
            </div>
            <div className="p-5 bg-rose-50/50 rounded-2xl border border-rose-100">
              <h4 className="text-xs font-bold text-rose-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Frown size={14} /> Biggest Loss
              </h4>
              {stats.biggestLoss ? (
                <div>
                  <p className="text-xl font-black text-rose-900">{stats.biggestLoss.yourScore}-{stats.biggestLoss.opponentScore}</p>
                  <p className="text-xs font-bold text-rose-700 mt-1">
                    {format(parseISO(stats.biggestLoss.date), 'MMM dd, yyyy')}
                  </p>
                  <p className="text-[10px] text-rose-600 italic mt-2">{stats.biggestLoss.gameName}</p>
                </div>
              ) : (
                <p className="text-xs text-rose-600 italic">No losses recorded yet.</p>
              )}
            </div>
          </div>

          {/* Match History List */}
          <div>
            <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-widest mb-4">Match History</h4>
            <div className="space-y-3">
              {matches.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(m => (
                <div key={m.id} className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  <div>
                    <p className="text-sm font-bold text-[#1E293B]">{m.gameName}</p>
                    <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">
                      {format(parseISO(m.date), 'MMM dd, yyyy')} • {m.location || 'No Location'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-[#1E293B]">{m.yourScore}-{m.opponentScore}</p>
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-widest",
                      m.result === 'Win' ? "text-emerald-600" : "text-rose-600"
                    )}>
                      {m.result}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string, value: string | number, icon: React.ReactNode, color: 'blue' | 'emerald' | 'rose' | 'amber' | 'indigo' }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#E2E8F0] space-y-3">
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center border", colors[color])}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">{label}</p>
        <p className="text-xl font-black text-[#1E293B]">{value}</p>
      </div>
    </div>
  );
}

function ProfileView({ matches, profile, onUpdateProfile }: { 
  matches: Match[], 
  profile: Profile, 
  onUpdateProfile: (p: Profile) => void 
}) {
  const [selectedOpponent, setSelectedOpponent] = useState<string | null>(null);
  const [selectedTeammate, setSelectedTeammate] = useState<string | null>(null);

  const stats = useMemo(() => {
    const total = matches.length;
    const wins = matches.filter(m => m.result === 'Win').length;
    const losses = total - wins;
    const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
    const avgPoints = total > 0 ? (matches.reduce((acc, m) => acc + m.yourScore, 0) / total).toFixed(1) : '0';

    // Advanced Stats
    const courts: Record<string, number> = {};
    const teammates: Record<string, { wins: number, total: number }> = {};
    const opponents: Record<string, { wins: number, total: number }> = {};

    matches.forEach(m => {
      if (m.location) courts[m.location] = (courts[m.location] || 0) + 1;
      
      if (m.teammate) {
        if (!teammates[m.teammate]) teammates[m.teammate] = { wins: 0, total: 0 };
        teammates[m.teammate].total++;
        if (m.result === 'Win') teammates[m.teammate].wins++;
      }

      m.opponents?.forEach(o => {
        if (o) {
          if (!opponents[o]) opponents[o] = { wins: 0, total: 0 };
          opponents[o].total++;
          if (m.result === 'Win') opponents[o].wins++;
        }
      });
    });

    const favoriteCourt = Object.entries(courts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    
    const teammateStats = Object.entries(teammates)
      .filter(([_, s]) => s.total >= 1)
      .map(([name, s]) => ({ name, rate: Math.round((s.wins / s.total) * 100), total: s.total }))
      .sort((a, b) => b.rate - a.rate || b.total - a.total);
    const favoriteTeammate = teammateStats[0] || { name: 'N/A', rate: 0 };

    const opponentStats = Object.entries(opponents)
      .filter(([_, s]) => s.total >= 1)
      .map(([name, s]) => ({ name, rate: Math.round((s.wins / s.total) * 100), total: s.total }))
      .sort((a, b) => a.rate - b.rate || b.total - a.total);
    const toughestOpponent = opponentStats[0] || { name: 'N/A', rate: 0 };

    const bunnyStats = Object.entries(opponents)
      .filter(([_, s]) => s.total >= 1)
      .map(([name, s]) => ({ name, rate: Math.round((s.wins / s.total) * 100), total: s.total }))
      .sort((a, b) => b.rate - a.rate || b.total - a.total);
    const yourBunny = bunnyStats[0] || { name: 'N/A', rate: 0 };

    return { total, wins, losses, winRate, avgPoints, favoriteCourt, favoriteTeammate, toughestOpponent, yourBunny };
  }, [matches]);

  const handleImageUpload = (field: 'profilePhoto' | 'racket' | 'shoes', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (field === 'profilePhoto') {
          onUpdateProfile({ ...profile, profilePhoto: base64 });
        } else if (field === 'racket') {
          onUpdateProfile({ ...profile, racket: { ...profile.racket, image: base64 } });
        } else if (field === 'shoes') {
          onUpdateProfile({ ...profile, shoes: { ...profile.shoes, image: base64 } });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8">
      {/* Profile Header Card */}
      <section className="bg-white rounded-3xl shadow-xl border border-[#E2E8F0] overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-[#10B981] to-[#3B82F6]" />
        <div className="px-8 pb-8 -mt-16 flex flex-col items-center">
          <div className="relative group mb-4">
            <div className="w-32 h-32 rounded-2xl border-4 border-white bg-[#F1F5F9] shadow-xl overflow-hidden">
              {profile.profilePhoto ? (
                <img src={profile.profilePhoto} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#94A3B8]">
                  <User size={48} />
                </div>
              )}
            </div>
            <label className="absolute bottom-2 right-2 p-2 bg-white rounded-lg shadow-md cursor-pointer hover:bg-[#F1F5F9] transition-all border border-[#E2E8F0]">
              <Camera size={16} className="text-[#64748B]" />
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload('profilePhoto', e)} />
            </label>
          </div>
          <div className="w-full max-w-xs">
            <input 
              type="text" 
              value={profile.name}
              onChange={(e) => onUpdateProfile({ ...profile, name: e.target.value })}
              className="text-2xl font-black text-[#0F172A] bg-transparent border-none focus:ring-0 p-0 w-full text-center"
              placeholder="Enter Name"
            />
          </div>
        </div>
      </section>

      {/* Stats Grid - Different Style */}
      <section className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
        <div className="bg-[#1E293B] p-4 md:p-6 rounded-2xl md:rounded-3xl text-white space-y-1 active:scale-95 transition-all">
          <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Matches</p>
          <p className="text-2xl md:text-3xl font-black">{stats.total}</p>
        </div>
        <div className="bg-emerald-500 p-4 md:p-6 rounded-2xl md:rounded-3xl text-white space-y-1 active:scale-95 transition-all">
          <p className="text-[9px] md:text-[10px] font-bold text-emerald-100 uppercase tracking-widest">Wins</p>
          <p className="text-2xl md:text-3xl font-black">{stats.wins}</p>
        </div>
        <div className="bg-rose-500 p-4 md:p-6 rounded-2xl md:rounded-3xl text-white space-y-1 active:scale-95 transition-all">
          <p className="text-[9px] md:text-[10px] font-bold text-rose-100 uppercase tracking-widest">Losses</p>
          <p className="text-2xl md:text-3xl font-black">{stats.losses}</p>
        </div>
        <div className="bg-amber-500 p-4 md:p-6 rounded-2xl md:rounded-3xl text-white space-y-1 active:scale-95 transition-all">
          <p className="text-[9px] md:text-[10px] font-bold text-amber-100 uppercase tracking-widest">Win Rate</p>
          <p className="text-2xl md:text-3xl font-black">{stats.winRate}%</p>
        </div>
        <div className="bg-indigo-500 p-4 md:p-6 rounded-2xl md:rounded-3xl text-white space-y-1 active:scale-95 transition-all">
          <p className="text-[9px] md:text-[10px] font-bold text-indigo-100 uppercase tracking-widest">Avg Pts</p>
          <p className="text-2xl md:text-3xl font-black">{stats.avgPoints}</p>
        </div>
      </section>

      {/* Advanced Stats & Gear */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Advanced Stats */}
        <section className="bg-white rounded-3xl shadow-sm border border-[#E2E8F0] p-8 space-y-6">
          <h3 className="text-lg font-black text-[#0F172A] flex items-center gap-2">
            <BarChart3 className="text-[#10B981]" size={20} />
            Performance Insights
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <InsightCard icon={<MapPin size={18} />} label="Favorite Court" value={stats.favoriteCourt} color="emerald" />
            <InsightCard 
              icon={<Users size={18} />} 
              label="Favorite Teammate" 
              value={stats.favoriteTeammate.name} 
              subValue={stats.favoriteTeammate.name !== 'N/A' ? `${stats.favoriteTeammate.rate}% Win Rate` : undefined}
              color="blue" 
              onClick={() => stats.favoriteTeammate.name !== 'N/A' && setSelectedTeammate(stats.favoriteTeammate.name)}
            />
            <InsightCard 
              icon={<Target size={18} />} 
              label="Toughest Opponent" 
              value={stats.toughestOpponent.name} 
              subValue={stats.toughestOpponent.name !== 'N/A' ? `${stats.toughestOpponent.rate}% Win Rate` : undefined}
              color="rose" 
              onClick={() => stats.toughestOpponent.name !== 'N/A' && setSelectedOpponent(stats.toughestOpponent.name)}
            />
            <InsightCard 
              icon={<Zap size={18} />} 
              label="Your Bunny" 
              value={stats.yourBunny.name} 
              subValue={stats.yourBunny.name !== 'N/A' ? `${stats.yourBunny.rate}% Win Rate` : undefined}
              color="amber" 
              onClick={() => stats.yourBunny.name !== 'N/A' && setSelectedOpponent(stats.yourBunny.name)}
            />
          </div>
        </section>

        {/* Gear Details */}
        <section className="bg-white rounded-3xl shadow-sm border border-[#E2E8F0] p-6 md:p-8 space-y-6">
          <h3 className="text-lg font-black text-[#0F172A] flex items-center gap-2">
            <Trophy className="text-[#3B82F6]" size={20} />
            Equipment & Gear
          </h3>
          <div className="space-y-4 md:space-y-6">
            {/* Racket */}
            <div className="flex items-center gap-4 md:gap-6 p-3 md:p-4 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-xl border border-[#E2E8F0] flex items-center justify-center overflow-hidden relative group">
                {profile.racket.image ? (
                  <img src={profile.racket.image} alt="Racket" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <Upload size={20} className="text-[#94A3B8]" />
                )}
                <label className="absolute inset-0 bg-black/40 opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  <Upload size={18} className="text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload('racket', e)} />
                </label>
              </div>
              <div className="flex-1">
                <p className="text-[9px] md:text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Racket / Bat</p>
                <input 
                  type="text" 
                  value={profile.racket.name}
                  onChange={(e) => onUpdateProfile({ ...profile, racket: { ...profile.racket, name: e.target.value } })}
                  className="text-base md:text-lg font-bold text-[#1E293B] bg-transparent border-none focus:ring-0 p-0 w-full"
                  placeholder="e.g., Yonex Astrox 99"
                />
              </div>
            </div>

            {/* Shoes */}
            <div className="flex items-center gap-4 md:gap-6 p-3 md:p-4 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-xl border border-[#E2E8F0] flex items-center justify-center overflow-hidden relative group">
                {profile.shoes.image ? (
                  <img src={profile.shoes.image} alt="Shoes" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <Upload size={20} className="text-[#94A3B8]" />
                )}
                <label className="absolute inset-0 bg-black/40 opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  <Upload size={18} className="text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload('shoes', e)} />
                </label>
              </div>
              <div className="flex-1">
                <p className="text-[9px] md:text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Shoes</p>
                <input 
                  type="text" 
                  value={profile.shoes.name}
                  onChange={(e) => onUpdateProfile({ ...profile, shoes: { ...profile.shoes, name: e.target.value } })}
                  className="text-base md:text-lg font-bold text-[#1E293B] bg-transparent border-none focus:ring-0 p-0 w-full"
                  placeholder="e.g., Yonex Power Cushion"
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      <AnimatePresence>
        {selectedOpponent && (
          <HeadToHeadModal 
            opponent={selectedOpponent}
            matches={matches.filter(m => m.opponents?.includes(selectedOpponent))}
            onClose={() => setSelectedOpponent(null)}
          />
        )}
        {selectedTeammate && (
          <TeammateHistoryModal 
            teammate={selectedTeammate}
            matches={matches.filter(m => m.teammate === selectedTeammate)}
            onClose={() => setSelectedTeammate(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function InsightCard({ icon, label, value, subValue, color, onClick }: { 
  icon: React.ReactNode, 
  label: string, 
  value: string, 
  subValue?: string,
  color: 'emerald' | 'blue' | 'rose' | 'amber',
  onClick?: () => void
}) {
  const colors = {
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
  };

  return (
    <button 
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "flex items-center gap-4 p-4 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] text-left transition-all w-full",
        onClick ? "hover:border-slate-300 hover:shadow-md cursor-pointer active:scale-[0.98]" : "cursor-default"
      )}
    >
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border shrink-0", colors[color])}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">{label}</p>
        <p className="text-sm font-bold text-[#1E293B] truncate">{value}</p>
        {subValue && (
          <p className={cn("text-[10px] font-bold mt-0.5", 
            color === 'rose' ? "text-rose-500" : 
            color === 'emerald' ? "text-emerald-500" : 
            color === 'blue' ? "text-blue-500" : "text-amber-500"
          )}>
            {subValue}
          </p>
        )}
      </div>
      {onClick && (
        <ChevronRight size={16} className="text-[#94A3B8]" />
      )}
    </button>
  );
}
