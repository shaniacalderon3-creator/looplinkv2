import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import {
  CustomerRoute,
  AdminRoute,
  GuestOnlyRoute,
  AdminGuestRoute,
} from './components/shared/ProtectedRoute';

// Layouts
import CustomerLayout from './layouts/CustomerLayout';
import AdminLayout    from './layouts/AdminLayout';

// Auth pages
import Login          from './pages/auth/Login';
import Register       from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import EditorLogin    from './pages/auth/EditorLogin';

// Customer pages
import Home           from './pages/customer/Home';
import BrowseItems    from './pages/customer/BrowseItems';
import ItemDetails    from './pages/customer/ItemDetails';
import MyBorrowing    from './pages/customer/MyBorrowing';
import LostFound      from './pages/customer/LostFound';
import MyProfile      from './pages/customer/MyProfile';
import SharedDonated  from './pages/customer/SharedDonated';

// Admin pages
import Dashboard             from './pages/admin/Dashboard';
import ManageItems           from './pages/admin/ManageItems';
import ManageBorrowRequests  from './pages/admin/ManageBorrowRequests';
import ManageLostFound       from './pages/admin/ManageLostFound';
import ManageUsers           from './pages/admin/ManageUsers';
import ManageSharedDonated   from './pages/admin/ManageSharedDonated';

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            {/* ── Root redirect ── */}
            <Route index element={<Navigate to="/login" replace />} />

            {/* ── Public auth pages (redirect away if already logged in) ── */}
            <Route
              path="/login"
              element={
                <GuestOnlyRoute>
                  <Login />
                </GuestOnlyRoute>
              }
            />
            <Route
              path="/register"
              element={
                <GuestOnlyRoute>
                  <Register />
                </GuestOnlyRoute>
              }
            />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* ── Admin auth ── */}
            <Route
              path="/editor/login"
              element={
                <AdminGuestRoute>
                  <EditorLogin />
                </AdminGuestRoute>
              }
            />

            {/* ── Protected Customer routes ── */}
            <Route
              element={
                <CustomerRoute>
                  <CustomerLayout />
                </CustomerRoute>
              }
            >
              <Route path="/home"            element={<Home />}           />
              <Route path="/browse"          element={<BrowseItems />}    />
              <Route path="/items/:id"       element={<ItemDetails />}    />
              <Route path="/my-borrow"       element={<MyBorrowing />}    />
              <Route path="/lost-found"      element={<LostFound />}      />
              <Route path="/shared-donated"  element={<SharedDonated />}  />
              <Route path="/profile"         element={<MyProfile />}      />
            </Route>

            {/* ── Protected Admin routes ── */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index                   element={<Dashboard />}            />
              <Route path="items"            element={<ManageItems />}          />
              <Route path="borrow-requests"  element={<ManageBorrowRequests />} />
              <Route path="shared-donated"   element={<ManageSharedDonated />}  />
              <Route path="lost-found"       element={<ManageLostFound />}      />
              <Route path="users"            element={<ManageUsers />}          />
            </Route>

            {/* ── Catch-all ── */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}
