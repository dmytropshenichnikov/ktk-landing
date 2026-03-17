'use client';

import { useState, FormEvent } from 'react';

export default function Home() {
  const [formData, setFormData] = useState({
    chatId: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ chatId: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <main style={{ maxWidth: '400px', margin: '2rem auto', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h1>Send TG Message</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label htmlFor="chatId" style={{ display: 'block', marginBottom: '0.5rem' }}>Telegram Chat ID:</label>
          <input
            type="text"
            id="chatId"
            name="chatId"
            value={formData.chatId}
            onChange={handleChange}
            placeholder="e.g. 123456789"
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div>
          <label htmlFor="message" style={{ display: 'block', marginBottom: '0.5rem' }}>Message:</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Your message here..."
            required
            rows={4}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <button
          type="submit"
          disabled={status === 'loading'}
          style={{ padding: '0.75rem', cursor: 'pointer', background: '#0070f3', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          {status === 'loading' ? 'Sending...' : 'Send to Telegram'}
        </button>
      </form>

      {status === 'success' && <p style={{ color: 'green', marginTop: '1rem' }}>Message sent!</p>}
      {status === 'error' && <p style={{ color: 'red', marginTop: '1rem' }}>Failed to send. Check logs.</p>}
    </main>
  );
}
