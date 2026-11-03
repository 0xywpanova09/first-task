import { useEffect, useState } from 'react';
import { createCheckIn, deleteCheckIn, getCheckIns } from './api';

const initialForm = {
  name: '',
  mood: 'Good',
  workedOn: '',
  blockers: '',
};

function formatDate(value) {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export default function App() {
  const [form, setForm] = useState(initialForm);
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [connectionError, setConnectionError] = useState('');
  const [formError, setFormError] = useState('');

  async function loadCheckIns() {
    try {
      const data = await getCheckIns();
      setCheckins(data);
      setConnectionError('');
    } catch {
      setConnectionError(
        'Cannot reach the backend. Check that the API is running and try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCheckIns();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError('');

    if (!form.name.trim()) {
      setFormError('Name is required');
      return;
    }

    if (!form.mood) {
      setFormError('Mood is required');
      return;
    }

    setSubmitting(true);
    try {
      const created = await createCheckIn({
        name: form.name.trim(),
        mood: form.mood,
        workedOn: form.workedOn.trim(),
        blockers: form.blockers.trim(),
      });
      setCheckins((prev) => [created, ...prev]);
      setForm(initialForm);
      setConnectionError('');
    } catch (error) {
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        setConnectionError(
          'Cannot reach the backend. Check that the API is running and try again.'
        );
      } else {
        setFormError(error.message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteCheckIn(id);
      setCheckins((prev) => prev.filter((item) => item._id !== id));
      setConnectionError('');
    } catch (error) {
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        setConnectionError(
          'Cannot reach the backend. Check that the API is running and try again.'
        );
      } else {
        setFormError(error.message);
      }
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>TeamPulse</h1>
        <p>Share a short daily check-in with your team.</p>
      </header>

      {connectionError && <div className="banner">{connectionError}</div>}

      <section className="panel">
        <h2>New check-in</h2>
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your name"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="mood">Mood</label>
            <select id="mood" name="mood" value={form.mood} onChange={handleChange} required>
              <option value="Good">Good</option>
              <option value="Okay">Okay</option>
              <option value="Bad">Bad</option>
              <option value="5">5 - Great</option>
              <option value="4">4 - Good</option>
              <option value="3">3 - Okay</option>
              <option value="2">2 - Low</option>
              <option value="1">1 - Bad</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="workedOn">What I worked on</label>
            <textarea
              id="workedOn"
              name="workedOn"
              value={form.workedOn}
              onChange={handleChange}
              placeholder="Brief update"
            />
          </div>

          <div className="field">
            <label htmlFor="blockers">Blockers</label>
            <textarea
              id="blockers"
              name="blockers"
              value={form.blockers}
              onChange={handleChange}
              placeholder="Anything blocking you?"
            />
          </div>

          {formError && <p className="form-error">{formError}</p>}

          <div className="actions">
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Submit check-in'}
            </button>
          </div>
        </form>
      </section>

      <section className="panel">
        <h2>Recent check-ins</h2>
        {loading ? (
          <p className="empty">Loading...</p>
        ) : checkins.length === 0 ? (
          <p className="empty">No check-ins yet. Be the first to share one.</p>
        ) : (
          <div className="list">
            {checkins.map((item) => (
              <article className="card" key={item._id}>
                <div className="card-top">
                  <div>
                    <p className="card-name">{item.name}</p>
                    <p className="card-meta">{formatDate(item.createdAt)}</p>
                  </div>
                  <div className="actions">
                    <span className="mood">{item.mood}</span>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => handleDelete(item._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="card-body">
                  {item.workedOn && (
                    <p>
                      <strong>Worked on:</strong> {item.workedOn}
                    </p>
                  )}
                  {item.blockers && (
                    <p>
                      <strong>Blockers:</strong> {item.blockers}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
