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

// ============================================================
// PassionFC — Mock data (from Passion 2024 Google Sheets)
// ============================================================

import type {
  MatchRecord,
  PlayerSeason,
  MatchResult,
  TeamBadge,
  BookedMatch,
} from '@/types/match-scoring.types';

export const MOCK_PASSION_FC = {
  id: 'passion-fc-001',
  name: 'PassionFC',
  code: 'PSN001',
  slug: 'passionfc',
  slogan: 'Đam mê không giới hạn ⚡',
  primary_color: '#22c55e',
  secondary_color: '#1A1A1A',
  founded: '2024-01-01',
  home_field: 'Sân Cần Khê',
  owner_id: 'user_passion_1',
  member_count: 17,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: new Date().toISOString(),
  badges: [
    { id: 'b1', label: '3 Năm Tuổi', icon: 'shield', color: 'text-amber-500 bg-amber-500/10' },
    { id: 'b2', label: 'Win Rate Cao', icon: 'trend', color: 'text-emerald-500 bg-emerald-500/10' },
    { id: 'b3', label: 'Sôi Nổi', icon: 'zap', color: 'text-blue-500 bg-blue-500/10' },
  ] as TeamBadge[],
};

export const MOCK_UPCOMING_MATCHES: BookedMatch[] = [
  {
    id: 'u1',
    opponent: 'FC Anh Em',
    field: 'Sân Cần Khê',
    date: new Date().toISOString().split('T')[0], // Today
    time: '19:30',
    odds: 'Kèo 5-5',
    status: 'booked',
  },
  {
    id: 'u2',
    opponent: 'Tân Binh FC',
    field: 'Sân Z',
    date: '2026-05-20',
    time: '17:30',
    odds: 'Chấp 1 hòa',
    status: 'booked',
  },
];

// Player roster — from "player" tab (sorted by Điểm desc)
export const MOCK_PASSION_FC_PLAYERS: PlayerSeason[] = [
  { id: 'pl1', name: 'Tùng', code: 8, goals: 42, gkPoints: 0, matchesPlayed: 29, assists: 27, points: 98, supportPoints: 0 },
  { id: 'pl2', name: 'Thịnh', code: 13, goals: 1, gkPoints: 64, matchesPlayed: 18, assists: 1, points: 83, supportPoints: 0 },
  { id: 'pl3', name: 'Hoàng', code: 2, goals: 20, gkPoints: 5, matchesPlayed: 27, assists: 25, points: 77, supportPoints: 0 },
  { id: 'pl4', name: 'Quân', code: 1, goals: 24, gkPoints: 1, matchesPlayed: 27, assists: 16, points: 68, supportPoints: 0 },
  { id: 'pl5', name: 'Út', code: 5, goals: 19, gkPoints: 0, matchesPlayed: 25, assists: 20, points: 64, supportPoints: 0 },
  { id: 'pl6', name: 'Chương', code: 11, goals: 13, gkPoints: 0, matchesPlayed: 28, assists: 23, points: 64, supportPoints: 0 },
  { id: 'pl7', name: 'Vũ', code: 9, goals: 16, gkPoints: 0, matchesPlayed: 27, assists: 13, points: 56, supportPoints: 0 },
  { id: 'pl8', name: 'Cường', code: 6, goals: 16, gkPoints: 0, matchesPlayed: 20, assists: 14, points: 50, supportPoints: 0 },
  { id: 'pl9', name: 'Hiếu', code: 15, goals: 23, gkPoints: 0, matchesPlayed: 14, assists: 13, points: 50, supportPoints: 0 },
  { id: 'pl10', name: 'Thái', code: 4, goals: 4, gkPoints: 10, matchesPlayed: 20, assists: 4, points: 38, supportPoints: 0 },
  { id: 'pl11', name: 'Thắng', code: 3, goals: 8, gkPoints: 8, matchesPlayed: 15, assists: 3, points: 34, supportPoints: 0 },
  { id: 'pl12', name: 'Thắng lớn', code: 16, goals: 4, gkPoints: 0, matchesPlayed: 15, assists: 4, points: 23, supportPoints: 0 },
  { id: 'pl13', name: 'Vinh', code: 10, goals: 6, gkPoints: 0, matchesPlayed: 12, assists: 2, points: 20, supportPoints: 0 },
  { id: 'pl14', name: 'Hoàng Anh', code: 12, goals: 5, gkPoints: 0, matchesPlayed: 8, assists: 4, points: 17, supportPoints: 0 },
  { id: 'pl15', name: 'Tuấn Anh', code: 14, goals: 5, gkPoints: 0, matchesPlayed: 2, assists: 1, points: 8, supportPoints: 0 },
  { id: 'pl16', name: 'Hùng', code: 7, goals: 3, gkPoints: 0, matchesPlayed: 3, assists: 0, points: 6, supportPoints: 0 },
  { id: 'pl17', name: 'Vương', code: 17, goals: 0, gkPoints: 0, matchesPlayed: 1, assists: 0, points: 1, supportPoints: 0 },
];

