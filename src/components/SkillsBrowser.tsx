"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Toast from './Toast';

type Skill = {
  _id?: string;
  name: string;
  category: string;
  level: string;
  description?: string;
  tags?: string[];
};

const CATEGORIES = ['tech', 'music', 'languages', 'academics', 'management', 'arts', 'sports', 'cooking', 'crafts', 'other'];
const LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'];

export default function SkillsBrowser() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const session = useSession();

  const [form, setForm] = useState({ name: '', category: CATEGORIES[0], level: LEVELS[0], description: '', tags: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ id?: string; message: string; type?: 'success' | 'error' | 'info'; actionLabel?: string; action?: (() => void) } | null>(null);

  const loadSkills = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/skills');
      if (!res.ok) throw new Error(`Failed to load skills (${res.status})`);
      const data = await res.json();
      setSkills(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSkills();
  }, [loadSkills]);

  const handleAdd = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (isSubmitting) return;

    const payload = {
      name: form.name.trim(),
      category: form.category,
      level: form.level,
      description: form.description.trim(),
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    };

    if (!payload.name) {
      setError('Name is required');
      return;
    }

    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const optimistic: Skill = { _id: tempId, ...payload } as Skill;
    setSkills(prev => [optimistic, ...prev]);
    setForm({ name: '', category: CATEGORIES[0], level: LEVELS[0], description: '', tags: '' });
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        // handle rate limiting specially
        if (res.status === 429) {
          const retryAfter = res.headers.get('Retry-After');
          const secs = retryAfter ? `${retryAfter} seconds` : 'a while';
          throw new Error(`Too many requests. Try again in ${secs}`);
        }

        const errBody = await res.json().catch(() => ({}));
        // If server provided field errors, surface them
        if (errBody?.code === 'VALIDATION_ERROR' && errBody?.details?.fieldErrors) {
          setFormErrors(errBody.details.fieldErrors);
          throw new Error(errBody?.error || `Validation failed`);
        }
        throw new Error(errBody?.error || `Failed to create skill (${res.status})`);
      }
      const created = await res.json();
      // clear any previous form errors on success
      setFormErrors({});
      // Replace optimistic item with created one
      setSkills(prev => prev.map(s => (s._id === tempId ? created : s)));
          setToast({ id: created._id?.toString(), message: 'Skill added', type: 'success', actionLabel: 'Undo', action: async () => {
        try {
          // optimistic client-side removal
          setSkills(prev => prev.filter(s => s._id !== created._id));
          // Attempt server delete
          const del = await fetch(`/api/skills?id=${created._id}`, { method: 'DELETE' });
          if (!del.ok) {
            // if delete failed, reload list
                await loadSkills();
            setToast({ message: 'Undo failed', type: 'error' });
            return;
          }
          setToast({ message: 'Skill removed', type: 'success' });
        } catch (e) {
            await loadSkills();
          setToast({ message: 'Undo failed', type: 'error' });
        }
      }});
    } catch (err: any) {
      // Remove optimistic item
      setSkills(prev => prev.filter(s => s._id !== tempId));
      const msg = err?.message || String(err);
      setToast({ message: `Failed to add skill: ${msg}`, type: 'error' });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setToast(null), 4000);
    }
  }, [form, isSubmitting, loadSkills]);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Browse Skills</h1>
      <section className="mb-6">
        {session?.status !== 'authenticated' ? (
          <div className="mb-4">
            <p className="text-sm text-gray-600">You must be signed in to add skills.</p>
            <a href="/auth/signin" className="text-slate-700 underline">Sign in</a>
          </div>
        ) : (
          <form onSubmit={handleAdd} className="grid grid-cols-1 gap-2">
            <input
              className="border rounded px-3 py-2"
              placeholder="Skill name"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
            {formErrors.name && <p className="text-sm text-red-600">{formErrors.name}</p>}

            <div className="flex gap-2">
              <select className="border rounded px-3 py-2 flex-1" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {formErrors.category && <p className="text-sm text-red-600">{formErrors.category}</p>}
              <select className="border rounded px-3 py-2" value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))}>
                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              {formErrors.level && <p className="text-sm text-red-600">{formErrors.level}</p>}
            </div>

            <input className="border rounded px-3 py-2" placeholder="Short description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />

            <input className="border rounded px-3 py-2" placeholder="Tags (comma separated)" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />

            <div className="flex gap-2">
              <button type="submit" className={`px-4 py-2 rounded text-white ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-slate-800'}`} disabled={isSubmitting} aria-disabled={isSubmitting}>Add skill</button>
              <button type="button" className="px-4 py-2 border rounded" onClick={loadSkills}>Refresh</button>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </form>
        )}
      </section>

      <section>
        {loading && <p>Loading...</p>}
        {!loading && skills.length === 0 && <p className="text-sm text-gray-600">No skills found.</p>}

        <ul className="space-y-3">
          {skills.map(s => (
            <li key={s._id || `${s.name}-${Math.random()}`} className={`p-3 border rounded transform transition-all duration-200 hover:scale-[1.01] ${s._id?.toString().startsWith('temp-') ? 'opacity-80 animate-pulse' : 'opacity-100'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{s.name}</h3>
                  <p className="text-sm text-gray-500">{s.category} • {s.level}</p>
                </div>
                <div className="text-sm text-gray-400">{s.tags?.slice(0,3).join(', ')}</div>
              </div>
              {s.description && <p className="mt-2 text-sm text-gray-700">{s.description}</p>}
            </li>
          ))}
        </ul>
      </section>

      {/* Toast */}
      {toast && (
        <div>
          {/* Render using reusable Toast component */}
          <Toast
            message={toast.message}
            type={toast.type === 'error' ? 'error' : (toast.type === 'success' ? 'success' : 'info')}
            onClose={() => setToast(null)}
            action={toast.action ? { label: toast.actionLabel || 'Action', onClick: toast.action } : undefined}
          />
        </div>
      )}
    </div>
  );
}
