'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Shield, Swords, Footprints, Hand } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Player } from '../types/player.types';
import Link from 'next/link';

interface PlayerListTableProps {
  players: Player[];
}

const positionIcons = {
  GK: <Hand className="h-4 w-4 text-yellow-500" />,
  DEF: <Shield className="h-4 w-4 text-blue-500" />,
  MID: <Footprints className="h-4 w-4 text-green-500" />,
  FWD: <Swords className="h-4 w-4 text-red-500" />,
};

const positionColors = {
  GK: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  DEF: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  MID: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  FWD: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

export function PlayerListTable({ players }: PlayerListTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">#</TableHead>
            <TableHead>Cầu thủ</TableHead>
            <TableHead>Vị trí</TableHead>
            <TableHead className="text-right">Trận</TableHead>
            <TableHead className="text-right">Bàn</TableHead>
            <TableHead className="text-right">Kiến tạo</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.map((player) => (
            <TableRow key={player.id}>
              <TableCell className="font-mono">{player.code}</TableCell>
              <TableCell>
                <Link
                  href={`/teams/${player.team_id}/players/${player.id}`}
                  className="hover:underline"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={player.avatar_url || ''} />
                      <AvatarFallback>
                        {player.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{player.name}</div>
                    </div>
                  </div>
                </Link>
              </TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={`flex w-fit items-center gap-1 ${positionColors[player.position]}`}
                >
                  {positionIcons[player.position]}
                  {player.position}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {player.matches_played}
              </TableCell>
              <TableCell className="text-right">{player.goals}</TableCell>
              <TableCell className="text-right">{player.assists}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>
                      <Link
                        href={`/teams/${player.team_id}/players/${player.id}`}
                      >
                        Xem chi tiết
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>Chỉnh sửa</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      Xóa cầu thủ
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
