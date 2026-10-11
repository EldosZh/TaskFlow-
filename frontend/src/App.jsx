import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, CheckCircle2, Circle, ClipboardList, Clock3, ListTodo, LoaderCircle, Pencil, Plus, Search, Sparkles, Trash2, X } from 'lucide-react';
import { api } from './api.js';
import './App.css';

const filters = ['All', 'Active', 'Completed'];

function App() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, remaining: 0 });
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', description: '' });
  const requestId = useRef(0);

  const load = useCallback(async () => {
    const current = ++requestId.current;
    setLoading(true);
    setError('');
    try {
      const params = { limit: 100 };
      if (search.trim()) params.search = search.trim();
      if (filter !== 'All') params.completed = String(filter === 'Completed');
      const [items, counts] = await Promise.all([api.tasks(params), api.stats()]);
      if (current === requestId.current) { setTasks(items); setStats(counts); }
    } catch (err) {
      if (current === requestId.current) setError(err.message || 'Could not load tasks.');
    } finally {
      if (current === requestId.current) setLoading(false);
    }
  }, [search, filter]);

  useEffect(() => { const timer = setTimeout(load, 180); return () => clearTimeout(timer); }, [load]);
  useEffect(() => { if (!notice) return undefined; const timer = setTimeout(() => setNotice(''), 2600); return () => clearTimeout(timer); }, [notice]);

  async function submitTask(event) {
    event.preventDefault();
    if (!form.title.trim()) { setError('Add a title before saving.'); return; }
    setSaving(true); setError('');
    try {
      if (editing) await api.update(editing.id, { title: form.title, description: form.description });
      else await api.create({ title: form.title, description: form.description });
      setForm({ title: '', description: '' }); setEditing(null); setNotice(editing ? 'Task updated' : 'Task added'); await load();
    } catch (err) { setError(err.message || 'Could not save this task.'); }
    finally { setSaving(false); }
  }

  async function toggleTask(task) {
    setError('');
    try { await api.update(task.id, { completed: !task.completed }); setNotice(task.completed ? 'Task marked active' : 'Task completed'); await load(); }
    catch (err) { setError(err.message || 'Could not update task.'); }
  }

  async function deleteTask(task) {
    if (!window.confirm(`Delete “${task.title}”? This cannot be undone.`)) return;
    setError('');
    try { await api.remove(task.id); setNotice('Task deleted'); await load(); }
    catch (err) { setError(err.message || 'Could not delete task.'); }
  }

  function startEdit(task) { setEditing(task); setForm({ title: task.title, description: task.description }); document.getElementById('task-title')?.focus(); }
  function cancelEdit() { setEditing(null); setForm({ title: '', description: '' }); }

  return <main className="shell">
    <header className="topbar"><a className="brand" href="#top" aria-label="TaskFlow home"><span className="brand-icon"><Check size={19} strokeWidth={3}/></span><span>taskflow<span className="brand-dot">.</span></span></a><div className="topbar-right"><span className="today"><span className="online-dot"/>Your personal workspace</span><div className="avatar">T</div></div></header>
    <section className="hero" id="top"><div><div className="eyebrow"><Sparkles size={14}/> A LITTLE MORE IN FLOW</div><h1>Make room for<br/><span>what matters.</span></h1><p className="hero-copy">A clear mind starts with a clear list. Take it one step at a time.</p></div><div className="hero-art" aria-hidden="true"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="art-card"><div className="art-check"><Check size={24}/></div><div className="art-line long"/><div className="art-line short"/><div className="art-spark">✦</div></div><span className="art-star star-one">✳</span><span className="art-star star-two">✧</span></div></section>
    <section className="stats-grid" aria-label="Task statistics"><Stat icon={<ListTodo/>} label="Total tasks" value={stats.total} tone="violet"/><Stat icon={<CheckCircle2/>} label="Completed" value={stats.completed} tone="green"/><Stat icon={<Clock3/>} label="Still to do" value={stats.remaining} tone="amber"/></section>
    <section className="work-grid"><div className="panel create-panel"><div className="panel-heading"><div><span className="section-kicker">YOUR WORKSPACE</span><h2>{editing ? 'Edit task' : 'Add a task'}</h2></div><span className="heading-icon"><Plus size={19}/></span></div><p className="panel-subtitle">Small steps add up to big things.</p><form onSubmit={submitTask} className="task-form"><label htmlFor="task-title">Task name</label><input id="task-title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} maxLength={120} placeholder="e.g. Prepare project presentation" required/><label htmlFor="task-description">A few details <span>(optional)</span></label><textarea id="task-description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} maxLength={2000} rows={3} placeholder="Add a note to help you get started..."/><div className="form-bottom"><span className="hint"><span className="hint-dot"/> One thing at a time</span><div className="form-actions">{editing && <button type="button" className="cancel-button" onClick={cancelEdit}>Cancel</button>}<button className="primary-button" disabled={saving}>{saving ? <LoaderCircle className="spin" size={16}/> : editing ? <Check size={16}/> : <Plus size={17}/>} {saving ? 'Saving...' : editing ? 'Save changes' : 'Add task'}</button></div></div></form><div className="form-decoration" aria-hidden="true">✳</div></div>
    <div className="panel list-panel"><div className="list-header"><div><span className="section-kicker">YOUR PLAN</span><h2>Tasks <span className="task-count">{stats.total}</span></h2></div><div className="filter-tabs" role="tablist" aria-label="Filter tasks">{filters.map(item => <button role="tab" aria-selected={filter === item} className={filter === item ? 'filter active' : 'filter'} onClick={() => setFilter(item)} key={item}>{item}</button>)}</div></div><label className="searchbox"><Search size={17}/><span className="sr-only">Search tasks</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search your tasks..."/></label>
      {error && <div className="feedback error" role="alert"><span>{error}</span><button onClick={() => setError('')} aria-label="Dismiss error"><X size={16}/></button></div>}{notice && <div className="feedback success" role="status"><CheckCircle2 size={15}/>{notice}</div>}
      <div className="task-list" aria-live="polite">{loading ? <div className="state"><LoaderCircle className="spin" size={22}/><span>Gathering your tasks...</span></div> : tasks.length === 0 ? <div className="empty-state"><div className="empty-icon"><ClipboardList size={25}/></div><h3>{search || filter !== 'All' ? 'No matching tasks' : 'Your list is a blank canvas'}</h3><p>{search || filter !== 'All' ? 'Try another search or switch filters.' : 'Add your first task and make today count.'}</p></div> : tasks.map(task => <article className={`task-row ${task.completed ? 'is-completed' : ''}`} key={task.id}><button className="task-check" onClick={() => toggleTask(task)} aria-label={task.completed ? `Mark ${task.title} active` : `Complete ${task.title}`}>{task.completed ? <CheckCircle2 size={21}/> : <Circle size={21}/>}</button><div className="task-content"><h3>{task.title}</h3>{task.description && <p>{task.description}</p>}<span className="task-date">{task.completed ? 'Completed' : 'In progress'}</span></div><div className="task-actions"><button aria-label={`Edit ${task.title}`} onClick={() => startEdit(task)}><Pencil size={16}/></button><button aria-label={`Delete ${task.title}`} onClick={() => deleteTask(task)}><Trash2 size={16}/></button></div></article>)}</div><div className="list-footer"><span>Showing {tasks.length} of {stats.total} {stats.total === 1 ? 'task' : 'tasks'}</span><span><span className="online-dot"/> All changes saved</span></div></div></section>
    <footer><a className="footer-brand" href="#top">taskflow<span>.</span></a><span>Made for your next little win.</span><span className="tech-stack">React <i/> FastAPI <i/> SQLite</span></footer>
  </main>;
}

function Stat({ icon, label, value, tone }) { return <article className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><div><span className="stat-label">{label}</span><strong>{value}</strong></div><div className={`stat-mark ${tone}`} aria-hidden="true"/></article>; }

export default App;
