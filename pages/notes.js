import { useEffect, useState } from 'react';
import Router from 'next/router';

function authFetch(path, opts) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return fetch(path, { headers: { Authorization: token ? 'Bearer ' + token : '' , 'Content-Type': 'application/json'}, ...opts });
}

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [me, setMe] = useState(null);
  const [error, setError] = useState('');

  async function loadMe() {
    const res = await authFetch('/api/auth/me');
    if (!res.ok) { Router.push('/'); return; }
    const j = await res.json();
    setMe(j);
  }

  async function loadNotes() {
    const res = await authFetch('/api/notes');
    if (!res.ok) {
      const err = await res.json();
      setError(err.error || 'Failed to load notes');
      return;
    }
    const j = await res.json();
    setNotes(j);
  }

  useEffect(()=>{ loadMe(); loadNotes(); }, []);

  async function createNote(e) {
    e.preventDefault();
    setError('');
    const res = await authFetch('/api/notes', {
      method: 'POST',
      body: JSON.stringify({ title, content })
    });
    const j = await res.json();
    if (!res.ok) {
      setError(j.error || 'Failed');
      return;
    }
    setTitle(''); setContent('');
    loadNotes();
  }

  async function del(id) {
    if (!confirm('Delete?')) return;
    await authFetch('/api/notes/' + id, { method: 'DELETE' });
    loadNotes();
  }

  async function upgrade() {
    if (!me) return;
    const res = await authFetch('/api/tenants/' + me.tenant.slug + '/upgrade', { method: 'POST' });
    if (res.ok) {
      alert('Upgraded to Pro');
      loadNotes();
      loadMe();
    } else {
      const j = await res.json();
      alert(j.error || 'Upgrade failed');
    }
  }

  return (
    <div style={{ maxWidth: 780, margin: '3rem auto', fontFamily: 'sans-serif' }}>
      <h1>Notes</h1>
      {me && <p>Tenant: <b>{me.tenant.slug}</b> — Plan: <b>{me.tenant.plan}</b> — Role: <b>{me.role}</b></p>}
      <form onSubmit={createNote}>
        <input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} style={{ width: '100%', padding: 8 }} /><br /><br />
        <textarea placeholder="Content" value={content} onChange={e=>setContent(e.target.value)} style={{ width: '100%', padding: 8 }} rows={6} /><br />
        <button type="submit">Create note</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <h2 style={{ marginTop: 24 }}>Your notes</h2>
      <ul>
        {notes.map(n=>(
          <li key={n.id} style={{ marginBottom: 12, border: '1px solid #ddd', padding: 8 }}>
            <strong>{n.title}</strong> <br />
            <small>{new Date(n.createdAt).toLocaleString()}</small>
            <p>{n.content}</p>
            <button onClick={()=>del(n.id)}>Delete</button>
          </li>
        ))}
      </ul>

      {me && me.tenant.plan === 'FREE' && notes.length >= 3 && (
        <div style={{ border: '1px dashed orange', padding: 12, marginTop: 16 }}>
          <p>Free plan note limit reached (3). Upgrade to Pro to create unlimited notes.</p>
          {me.role === 'ADMIN' ? (
            <button onClick={upgrade}>Upgrade to Pro</button>
          ) : (
            <p>Ask your tenant Admin to upgrade.</p>
          )}
        </div>
      )}
    </div>
  );
}
