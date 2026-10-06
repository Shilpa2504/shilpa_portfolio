import { useEffect, useRef, type KeyboardEvent } from 'react';
import { motion } from 'motion/react';
import { MessageCircle, X } from 'lucide-react';
import { useQuietMotion } from './EngineeringVisuals';
import ContactForm from './ContactForm';

/** Presents a native modal message composer with Brevo email service. */
export default function ContactDialog({ onClose }: Readonly<{ onClose: () => void }>) {
  const dialog = useRef<HTMLDialogElement>(null);
  const quiet = useQuietMotion();

  /** Keeps Tab within the composer instead of allowing the browser chrome to take focus. */
  function containFocus(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== 'Tab') return;
    const controls = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        'button:not(:disabled), a[href], input:not(:disabled), textarea:not(:disabled), iframe, [tabindex="0"]'
      )
    ).filter(
      (element) => element.tabIndex >= 0 && !element.closest('[aria-hidden="true"]') && element.getClientRects().length > 0
    );
    const first = controls[0];
    const last = controls.at(-1);
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  useEffect(() => {
    const element = dialog.current;
    const opener = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    element?.showModal();
    element?.querySelector<HTMLInputElement>('#contact-name')?.focus({ preventScroll: true });
    document.body.style.overflow = 'hidden';

    return () => {
      element?.close();
      document.body.style.overflow = overflow;
      opener?.focus({ preventScroll: true });
    };
  }, []);

  return (
    <dialog
      ref={dialog}
      className="contact-dialog"
      aria-labelledby="contact-dialog-title"
      aria-describedby="contact-dialog-description"
      onKeyDown={containFocus}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <motion.div
        className="contact-dialog-panel"
        initial={quiet ? false : { opacity: 0, y: 25, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35 }}
      >
        <header className="chat-header">
          <span className="chat-avatar" aria-hidden="true">
            SG
          </span>
          <div>
            <h2 id="contact-dialog-title">Talk to Shilpa</h2>
            <p>A direct message to my inbox.</p>
          </div>
          <button className="icon-button" aria-label="Close message dialog" onClick={onClose}>
            <X size={21} />
          </button>
        </header>
        <div className="chat-body">
          <div className="chat-bubble">
            <MessageCircle size={18} aria-hidden="true" />
            <p id="contact-dialog-description">Have a role or project in mind? Share the details and your email so I can reply.</p>
          </div>
          <ContactForm />
        </div>
      </motion.div>
    </dialog>
  );
}