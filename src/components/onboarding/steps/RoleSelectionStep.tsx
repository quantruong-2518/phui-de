'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CustomRoleModal } from '../CustomRoleModal';
import { TEAM_ROLES, FREE_AGENT_ROLES } from '@/hooks/use-onboarding';
import { ArrowLeft, ArrowRight, Sparkles, Check } from 'lucide-react';

interface RoleSelectionStepProps {
  status: 'team_member' | 'free_agent';
  onNext: (roleId: string, customRole?: string) => void;
  onBack: () => void;
}

// Role-specific greetings - very "phủi" style
const ROLE_GREETINGS: { [key: string]: string } = {
  captain: '🔥 Phủi quá! Đội trưởng đây rồi!',
  coach: '💪 Ông thầy đã xuất hiện!',
  vice_captain: '⚡ Phó đội chất lừ đây!',
  player: '⚽ Cầu thủ phủi sẵn sàng!',
  goalkeeper: '🧤 Thủ môn siêu đẳng!',
  defender: '🛡️ Hậu vệ thép!',
  midfielder: '🎯 Tiền vệ ma thuật!',
  forward: '🚀 Tiền đạo sát thủ!',
  medical: '💚 Linh hồn của đội!',
  custom: '⭐ Vai trò đặc biệt!',
};

export function RoleSelectionStep({
  status,
  onNext,
  onBack,
}: RoleSelectionStepProps) {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customRoleName, setCustomRoleName] = useState('');
  const [showGreeting, setShowGreeting] = useState(false);

  const roles = status === 'team_member' ? TEAM_ROLES : FREE_AGENT_ROLES;

  const handleRoleClick = (roleId: string) => {
    setSelectedRole(roleId);
    setShowGreeting(true);
    setTimeout(() => setShowGreeting(false), 2000);
  };

  const handleContinue = () => {
    if (selectedRole) {
      if (selectedRole === 'custom') {
        onNext(selectedRole, customRoleName);
      } else {
        onNext(selectedRole);
      }
    }
  };

  const handleCustomRoleConfirm = (roleName: string) => {
    setCustomRoleName(roleName);
    setSelectedRole('custom');
    setShowCustomModal(false);
    setShowGreeting(true);
    setTimeout(() => setShowGreeting(false), 2000);
  };

  const greeting = selectedRole
    ? ROLE_GREETINGS[selectedRole] || ROLE_GREETINGS.custom
    : '';

  return (
    <>
      <div className="flex h-full w-full flex-col">
        {/* Content area - scrollable */}
        <div className="flex-1 space-y-4 overflow-y-auto pb-24">
          {/* Greeting Message */}
          {showGreeting && selectedRole && (
            <div className="from-primary/20 to-accent/20 animate-in fade-in slide-in-from-top-2 rounded-2xl bg-gradient-to-r p-4 text-center duration-500">
              <div className="text-lg font-bold">{greeting}</div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {roles.map((role) => {
              const isSelected = selectedRole === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => handleRoleClick(role.id)}
                  className={`relative rounded-2xl p-4 transition-all ${
                    isSelected
                      ? 'bg-primary/10 border-primary/50 border-2'
                      : 'bg-muted/30 hover:border-muted-foreground/20 border-2 border-transparent'
                  } `}
                >
                  {/* Check icon for selected */}
                  {isSelected && (
                    <div className="bg-primary absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full">
                      <Check className="text-primary-foreground h-4 w-4" />
                    </div>
                  )}

                  <div className="space-y-2 text-center">
                    <div className="text-4xl">{role.icon}</div>
                    <div className="text-sm font-semibold">{role.label}</div>
                  </div>
                </button>
              );
            })}

            {/* Custom Role Button */}
            {status === 'team_member' && (
              <button
                onClick={() => setShowCustomModal(true)}
                className={`relative rounded-2xl border-2 border-dashed p-4 transition-all ${
                  selectedRole === 'custom'
                    ? 'bg-primary/10 border-primary/50'
                    : 'border-muted-foreground/30 bg-muted/30 hover:border-muted-foreground/50'
                } `}
              >
                {selectedRole === 'custom' && (
                  <div className="bg-primary absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full">
                    <Check className="text-primary-foreground h-4 w-4" />
                  </div>
                )}

                <div className="space-y-2 text-center">
                  <Sparkles className="text-primary mx-auto h-10 w-10" />
                  <div className="text-sm font-semibold">
                    {customRoleName || 'Vai trò khác'}
                  </div>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Floating Navigation */}
        <div className="bg-background/95 fixed right-0 bottom-0 left-0 px-4 py-6 backdrop-blur-md">
          <div className="mx-auto flex max-w-2xl gap-3">
            <Button
              variant="outline"
              onClick={onBack}
              size="lg"
              className="h-12 flex-1 rounded-xl"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
            <Button
              onClick={handleContinue}
              disabled={!selectedRole}
              size="lg"
              className="h-12 flex-1 rounded-xl"
            >
              Tiếp tục
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Custom Role Modal */}
      <CustomRoleModal
        isOpen={showCustomModal}
        onClose={() => setShowCustomModal(false)}
        onConfirm={handleCustomRoleConfirm}
      />
    </>
  );
}
