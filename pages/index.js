import { useState } from 'react';
import Router from 'next/router';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Login failed');
      return;
    }
    localStorage.setItem('token', data.token);
    Router.push('/notes');
  }

  return (
    <div style={{ maxWidth: 520, margin: '4rem auto', fontFamily: 'sans-serif' }}>
      <h1>Notes SaaS — Login</h1>
      <p>Use the seeded accounts (password: <b>password</b>): admin@acme.test, user@acme.test, admin@globex.test, user@globex.test</p>
      <form onSubmit={submit}>
        <label>Email</label><br />
        <input value={email} onChange={e=>setEmail(e.target.value)} style={{ width: '100%', padding: '8px' }} /><br /><br />
        <label>Password</label><br />
        <input value={password} onChange={e=>setPassword(e.target.value)} style={{ width: '100%', padding: '8px' }} /><br /><br />
        <button type="submit">Login</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