// Match history — from "match" tab
export const MOCK_PASSION_FC_MATCHES: MatchRecord[] = [
  { id: 'mr1', opponent: 'Liên Hà', field: 'Châu Phong', date: '2025-01-04', goalsScored: 8, goalsConceded: 3, result: 'W', events: [] },
  { id: 'mr2', opponent: 'Thành Blue', field: 'Z', date: '2025-01-06', goalsScored: 8, goalsConceded: 9, result: 'L', events: [] },
  { id: 'mr3', opponent: 'L0v4', field: 'Cần Khê', date: '2025-01-08', goalsScored: 9, goalsConceded: 9, result: 'D', events: [] },
  { id: 'mr4', opponent: '3233', field: 'Cần Khê', date: '2025-01-11', goalsScored: 5, goalsConceded: 7, result: 'L', events: [] },
  { id: 'mr5', opponent: 'Đội bạn Tùng', field: 'Cần Khê', date: '2025-01-14', goalsScored: 8, goalsConceded: 1, result: 'W', events: [] },
  { id: 'mr6', opponent: 'Trẻ Xuân Nón', field: 'Cần Khê', date: '2025-01-16', goalsScored: 4, goalsConceded: 1, result: 'W', events: [] },
  { id: 'mr7', opponent: 'C3 ADV', field: 'Cần Khê', date: '2025-01-22', goalsScored: 9, goalsConceded: 4, result: 'W', events: [] },
  { id: 'mr8', opponent: 'Lego', field: 'Cần Khê', date: '2025-02-06', goalsScored: 14, goalsConceded: 2, result: 'W', events: [] },
  { id: 'mr9', opponent: 'Đội anh Hoàng', field: 'Cần Khê', date: '2025-02-12', goalsScored: 6, goalsConceded: 2, result: 'W', events: [] },
  { id: 'mr10', opponent: 'L0v4', field: 'Cần Khê', date: '2025-02-15', goalsScored: 12, goalsConceded: 2, result: 'W', events: [] },
  { id: 'mr11', opponent: 'Trẻ Nguyên Khê', field: 'Cần Khê', date: '2025-02-19', goalsScored: 7, goalsConceded: 4, result: 'W', events: [] },
  { id: 'mr12', opponent: 'Già Lương Quy', field: 'Cần Khê', date: '2025-02-22', goalsScored: 8, goalsConceded: 4, result: 'W', events: [] },
  { id: 'mr13', opponent: 'Máy xúc', field: 'Cần Khê', date: '2025-02-26', goalsScored: 8, goalsConceded: 7, result: 'W', events: [] },
  { id: 'mr14', opponent: 'BDS Minh Mok', field: 'Cần Khê', date: '2025-03-01', goalsScored: 4, goalsConceded: 4, result: 'D', events: [] },
  { id: 'mr15', opponent: 'Khê Nữ', field: 'Cần Khê', date: '2025-03-06', goalsScored: 6, goalsConceded: 1, result: 'W', events: [] },
  { id: 'mr16', opponent: 'LOVE', field: 'Cần Khê', date: '2025-03-13', goalsScored: 13, goalsConceded: 4, result: 'W', events: [] },
  { id: 'mr17', opponent: 'Khê Nữ', field: 'Cần Khê', date: '2025-03-15', goalsScored: 8, goalsConceded: 5, result: 'W', events: [] },
  { id: 'mr18', opponent: 'LOVE', field: 'Cần Khê', date: '2025-03-19', goalsScored: 10, goalsConceded: 6, result: 'W', events: [] },
  { id: 'mr19', opponent: 'Lý Qua Phà', field: 'Cần Khê', date: '2025-03-26', goalsScored: 3, goalsConceded: 6, result: 'L', events: [] },
  { id: 'mr20', opponent: '3233', field: 'Cần Khê', date: '2025-03-29', goalsScored: 2, goalsConceded: 2, result: 'D', events: [] },
  { id: 'mr21', opponent: 'Già Lương Quy', field: 'Cần Khê', date: '2025-04-02', goalsScored: 9, goalsConceded: 1, result: 'W', events: [] },
  { id: 'mr22', opponent: 'Chợ Kim', field: 'Z', date: '2025-04-04', goalsScored: 4, goalsConceded: 5, result: 'L', events: [] },
  { id: 'mr23', opponent: 'Máy xúc', field: 'Khê Nữ', date: '2025-04-05', goalsScored: 7, goalsConceded: 4, result: 'W', events: [] },
];

// Computed stats from match data
const _wins = MOCK_PASSION_FC_MATCHES.filter((m) => m.result === 'W').length;
const _draws = MOCK_PASSION_FC_MATCHES.filter((m) => m.result === 'D').length;
const _losses = MOCK_PASSION_FC_MATCHES.filter((m) => m.result === 'L').length;
const _totalGoals = MOCK_PASSION_FC_MATCHES.reduce((s, m) => s + m.goalsScored, 0);
const _totalConceded = MOCK_PASSION_FC_MATCHES.reduce((s, m) => s + m.goalsConceded, 0);
const _total = MOCK_PASSION_FC_MATCHES.length;

export const MOCK_PASSION_FC_STATS = {
  totalMatches: _total,
  wins: _wins,
  draws: _draws,
  losses: _losses,
  goalsScored: _totalGoals,
  goalsConceded: _totalConceded,
  winRate: Math.round((_wins / _total) * 10000) / 100,
  goalsPerMatch: Math.round((_totalGoals / _total) * 100) / 100,
  recentForm: MOCK_PASSION_FC_MATCHES.slice(-5).map((m) => m.result) as MatchResult[],
};
