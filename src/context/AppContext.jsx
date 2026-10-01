import { createContext, useContext, useReducer, useCallback, useState } from 'react';
import { MOCK_ITEMS } from '../data/items';
import { MOCK_BORROW_REQUESTS } from '../data/borrowRequests';
import { MOCK_LOST_FOUND } from '../data/lostFound';
import { MOCK_USERS } from '../data/users';
import { MOCK_SHARED_DONATED } from '../data/sharedDonated';

// ── Initial state ─────────────────────────────────────────────────────────────
const initialState = {
  items: MOCK_ITEMS,
  borrowRequests: MOCK_BORROW_REQUESTS,
  lostFound: MOCK_LOST_FOUND,
  users: MOCK_USERS,
  sharedDonated: MOCK_SHARED_DONATED,
};

// ── Reducer ───────────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    // ── Items ──
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.payload] };
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map((i) => i.id === action.payload.id ? { ...i, ...action.payload } : i),
      };
    case 'DELETE_ITEM':
      return { ...state, items: state.items.filter((i) => i.id !== action.payload) };

    // ── Borrow Requests ──
    case 'ADD_BORROW_REQUEST':
      return { ...state, borrowRequests: [...state.borrowRequests, action.payload] };
    case 'UPDATE_BORROW_REQUEST':
      return {
        ...state,
        borrowRequests: state.borrowRequests.map((r) =>
          r.id === action.payload.id ? { ...r, ...action.payload } : r,
        ),
      };
    case 'DELETE_BORROW_REQUEST':
      return { ...state, borrowRequests: state.borrowRequests.filter((r) => r.id !== action.payload) };

    // ── Lost & Found ──
    case 'ADD_LOST_FOUND':
      return { ...state, lostFound: [...state.lostFound, action.payload] };
    case 'UPDATE_LOST_FOUND':
      return {
        ...state,
        lostFound: state.lostFound.map((r) =>
          r.id === action.payload.id ? { ...r, ...action.payload } : r,
        ),
      };
    case 'DELETE_LOST_FOUND':
      return { ...state, lostFound: state.lostFound.filter((r) => r.id !== action.payload) };

    // ── Users ──
    case 'ADD_USER':
      return { ...state, users: [...state.users, action.payload] };
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map((u) => u.id === action.payload.id ? { ...u, ...action.payload } : u),
      };
    case 'DELETE_USER':
      return { ...state, users: state.users.filter((u) => u.id !== action.payload) };

    // ── Shared / Donated ──
    case 'ADD_SHARED_DONATED':
      return { ...state, sharedDonated: [...state.sharedDonated, action.payload] };
    case 'UPDATE_SHARED_DONATED':
      return {
        ...state,
        sharedDonated: state.sharedDonated.map((r) =>
          r.id === action.payload.id ? { ...r, ...action.payload } : r,
        ),
      };
    case 'DELETE_SHARED_DONATED':
      return { ...state, sharedDonated: state.sharedDonated.filter((r) => r.id !== action.payload) };

    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────────────────────────
const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // ── Toast helper ─────────────────────────────────────────────────────────
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((message, type = 'default') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── ID generators ────────────────────────────────────────────────────────
  const genId = (prefix) => `${prefix}${Date.now()}`;

  // ── Item actions ─────────────────────────────────────────────────────────
  const addItem = (item) => {
    dispatch({ type: 'ADD_ITEM', payload: { ...item, id: genId('item'), createdAt: new Date().toISOString().slice(0, 10) } });
    addToast('Item added successfully.', 'success');
  };
  const updateItem = (item) => {
    dispatch({ type: 'UPDATE_ITEM', payload: item });
    addToast('Item updated.', 'success');
  };
  const deleteItem = (id) => {
    dispatch({ type: 'DELETE_ITEM', payload: id });
    addToast('Item deleted.', 'success');
  };

  // ── Borrow request actions ────────────────────────────────────────────────
  const addBorrowRequest = (req) => {
    const newReq = { ...req, id: genId('br'), requestDate: new Date().toISOString().slice(0, 10), status: 'pending', adminNote: '' };
    dispatch({ type: 'ADD_BORROW_REQUEST', payload: newReq });
    addToast('Borrow request submitted!', 'success');
    return newReq;
  };
  const updateBorrowRequest = (req) => {
    dispatch({ type: 'UPDATE_BORROW_REQUEST', payload: req });
    addToast('Request updated.', 'success');
  };
  const deleteBorrowRequest = (id) => {
    dispatch({ type: 'DELETE_BORROW_REQUEST', payload: id });
    addToast('Request removed.', 'success');
  };

  // ── Lost & Found actions ──────────────────────────────────────────────────
  const addLostFound = (report) => {
    dispatch({ type: 'ADD_LOST_FOUND', payload: { ...report, id: genId('lf'), date: new Date().toISOString().slice(0, 10), status: 'open', adminNote: '' } });
    addToast('Report submitted!', 'success');
  };
  const updateLostFound = (report) => {
    dispatch({ type: 'UPDATE_LOST_FOUND', payload: report });
    addToast('Report updated.', 'success');
  };
  const deleteLostFound = (id) => {
    dispatch({ type: 'DELETE_LOST_FOUND', payload: id });
    addToast('Report deleted.', 'success');
  };

  // ── User actions ──────────────────────────────────────────────────────────
  const addUser = (user) => {
    dispatch({ type: 'ADD_USER', payload: { ...user, id: genId('u'), joinedAt: new Date().toISOString().slice(0, 10), borrowCount: 0 } });
    addToast('User added.', 'success');
  };
  const updateUser = (user) => {
    dispatch({ type: 'UPDATE_USER', payload: user });
    addToast('User updated.', 'success');
  };
  const deleteUser = (id) => {
    dispatch({ type: 'DELETE_USER', payload: id });
    addToast('User removed.', 'success');
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getItemById = (id) => state.items.find((i) => i.id === id);
  const getUserById = (id) => state.users.find((u) => u.id === id);

  // ── Shared / Donated actions ──────────────────────────────────────────────
  const addSharedDonated = (listing) => {
    dispatch({
      type: 'ADD_SHARED_DONATED',
      payload: {
        ...listing,
        id: genId('sd'),
        datePosted: new Date().toISOString().slice(0, 10),
        status: 'pending',
        adminNote: '',
      },
    });
    addToast('Listing submitted! It will be reviewed by an admin.', 'success');
  };
  const updateSharedDonated = (listing) => {
    dispatch({ type: 'UPDATE_SHARED_DONATED', payload: listing });
    addToast('Listing updated.', 'success');
  };
  const deleteSharedDonated = (id) => {
    dispatch({ type: 'DELETE_SHARED_DONATED', payload: id });
    addToast('Listing removed.', 'success');
  };

  const value = {
    ...state,
    toasts,
    addToast,
    removeToast,
    // Items
    addItem, updateItem, deleteItem, getItemById,
    // Borrow
    addBorrowRequest, updateBorrowRequest, deleteBorrowRequest,
    // Lost & Found
    addLostFound, updateLostFound, deleteLostFound,
    // Users
    addUser, updateUser, deleteUser, getUserById,
    // Shared / Donated
    addSharedDonated, updateSharedDonated, deleteSharedDonated,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
