'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Search,
  Users,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Shield,
} from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

type TeamSearchResult = {
  id: string;
  name: string;
  code: string;
  logo_url: string | null;
  owner_name?: string;
};

type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export function FindTeamForm({
  onTeamSelected,
}: {
  onTeamSelected: (team: {
    type: string;
    id?: string;
    name?: string;
    code?: string;
    logo_url?: string | null;
    owner_name?: string;
  }) => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<TeamSearchResult[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchTeams = useCallback(async (query: string, page: number) => {
    setIsSearching(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (query.trim().length >= 2) {
        params.set('q', query.trim());
      }
      const res = await fetch(`/api/teams/search?${params.toString()}`);
      if (!res.ok) throw new Error('Lỗi tìm kiếm');
      const json = await res.json();
      setSearchResults(json.data || []);
      setPagination(json.pagination || null);
    } catch (error) {
      console.error(error);
      toast.error('Không thể tải danh sách đội.');
      setSearchResults([]);
      setPagination(null);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Load default teams on mount
  useEffect(() => {
    fetchTeams('', 1);
  }, [fetchTeams]);

  // Debounced search when query changes
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setCurrentPage(1);
      fetchTeams(searchQuery, 1);
    }, 400);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchQuery, fetchTeams]);

  // Fetch when page changes
  useEffect(() => {
    fetchTeams(searchQuery, currentPage);
  }, [currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleJoinTeam = (team: TeamSearchResult) => {
    toast.success(`Đã gửi yêu cầu tham gia đội ${team.name}`);
    onTeamSelected({ ...team, type: 'join_existing' });
  };

  const handleCreateNewTeam = () => onTeamSelected({ type: 'create_new' });
  const handleFreeAgent = () => onTeamSelected({ type: 'free_agent' });

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Tìm Đội Của Bạn</CardTitle>
          <CardDescription>
            Tìm kiếm theo tên đội bóng hoặc mã đội (ví dụ: PAS01)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            {isSearching ? (
              <Loader2 className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4 animate-spin" />
            ) : (
              <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
            )}
            <Input
              type="search"
              placeholder="Nhập tên hoặc mã đội..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Results List */}
          <div className="min-h-[200px] space-y-2">
            {!isSearching && searchResults.length === 0 && (
              <div className="text-muted-foreground flex flex-col items-center justify-center py-10 text-center text-sm">
                <Shield className="mb-2 h-8 w-8 opacity-30" />
                <p>
                  {searchQuery.length >= 2
                    ? `Không tìm thấy đội nào với "${searchQuery}"`
                    : 'Chưa có đội bóng nào trong hệ thống'}
                </p>
              </div>
            )}

            {searchResults.map((team) => (
              <div
                key={team.id}
                className="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-3 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                    {team.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm leading-tight font-semibold">
                      {team.name}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Mã:{' '}
                      <span className="font-mono font-medium">{team.code}</span>
                      {team.owner_name && ` · ${team.owner_name}`}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleJoinTeam(team)}
                >
                  Xin gia nhập
                </Button>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-3">
              <span className="text-muted-foreground text-xs">
                {pagination.total} đội · Trang {pagination.page}/
                {pagination.totalPages}
              </span>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={!pagination.hasPrev || isSearching}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={!pagination.hasNext || isSearching}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background text-muted-foreground px-2">
            Chưa tìm được đội?
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          className="group flex h-auto flex-col gap-1.5 py-5"
          onClick={handleCreateNewTeam}
        >
          <PlusCircle className="text-primary h-5 w-5 transition-transform group-hover:scale-110" />
          <span className="text-sm font-semibold">Tạo Đội Mới</span>
          <span className="text-muted-foreground text-[11px] font-normal">
            Trở thành quản lý đội
          </span>
        </Button>

        <Button
          variant="outline"
          className="group flex h-auto flex-col gap-1.5 py-5"
          onClick={handleFreeAgent}
        >
          <Users className="h-5 w-5 text-blue-500 transition-transform group-hover:scale-110" />
          <span className="text-sm font-semibold">Cầu Thủ Tự Do</span>
          <span className="text-muted-foreground text-[11px] font-normal">
            Tìm thông báo tuyển quân
          </span>
        </Button>
      </div>
    </div>
  );
}
