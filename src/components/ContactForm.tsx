import { useState, type FormEvent } from 'react';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { sendContactEmail } from '../services/sendEmail';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; text: string }>({ type: null, text: '' });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setStatus({ type: null, text: '' });

    try {
      const result = await sendContactEmail(formData);
      if (result.ok) {
        setStatus({ type: 'success', text: result.message });
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus({ type: 'error', text: result.message });
      }
    } catch (error) {
      setStatus({
        type: 'error',
        text: 'An unexpected error occurred while sending your message. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-form-card">
      <form onSubmit={handleSubmit} className="contact-form-inner" aria-label="Contact form">
        <div className="form-group">
          <input
            type="text"
            id="contact-name"
            name="name"
            required
            maxLength={100}
            placeholder="Your Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <input
            type="email"
            id="contact-email"
            name="email"
            required
            maxLength={254}
            placeholder="Your Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <input
            type="text"
            id="contact-subject"
            name="subject"
            required
            maxLength={150}
            placeholder="Subject"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <textarea
            id="contact-message"
            name="message"
            required
            rows={5}
            minLength={5}
            maxLength={4000}
            placeholder="Your Message"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="form-textarea"
          />
        </div>

        {status.type && (
          <div className={`form-status-alert status-${status.type}`}>
            {status.type === 'success' ? (
              <CheckCircle2 size={18} className="status-icon" />
            ) : (
              <AlertCircle size={18} className="status-icon" />
            )}
            <span>{status.text}</span>
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-send-message">
          {loading ? (
            <>
              <Loader2 size={18} className="spin-icon" />
              <span>Sending Message...</span>
            </>
          ) : (
            <>
              <span>Send Message</span>
              <Send size={17} className="send-icon" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
