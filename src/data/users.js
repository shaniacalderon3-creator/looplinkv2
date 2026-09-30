// ── Mock Users ──────────────────────────────────────────────────────────────
// Replace this array with API calls when connecting to a real backend.

export const MOCK_USERS = [
  {
    id: 'u1',
    name: 'Alex Rivera',
    email: 'alex.rivera@student.edu',
    role: 'student',
    avatar: 'https://api.dicebear.com/7.x/thumbs/svg?seed=alex',
    studentId: 'STU-2024-001',
    department: 'Computer Science',
    joinedAt: '2024-08-15',
    borrowCount: 3,
    status: 'active',
  },
  {
    id: 'u2',
    name: 'Jamie Santos',
    email: 'jamie.santos@student.edu',
    role: 'student',
    avatar: 'https://api.dicebear.com/7.x/thumbs/svg?seed=jamie',
    studentId: 'STU-2024-002',
    department: 'Engineering',
    joinedAt: '2024-08-20',
    borrowCount: 1,
    status: 'active',
  },
  {
    id: 'u3',
    name: 'Morgan Lee',
    email: 'morgan.lee@student.edu',
    role: 'student',
    avatar: 'https://api.dicebear.com/7.x/thumbs/svg?seed=morgan',
    studentId: 'STU-2024-003',
    department: 'Arts & Design',
    joinedAt: '2024-09-01',
    borrowCount: 5,
    status: 'active',
  },
  {
    id: 'u4',
    name: 'Casey Kim',
    email: 'casey.kim@student.edu',
    role: 'student',
    avatar: 'https://api.dicebear.com/7.x/thumbs/svg?seed=casey',
    studentId: 'STU-2024-004',
    department: 'Business',
    joinedAt: '2024-09-10',
    borrowCount: 0,
    status: 'inactive',
  },
  {
    id: 'admin1',
    name: 'Dr. Pat Mendoza',
    email: 'admin@looplink.edu',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/thumbs/svg?seed=admin',
    studentId: 'ADMIN-001',
    department: 'Student Affairs',
    joinedAt: '2023-01-01',
    borrowCount: 0,
    status: 'active',
  },
];

// The currently "logged-in" student for the customer prototype.
// Swap this with real auth when ready.
export const CURRENT_USER_ID = 'u1';
