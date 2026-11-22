/**
 * Messages — student direct-messaging for Shared & Donated items.
 *
 * Routes:
 *   /messages        → list only (no thread selected)
 *   /messages/:convId → list + open thread
 *
 * Collections:
 *   conversations/{convId}
 *   conversations/{convId}/messages/{msgId}
 *
 * Never uses user?.uid — always auth.currentUser.uid.
 */

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  collection, doc, getDoc, addDoc, updateDoc,
  query, where, onSnapshot, orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/shared/Button';

// ── Helpers ───────────────────────────────────────────────────────────────────
const toMs = (ts) => ts?.toDate ? ts.toDate().getTime() : Number(ts) || 0;

const fmtTime = (ts) => {
  if (!ts) return '';
  const d = ts?.toDate ? ts.toDate() : new Date(Number(ts));
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const fmtDate = (ts) => {
  if (!ts) return '';
  const d = ts?.toDate ? ts.toDate() : new Date(Number(ts));
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

// ── Main component ────────────────────────────────────────────────────────────
export default function MessagesPage() {
  const { convId } = useParams();          // undefined on /messages
  const navigate   = useNavigate();
  const { customer } = useAuth();

  const [conversations, setConversations]   = useState([]);
  const [convLoading,   setConvLoading]     = useState(true);
  const [convError,     setConvError]       = useState('');

  const [messages,   setMessages]   = useState([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [msgError,   setMsgError]   = useState('');

  const [activeConv, setActiveConv] = useState(null);
  const [text,       setText]       = useState('');
  const [sending,    setSending]    = useState(false);
  const [sendError,  setSendError]  = useState('');
  const [statusError,setStatusError]= useState('');

  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);

  // ── Load conversations list ────────────────────────────────────────────────
  useEffect(() => {
    if (!db) {
      setConvError('Firestore is not initialised.');
      setConvLoading(false);
      return;
    }
    const fbUser = auth.currentUser;
    if (!fbUser) {
      setConvError('Please log in to view messages.');
      setConvLoading(false);
      return;
    }

    // No orderBy with array-contains — sort in JS instead
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', fbUser.uid),
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => toMs(b.lastMessageAt) - toMs(a.lastMessageAt));
        setConversations(rows);
        setConvLoading(false);
        setConvError('');
      },
      (err) => {
        setConvError(`Failed to load conversations: ${err.message}`);
        setConvLoading(false);
      },
    );
    return () => unsub();
  }, []);

  // ── Resolve active conversation object when convId changes ─────────────────
  useEffect(() => {
    if (!convId) { setActiveConv(null); return; }
    const found = conversations.find((c) => c.id === convId);
    if (found) {
      setActiveConv(found);
    } else if (db && conversations.length === 0 && convId) {
      // Conversations not loaded yet — fetch once
      getDoc(doc(db, 'conversations', convId))
        .then((snap) => { if (snap.exists()) setActiveConv({ id: snap.id, ...snap.data() }); })
        .catch(() => {});
    }
  }, [convId, conversations]);

  // ── Load messages for active conversation ──────────────────────────────────
  useEffect(() => {
    if (!convId || !db) { setMessages([]); return; }
    setMsgLoading(true); setMsgError('');

    // Sort in JS — avoids composite index on messages subcollection
    const unsub = onSnapshot(
      collection(db, 'conversations', convId, 'messages'),
      (snap) => {
        const rows = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => toMs(a.createdAt) - toMs(b.createdAt)); // oldest first
        setMessages(rows);
        setMsgLoading(false);
      },
      (err) => {
        setMsgError(`Failed to load messages: ${err.message}`);
        setMsgLoading(false);
      },
    );
    return () => unsub();
  }, [convId]);

  // ── Scroll to bottom when messages change ──────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Send message ───────────────────────────────────────────────────────────
  const handleSend = async (e) => {
    e?.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || !convId) return;

    const fbUser = auth.currentUser;
    if (!fbUser) { setSendError('Please log in to send messages.'); return; }

    setSending(true); setSendError('');
    try {
      await addDoc(collection(db, 'conversations', convId, 'messages'), {
        senderId:   fbUser.uid,
        senderName: fbUser.displayName || customer?.name || fbUser.email || 'You',
        text:       trimmed,
        createdAt:  serverTimestamp(),
      });
      await updateDoc(doc(db, 'conversations', convId), {
        lastMessage:   trimmed.length > 60 ? trimmed.slice(0, 60) + '…' : trimmed,
        lastMessageAt: serverTimestamp(),
      });
      setText('');
      inputRef.current?.focus();
    } catch (err) {
      setSendError(`Send failed: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  // ── Owner status shortcuts ─────────────────────────────────────────────────
  const setItemStatus = async (newStatus) => {
    if (!activeConv?.sharedItemId) return;
    setStatusError('');
    try {
      await updateDoc(doc(db, 'sharedItems', activeConv.sharedItemId), { status: newStatus });
    } catch (err) {
      setStatusError(`Status update failed: ${err.message}`);
    }
  };

  const fbUser    = auth.currentUser;
  const myUid     = fbUser?.uid ?? '';
  const isOwner   = activeConv ? activeConv.ownerId === myUid : false;

  // ── Layout ─────────────────────────────────────────────────────────────────
  return (
    <div className="page-content">
      <div className="container">
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--gray-800)', marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
          Messages
        </h1>

        {convError && <ErrBanner msg={convError} />}

        <div style={{ display: 'grid', gridTemplateColumns: convId ? '280px 1fr' : '1fr', gap: '1.25rem', alignItems: 'start' }} className="ll-msg-grid">

          {/* ── Conversation list ── */}
          <div style={{ background: '#fff', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid var(--gray-200)', fontWeight: 700, fontSize: '0.875rem', color: 'var(--gray-700)' }}>
              Conversations
            </div>
            {convLoading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-400)', fontSize: '0.875rem' }}>Loading…</div>
            ) : conversations.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-400)', fontSize: '0.875rem' }}>
                No conversations yet.<br />
                <Link to="/shared-donated" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.8125rem' }}>Browse Shared &amp; Donated →</Link>
              </div>
            ) : (
              <div>
                {conversations.map((conv) => {
                  const isActive   = conv.id === convId;
                  const otherName  = conv.ownerId === myUid ? conv.requesterName : conv.ownerName;
                  return (
                    <button
                      key={conv.id}
                      onClick={() => navigate(`/messages/${conv.id}`)}
                      style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.875rem 1rem', background: isActive ? 'var(--primary-light)' : 'transparent', border: 'none', borderBottom: '1px solid var(--gray-100)', cursor: 'pointer', borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent', fontFamily: 'inherit' }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: isActive ? 'var(--primary)' : 'var(--gray-800)', marginBottom: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {conv.itemTitle ?? 'Item'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: '0.2rem' }}>{otherName}</div>
                      {conv.lastMessage && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {conv.lastMessage}
                        </div>
                      )}
                      {conv.lastMessageAt && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--gray-300)', marginTop: '0.2rem' }}>{fmtDate(conv.lastMessageAt)}</div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Thread ── */}
          {convId && (
            <div style={{ background: '#fff', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', minHeight: 480 }}>
              {/* Thread header */}
              <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid var(--gray-200)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--gray-800)' }}>
                    {activeConv?.itemTitle ?? '…'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>
                    {activeConv ? (activeConv.ownerId === myUid ? `Requested by ${activeConv.requesterName}` : `Owner: ${activeConv.ownerName}`) : ''}
                  </div>
                </div>

                {/* Owner status shortcuts */}
                {isOwner && activeConv && (
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>Quick:</span>
                    <Button size="sm" variant="secondary" onClick={() => setItemStatus('reserved')}>Reserve</Button>
                    <Button size="sm" variant="success"   onClick={() => setItemStatus('lent')}>Handed over</Button>
                  </div>
                )}
              </div>

              {statusError && <ErrBanner msg={statusError} />}

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {msgLoading ? (
                  <div style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '2rem', fontSize: '0.875rem' }}>Loading messages…</div>
                ) : msgError ? (
                  <ErrBanner msg={msgError} />
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '2rem', fontSize: '0.875rem' }}>No messages yet. Say hello!</div>
                ) : messages.map((msg) => {
                  const isMine = msg.senderId === myUid;
                  return (
                    <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                      <div style={{ maxWidth: '72%' }}>
                        {!isMine && <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)', marginBottom: '0.2rem', paddingLeft: '0.5rem' }}>{msg.senderName}</div>}
                        <div style={{ padding: '0.5rem 0.875rem', borderRadius: isMine ? '1rem 1rem 0.25rem 1rem' : '1rem 1rem 1rem 0.25rem', background: isMine ? 'var(--primary)' : 'var(--gray-100)', color: isMine ? '#fff' : 'var(--gray-800)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                          {msg.text}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--gray-300)', marginTop: '0.2rem', textAlign: isMine ? 'right' : 'left', paddingLeft: isMine ? 0 : '0.5rem', paddingRight: isMine ? '0.25rem' : 0 }}>
                          {fmtTime(msg.createdAt)}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div style={{ borderTop: '1px solid var(--gray-200)', padding: '0.875rem 1rem' }}>
                {sendError && <ErrBanner msg={sendError} style={{ marginBottom: '0.5rem' }} />}
                <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    ref={inputRef}
                    type="text"
                    className="form-control"
                    placeholder="Type a message…"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    disabled={sending}
                    style={{ flex: 1 }}
                  />
                  <Button type="submit" disabled={sending || !text.trim()}>
                    {sending ? '…' : 'Send'}
                  </Button>
                </form>
                <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: '0.5rem', lineHeight: 1.5 }}>
                  Never share passwords, codes, or financial details. Meet in public places on campus.
                </p>
              </div>
            </div>
          )}

          {/* No thread selected placeholder */}
          {!convId && conversations.length > 0 && (
            <div style={{ background: '#fff', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }} className="ll-msg-thread-placeholder">
              <p style={{ color: 'var(--gray-400)', fontSize: '0.9375rem' }}>Select a conversation to start chatting.</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 700px) {
          .ll-msg-grid { grid-template-columns: 1fr !important; }
          .ll-msg-thread-placeholder { display: none !important; }
        }
      `}</style>
    </div>
  );
}

function ErrBanner({ msg, style: extraStyle }) {
  return (
    <div style={{ background: 'var(--danger-light)', border: '1px solid var(--danger)', borderRadius: 'var(--radius)', padding: '0.625rem 0.875rem', fontSize: '0.875rem', color: 'var(--danger)', margin: '0.75rem 1rem', ...extraStyle }}>
      ⚠️ {msg}
    </div>
  );
}
