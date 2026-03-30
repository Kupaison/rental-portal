import React, { useState } from 'react'
import { supabase, AGENT_NAME } from '../lib/supabase'
import emailjs from '@emailjs/browser'

export default function InterestModal({ listing, onClose }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' })
  const [status, setStatus] = useState('idle') // idle | sending | success | error

  if (!listing) return null

  async function handleSubmit() {
    if (!form.name.trim()) return alert('Please enter your name')
    setStatus('sending')

    try {
      // Save to Supabase
      await supabase.from('interest_submissions').insert({
        listing_id: listing.id,
        listing_address: `${listing.address}, ${listing.city}, ${listing.state} ${listing.zip}`,
        client_name: form.name,
        client_phone: form.phone,
        client_email: form.email,
        message: form.message
      })

      // Send email via EmailJS
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

      if (serviceId && serviceId !== 'your_emailjs_service_id') {
        await emailjs.send(serviceId, templateId, {
          to_email: 'kupadoesrealestate@gmail.com',
          agent_name: AGENT_NAME,
          client_name: form.name,
          client_phone: form.phone || 'Not provided',
          client_email: form.email || 'Not provided',
          listing_address: `${listing.address}, ${listing.city}, ${listing.state} ${listing.zip}`,
          listing_price: `$${listing.price.toLocaleString()}/mo`,
          message: form.message || 'No additional message',
        }, publicKey)
      }

      setStatus('success')
    } catch (err) {
      console.error(err)
      setStatus('error')
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(15,15,13,0.7)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease'
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '40px',
        maxWidth: '480px',
        width: '100%',
        boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
        animation: 'fadeUp 0.3s ease'
      }}>
        {status === 'success' ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏠</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: '600', marginBottom: '10px' }}>
              Request Sent!
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.6 }}>
              Kupa will be in touch with you shortly about <strong>{listing.address}</strong>.
            </p>
            <button
              onClick={onClose}
              style={{ marginTop: '24px', padding: '12px 32px', background: 'var(--charcoal)', color: 'white', border: 'none', borderRadius: 'var(--radius)', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '28px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: '600', marginBottom: '6px' }}>
                I'm Interested
              </h2>
              <p style={{ color: 'var(--muted)', fontSize: '13px' }}>
                {listing.address}, {listing.city} · ${listing.price.toLocaleString()}/mo
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <Field label="Your Name *" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="First & Last" />
              <Field label="Phone Number" value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} placeholder="(555) 000-0000" type="tel" />
              <Field label="Email Address" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} placeholder="you@email.com" type="email" />
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: 'var(--muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Message (optional)
                </label>
                <textarea
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="Any questions or notes for Kupa..."
                  rows={3}
                  style={{
                    width: '100%', padding: '12px 14px', border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--radius)', fontSize: '14px', fontFamily: 'var(--font-body)',
                    outline: 'none', resize: 'vertical', color: 'var(--charcoal)',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={onClose}
                style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius)', fontSize: '14px', fontWeight: '500', color: 'var(--muted)', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={status === 'sending'}
                style={{
                  flex: 2, padding: '12px', background: status === 'sending' ? 'var(--muted)' : 'var(--charcoal)',
                  border: 'none', borderRadius: 'var(--radius)', fontSize: '14px',
                  fontWeight: '500', color: 'white', cursor: status === 'sending' ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => { if (status !== 'sending') e.currentTarget.style.background = 'var(--accent)' }}
                onMouseLeave={e => { if (status !== 'sending') e.currentTarget.style.background = 'var(--charcoal)' }}
              >
                {status === 'sending' ? 'Sending...' : 'Send to Kupa →'}
              </button>
            </div>
            {status === 'error' && (
              <p style={{ color: 'var(--accent)', fontSize: '12px', marginTop: '10px', textAlign: 'center' }}>
                Something went wrong. Please try again or text Kupa directly.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: 'var(--muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '12px 14px', border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius)', fontSize: '14px', fontFamily: 'var(--font-body)',
          outline: 'none', color: 'var(--charcoal)', transition: 'border-color 0.2s'
        }}
        onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
        onBlur={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
      />
    </div>
  )
}
