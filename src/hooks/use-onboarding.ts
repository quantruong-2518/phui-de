import { useLocalStorage } from './use-local-storage';

export interface TeamRole {
  id: string;
  label: string;
  icon: string;
  requiresApproval: boolean;
}

export interface UserOnboardingData {
  status: 'team_member' | 'free_agent';

  // If team_member
  team?: {
    id: string;
    name: string;
    code: string;
  };

  role: TeamRole;

  name: string;
  phone: string;

  // Approval status
  approval: {
    status: 'pending' | 'approved' | 'rejected';
    requestedAt: string;
    approvedBy?: string;
    approvedAt?: string;
  };

  createdAt: string;
}

const STORAGE_KEY = 'phui_de_user_onboarding';

export function useOnboarding() {
  const [data, setData, clearData] = useLocalStorage<UserOnboardingData | null>(
    STORAGE_KEY,
    null,
  );

  const isOnboarded = !!data;

  const saveOnboarding = (
    onboardingData: Omit<UserOnboardingData, 'createdAt' | 'approval'>,
  ) => {
    const fullData: UserOnboardingData = {
      ...onboardingData,
      approval: {
        status: onboardingData.role.requiresApproval ? 'pending' : 'approved',
        requestedAt: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
    };
    setData(fullData);
  };

  const updateApprovalStatus = (
    status: 'approved' | 'rejected',
    approvedBy?: string,
  ) => {
    if (!data) return;

    setData({
      ...data,
      approval: {
        ...data.approval,
        status,
        approvedBy,
        approvedAt: new Date().toISOString(),
      },
    });
  };

  const resetOnboarding = () => {
    clearData();
  };

  return {
    data,
    isOnboarded,
    saveOnboarding,
    updateApprovalStatus,
    resetOnboarding,
  };
}

// Team roles configuration
export const TEAM_ROLES: TeamRole[] = [
  { id: 'coach', label: 'HLV', icon: '🎯', requiresApproval: true },
  { id: 'captain', label: 'Đội trưởng', icon: '👑', requiresApproval: true },
  { id: 'vice_captain', label: 'Đội phó', icon: '⭐', requiresApproval: true },
  { id: 'member', label: 'Đội viên', icon: '⚽', requiresApproval: false },
  { id: 'soul', label: 'Linh hồn của đội', icon: '💚', requiresApproval: true },
];

export const FREE_AGENT_ROLES: TeamRole[] = [
  { id: 'striker', label: 'Tiền đạo', icon: '⚡', requiresApproval: false },
  { id: 'midfielder', label: 'Tiền vệ', icon: '🎯', requiresApproval: false },
  { id: 'defender', label: 'Hậu vệ', icon: '🛡️', requiresApproval: false },
  { id: 'goalkeeper', label: 'Thủ môn', icon: '🧤', requiresApproval: false },
];
