// ── Mock Lost & Found Reports ────────────────────────────────────────────────
// type: 'lost' | 'found'
// status: 'open' | 'resolved' | 'returned'

export const MOCK_LOST_FOUND = [
  {
    id: 'lf1',
    type: 'lost',
    title: 'Blue Hydroflask Water Bottle',
    description:
      'Lost a 32oz blue Hydroflask with a sticker of a small planet on it. Last seen near the cafeteria on the 2nd floor.',
    category: 'Personal Items',
    location: 'Cafeteria — 2nd Floor',
    date: '2024-09-28',
    reporterId: 'u1',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&q=80',
    contactInfo: 'alex.rivera@student.edu',
    status: 'open',
    adminNote: '',
  },
  {
    id: 'lf2',
    type: 'found',
    title: 'Student ID Card — Name: J. Santos',
    description:
      'Found a student ID card near the Engineering building entrance. The name on it is J. Santos.',
    category: 'ID / Cards',
    location: 'Engineering Building — Entrance',
    date: '2024-09-27',
    reporterId: 'u3',
    image: '',
    contactInfo: 'morgan.lee@student.edu',
    status: 'resolved',
    adminNote: 'Owner contacted and card returned.',
  },
  {
    id: 'lf3',
    type: 'lost',
    title: 'Black Laptop Bag (Samsonite)',
    description:
      'Lost a black Samsonite laptop bag with a MacBook Pro and charger inside. Left it in the library study room.',
    category: 'Bags & Accessories',
    location: 'Library — Study Room 3',
    date: '2024-09-25',
    reporterId: 'u1',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80',
    contactInfo: 'alex.rivera@student.edu',
    status: 'open',
    adminNote: '',
  },
  {
    id: 'lf4',
    type: 'found',
    title: 'Set of Keys (3 keys on a blue keychain)',
    description:
      'Found a set of 3 keys on a blue rubber keychain near the gym locker room. No name tag attached.',
    category: 'Keys',
    location: 'Gymnasium — Locker Room',
    date: '2024-09-29',
    reporterId: 'u2',
    image: '',
    contactInfo: 'jamie.santos@student.edu',
    status: 'open',
    adminNote: '',
  },
  {
    id: 'lf5',
    type: 'lost',
    title: 'Wireless Earbuds (Sony WF-1000XM4)',
    description:
      'Lost Sony noise-cancelling earbuds and their charging case. Last seen in the Design Lab.',
    category: 'Electronics',
    location: 'Design Lab',
    date: '2024-09-30',
    reporterId: 'u3',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&q=80',
    contactInfo: 'morgan.lee@student.edu',
    status: 'open',
    adminNote: '',
  },
  {
    id: 'lf6',
    type: 'found',
    title: 'Umbrella — Red and White Stripes',
    description:
      'Found a red and white striped umbrella left under a seat in the auditorium after the last event.',
    category: 'Personal Items',
    location: 'Main Auditorium',
    date: '2024-09-26',
    reporterId: 'u2',
    image: '',
    contactInfo: 'jamie.santos@student.edu',
    status: 'returned',
    adminNote: 'Owner identified and umbrella returned.',
  },
];

export const LF_CATEGORIES = [
  'Electronics',
  'ID / Cards',
  'Bags & Accessories',
  'Books & Notes',
  'Keys',
  'Clothing',
  'Personal Items',
  'Other',
];
