'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CustomRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (roleName: string) => void;
}

export function CustomRoleModal({
  isOpen,
  onClose,
  onConfirm,
}: CustomRoleModalProps) {
  const [roleName, setRoleName] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const validateRoleName = (value: string): boolean => {
    // Check length (2-30 characters)
    if (value.length < 2 || value.length > 30) {
      setError('Tên vai trò phải từ 2-30 ký tự');
      return false;
    }

    // Check for Vietnamese characters, numbers, and spaces only
    // No emoji, no special characters
    const vietnameseRegex = /^[a-zA-ZÀ-ỹ0-9\s]+$/;
    if (!vietnameseRegex.test(value)) {
      setError('Chỉ được dùng chữ cái, số và khoảng trắng');
      return false;
    }

    // Check for emoji (basic check)
    const emojiRegex =
      /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    if (emojiRegex.test(value)) {
      setError('Không được dùng emoji');
      return false;
    }

    setError('');
    return true;
  };

  const handleChange = (value: string) => {
    setRoleName(value);
    if (value) {
      validateRoleName(value);
    } else {
      setError('');
    }
  };

  const handleConfirm = () => {
    if (validateRoleName(roleName)) {
      onConfirm(roleName);
      setRoleName('');
      setError('');
    }
  };

  return (
    <div className="bg-background/80 fixed inset-0 z-[60] flex items-center justify-center backdrop-blur-sm">
      <div className="bg-card mx-4 w-full max-w-sm space-y-4 rounded-xl border p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Nhập vai trò của bạn</h3>
          <button
            onClick={onClose}
            className="hover:bg-muted flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Input */}
        <div className="space-y-2">
          <Input
            placeholder="Ví dụ: Trợ lý HLV, Thủ quỹ..."
            value={roleName}
            onChange={(e) => handleChange(e.target.value)}
            className={error ? 'border-destructive' : ''}
            maxLength={30}
          />
          {error && <p className="text-destructive text-xs">{error}</p>}
          <p className="text-muted-foreground text-xs">
            {roleName.length}/30 ký tự
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onClose} className="flex-1">
            Hủy
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!roleName || !!error}
            className="flex-1"
          >
            Xác nhận
          </Button>
        </div>
      </div>
    </div>
  );
}
