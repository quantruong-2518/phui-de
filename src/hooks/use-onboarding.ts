import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
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
  const queryClient = useQueryClient();
  const [localData, setLocalData, clearLocalData] =
    useLocalStorage<UserOnboardingData | null>(STORAGE_KEY, null);

  // Fetch from API
  const { data: apiResponse, isLoading: isLoadingApi } = useQuery({
    queryKey: ['onboarding'],
    queryFn: async () => {
      try {
        const response = await api.get<{ data: UserOnboardingData | null }>(
          '/onboarding',
        );
        return response.data;
      } catch (error) {
        console.error('Failed to fetch onboarding from API:', error);
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Only retry once
  });

  // Use API data if available, fallback to localStorage
  const data = apiResponse || localData;
  const isOnboarded = !!data;

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (
      onboardingData: Omit<UserOnboardingData, 'createdAt' | 'approval'>,
    ) => {
      return api.post('/onboarding', onboardingData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding'] });
    },
    onError: (error) => {
      console.error('Failed to save onboarding to API:', error);
    },
  });

  const saveOnboarding = (
    onboardingData: Omit<UserOnboardingData, 'createdAt' | 'approval'>,
  ) => {
    // Save to localStorage immediately for offline support
    const fullData: UserOnboardingData = {
      ...onboardingData,
      approval: {
        status: onboardingData.role.requiresApproval ? 'pending' : 'approved',
        requestedAt: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
    };
    setLocalData(fullData);

    // Then sync to API
    saveMutation.mutate(onboardingData);
  };

  const updateApprovalStatus = (
    status: 'approved' | 'rejected',
    approvedBy?: string,
  ) => {
    if (!data) return;

    const updatedData = {
      ...data,
      approval: {
        ...data.approval,
        status,
        approvedBy,
        approvedAt: new Date().toISOString(),
      },
    };

    setLocalData(updatedData);
    queryClient.setQueryData(['onboarding'], updatedData);
  };

  const resetOnboarding = () => {
    clearLocalData();
    queryClient.setQueryData(['onboarding'], null);
  };

  return {
    data,
    isOnboarded,
    saveOnboarding,
    updateApprovalStatus,
    resetOnboarding,
    isLoading: isLoadingApi || saveMutation.isPending,
    isSaving: saveMutation.isPending,
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
