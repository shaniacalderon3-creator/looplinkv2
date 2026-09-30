import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Wraps routes that require a logged-in CUSTOMER.
 * Unauthenticated visitors are redirected to /login.
 */
export function CustomerRoute({ children }) {
  const { isCustomerLoggedIn } = useAuth();
  const location = useLocation();

  if (!isCustomerLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

/**
 * Wraps routes that require a logged-in ADMIN.
 * Unauthenticated visitors are redirected to /editor/login.
 */
export function AdminRoute({ children }) {
  const { isAdminLoggedIn } = useAuth();
  const location = useLocation();

  if (!isAdminLoggedIn) {
    return <Navigate to="/editor/login" state={{ from: location }} replace />;
  }
  return children;
}

/**
 * Redirects already-logged-in customers away from /login & /register.
 */
export function GuestOnlyRoute({ children }) {
  const { isCustomerLoggedIn } = useAuth();
  if (isCustomerLoggedIn) return <Navigate to="/home" replace />;
  return children;
}

/**
 * Redirects already-logged-in admins away from /editor/login.
 */
export function AdminGuestRoute({ children }) {
  const { isAdminLoggedIn } = useAuth();
  if (isAdminLoggedIn) return <Navigate to="/admin" replace />;
  return children;
}
