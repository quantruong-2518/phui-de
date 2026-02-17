// Teams Mock Data
export const MOCK_TEAMS = [
  {
    id: '1',
    name: 'FC Toji',
    slug: 'fc-toji',
    logo_url: null,
    primary_color: '#BFFF00', // Neon Lime
    secondary_color: '#1A1A1A',
    owner_id: 'user_1',
    member_count: 15,
    next_match: 'vs FC React (19:00 Today)',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Binh Thanh United',
    slug: 'binh-thanh-utd',
    logo_url: null,
    primary_color: '#FF0000',
    secondary_color: '#FFFFFF',
    owner_id: 'user_2',
    member_count: 22,
    next_match: 'vs Saigon Warriors (Tomorrow)',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Code Lovers FC',
    slug: 'code-lovers-fc',
    logo_url: null,
    primary_color: '#0000FF',
    secondary_color: '#FFFFFF',
    owner_id: 'user_1',
    member_count: 12,
    next_match: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Matches Mock Data
export const MOCK_MATCHES = [
  {
    id: '1',
    team_name: 'FC Toji',
    opponent_name: 'FC React',
    time: '19:00',
    date: '2024-05-20',
    location: 'Sân Chảo Lửa, Tân Bình',
    status: 'scheduled', // scheduled, live, finished
    type: 'Friendly', // Friendly, League, Cup
    format: '7 vs 7',
  },
  {
    id: '2',
    team_name: 'Binh Thanh United',
    opponent_name: 'Saigon Warriors',
    time: '20:30',
    date: '2024-05-21',
    location: 'Sân D3, Bình Thạnh',
    status: 'scheduled',
    type: 'League',
    format: '5 vs 5',
  },
  {
    id: '3',
    team_name: 'Code Lovers FC',
    opponent_name: 'Bug Hunters',
    time: '17:00',
    date: '2024-05-22',
    location: 'Sân Viettel, Q10',
    status: 'finding', // finding opponent
    type: 'Friendly',
    format: '7 vs 7',
  },
];

// Bookings Mock Data
export const MOCK_BOOKINGS = [
  {
    id: '1',
    field_name: 'Sân Bóng Chảo Lửa',
    address: '30 Phan Thúc Duyện, Tân Bình',
    date: '2024-05-20',
    time_slot: '19:00 - 20:30',
    price: 450000,
    status: 'confirmed',
    image: null,
  },
  {
    id: '2',
    field_name: 'Sân D3 Bình Thạnh',
    address: 'D3, Phường 25, Bình Thạnh',
    date: '2024-05-22',
    time_slot: '20:30 - 22:00',
    price: 350000,
    status: 'pending',
    image: null,
  },
  {
    id: '3',
    field_name: 'Sân Viettel',
    address: '158 Hoàng Hoa Thám, Tân Bình',
    date: '2024-05-25',
    time_slot: '17:30 - 19:00',
    price: 500000,
    status: 'history', // past booking
    image: null,
  },
];

// Shop Mock Data
export const MOCK_PRODUCTS = [
  {
    id: '1',
    name: 'Giày Nike Mercurial Vapor 15',
    category: 'Giày Bóng Đá',
    price: 2500000,
    image_url: null,
    is_new: true,
  },
  {
    id: '2',
    name: 'Áo Đấu Phủi Đê Official',
    category: 'Trang Phục',
    price: 350000,
    image_url: null,
    is_new: true,
  },
  {
    id: '3',
    name: 'Găng Tay Thủ Môn Adidas Predator',
    category: 'Phụ Kiện',
    price: 1200000,
    image_url: null,
    is_new: false,
  },
  {
    id: '4',
    name: 'Tất Chống Trơn Fox',
    category: 'Phụ Kiện',
    price: 50000,
    image_url: null,
    is_new: false,
  },
];

// Players Mock Data
export const MOCK_PLAYERS = [
  {
    id: '1',
    name: 'Nguyen Van A',
    position: 'ST', // Striker
    rating: 8.5,
    matches_played: 24,
    goals: 18,
    assists: 5,
    avatar_url: null,
  },
  {
    id: '2',
    name: 'Tran Van B',
    position: 'CM', // Midfielder
    rating: 7.8,
    matches_played: 30,
    goals: 5,
    assists: 15,
    avatar_url: null,
  },
  {
    id: '3',
    name: 'Le Van C',
    position: 'CB', // Defender
    rating: 8.2,
    matches_played: 28,
    goals: 2,
    assists: 1,
    avatar_url: null,
  },
  {
    id: '4',
    name: 'Pham Van D',
    position: 'GK', // Goalkeeper
    rating: 9.0,
    matches_played: 20,
    clean_sheets: 8,
    avatar_url: null,
  },
];
