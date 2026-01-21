import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../providers/StoreProvider';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ui/ConfirmDialog';
import { LoadingButton } from '../components/LoadingComponents';
import { LoadingSpinner, LoadingOverlay } from '../components/LoadingSpinner';
import { Plus, Search, Download, Edit2, Trash2, X, CheckCircle, Users } from 'lucide-react';

export default function MentorsPage(){
  const { mentors, addMentor, updateMentor, deleteMentor, loading } = useStore();
  const toast = useToast();
  const { confirmDelete } = useConfirm();
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name:'', subject:'', email:'', contact:'', school:'', emirate:'' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  function openNew(){ setForm({ name:'', subject:'', email:'', contact:'', school:'', emirate:'' }); setEditing(null); setShowForm(true); }
  function openEdit(m){ setForm({ name:m.name||'', subject:m.subject||'', email:m.email||'', contact:m.contact||'', school:m.school||'', emirate:m.emirate||'' }); setEditing(m.id); setShowForm(true); }
  
  async function save(){
    if (!form.name.trim()) {
      toast.error('Please enter a mentor name');
      return;
    }
    setSaving(true);
    try {
      if(editing){ 
        await updateMentor(editing, form); 
        toast.success('Mentor updated successfully!');
        setEditing(null); 
      } else { 
        await addMentor(form); 
        toast.success('Mentor added successfully!');
      }
      setForm({ name:'', subject:'', email:'', contact:'', school:'', emirate:'' });
      setShowForm(false);
    } catch (error) {
      toast.error(editing ? 'Failed to update mentor' : 'Failed to add mentor');
      console.error('Save mentor error:', error);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = await confirmDelete("this mentor");
    if (!confirmed) return;
    setDeleting(id);
    try {
      await deleteMentor(id);
      toast.success('Mentor deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete mentor');
      console.error('Delete mentor error:', error);
    } finally {
      setDeleting(null);
    }
  }

  const [q, setQ] = useState('');
  const [filterSchool, setFilterSchool] = useState('');
  const [filterEmirate, setFilterEmirate] = useState('');
  const [filterSubject, setFilterSubject] = useState('');

  const schools = Array.from(new Set((mentors || []).map(m => (m.school || '').trim()).filter(Boolean))).sort();
  const emirates = Array.from(new Set((mentors || []).map(m => (m.emirate || '').trim()).filter(Boolean))).sort();
  const subjects = Array.from(new Set((mentors || []).map(m => (m.subject || '').trim()).filter(Boolean))).sort();

  const filtered = (mentors || []).filter(m => {
    const s = q.trim().toLowerCase();
    if (filterSchool && String(m.school || '').trim() !== filterSchool) return false;
    if (filterEmirate && String(m.emirate || '').trim() !== filterEmirate) return false;
    if (filterSubject && String(m.subject || '').trim() !== filterSubject) return false;
    if (!s) return true;
    return (m.name || '').toLowerCase().includes(s) || (m.email || '').toLowerCase().includes(s) || (m.school || '').toLowerCase().includes(s) || (m.subject || '').toLowerCase().includes(s);
  });

  function exportCSV(){
    const headers = ['Name','Subject','Email','Contact','School','Emirate'];
    const rows = filtered.map(m => [m.name||'', m.subject||'', m.email||'', m.contact||'', m.school||'', m.emirate||'']);
    const escape = (v='') => (`"${String(v).replace(/"/g,'""')}"`);
    const csv = [headers.map(escape).join(','), ...rows.map(r=>r.map(escape).join(','))].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mentors-export-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6 relative">
      {/* Loading overlay for operations */}
      <LoadingOverlay show={loading.operation} message="Processing..." />
      
      {/* Header */}
      <div className="rounded-2xl border panel bg-white p-6 shadow-sm flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mentors</h1>
          <p className="text-sm text-muted mt-1">Manage mentor list and contact details.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input placeholder="Search mentors…" value={q} onChange={e=>setQ(e.target.value)} className="form-input pl-10 w-48" />
          </div>
          <select className="form-input py-2.5 text-sm" value={filterSchool} onChange={e=>setFilterSchool(e.target.value)}>
            <option value="">All schools</option>
            {schools.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="form-input py-2.5 text-sm" value={filterEmirate} onChange={e=>setFilterEmirate(e.target.value)}>
            <option value="">All emirates</option>
            {emirates.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="form-input py-2.5 text-sm" value={filterSubject} onChange={e=>setFilterSubject(e.target.value)}>
            <option value="">All subjects</option>
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button className="btn btn-secondary" onClick={exportCSV}>
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="btn btn-primary" onClick={openNew}>
            <Plus className="w-4 h-4" />
            New Mentor
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border panel bg-white shadow-sm overflow-hidden relative">
        {loading.mentors && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
            <LoadingSpinner size="lg" message="Loading mentors..." />
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Subject</th>
                <th>Email</th>
                <th>Contact</th>
                <th>School</th>
                <th>Emirate</th>
                <th className="text-center w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map(m => (
                  <motion.tr 
                    key={m.id} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="group"
                  >
                    <td className="font-medium">{m.name}</td>
                    <td>{m.subject || '—'}</td>
                    <td className="text-indigo-600">{m.email}</td>
                    <td>{m.contact || '—'}</td>
                    <td>{m.school || '—'}</td>
                    <td>{m.emirate || '—'}</td>
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-indigo-600 transition-colors" 
                          onClick={() => openEdit(m)}
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-2 rounded-lg hover:bg-red-50 text-slate-600 hover:text-red-600 transition-colors disabled:opacity-50" 
                          onClick={() => handleDelete(m.id)}
                          disabled={deleting === m.id}
                          title="Delete"
                        >
                          {deleting === m.id ? (
                            <div className="w-4 h-4 border-2 border-red-200 border-t-red-600 rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="w-8 h-8 text-slate-300" />
                      <p>No mentors match your search.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 grid place-items-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
              onClick={() => !saving && setShowForm(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative w-full max-w-2xl rounded-2xl bg-white border shadow-xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b bg-slate-50">
                <h2 className="text-lg font-semibold">{editing ? 'Edit Mentor' : 'Add New Mentor'}</h2>
                <button 
                  className="p-2 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50" 
                  onClick={() => setShowForm(false)}
                  disabled={saving}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Form Content */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Name *</label>
                    <input 
                      className="form-input" 
                      value={form.name} 
                      onChange={e => setForm({...form, name: e.target.value})} 
                      placeholder="Enter mentor name"
                    />
                  </div>
                  <div>
                    <label className="form-label">Subject</label>
                    <input 
                      className="form-input" 
                      value={form.subject} 
                      onChange={e => setForm({...form, subject: e.target.value})} 
                      placeholder="e.g., Mathematics"
                    />
                  </div>
                  <div>
                    <label className="form-label">Email</label>
                    <input 
                      type="email"
                      className="form-input" 
                      value={form.email} 
                      onChange={e => setForm({...form, email: e.target.value})} 
                      placeholder="mentor@example.com"
                    />
                  </div>
                  <div>
                    <label className="form-label">Contact</label>
                    <input 
                      className="form-input" 
                      value={form.contact} 
                      onChange={e => setForm({...form, contact: e.target.value})} 
                      placeholder="+971 XX XXX XXXX"
                    />
                  </div>
                  <div>
                    <label className="form-label">School</label>
                    <input 
                      className="form-input" 
                      value={form.school} 
                      onChange={e => setForm({...form, school: e.target.value})} 
                      placeholder="School name"
                    />
                  </div>
                  <div>
                    <label className="form-label">Emirate</label>
                    <input 
                      className="form-input" 
                      value={form.emirate} 
                      onChange={e => setForm({...form, emirate: e.target.value})} 
                      placeholder="e.g., Dubai"
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-slate-50">
                <button 
                  className="btn btn-secondary" 
                  onClick={() => { 
                    setForm({ name:'', subject:'', email:'', contact:'', school:'', emirate:'' }); 
                    setEditing(null); 
                    setShowForm(false); 
                  }}
                  disabled={saving}
                >
                  Cancel
                </button>
                <LoadingButton 
                  className="btn btn-primary"
                  onClick={save}
                  loading={saving}
                  loadingText={editing ? 'Saving...' : 'Creating...'}
                >
                  {saving ? null : <CheckCircle className="w-4 h-4" />}
                  {editing ? 'Save Changes' : 'Create Mentor'}
                </LoadingButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
