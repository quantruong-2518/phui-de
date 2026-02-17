'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { WelcomeScreen } from './WelcomeScreen';
import { TeamSelectionStep } from './steps/TeamSelectionStep';
import { RoleSelectionStep } from './steps/RoleSelectionStep';
import { PhoneVerificationStep } from './steps/PhoneVerificationStep';
import { Stepper } from './Stepper';
import {
  useOnboarding,
  TEAM_ROLES,
  FREE_AGENT_ROLES,
} from '@/hooks/use-onboarding';

type OnboardingStep =
  | 'welcome'
  | 'team_selection'
  | 'role_selection'
  | 'phone_verification';

interface OnboardingState {
  status?: 'team_member' | 'free_agent';
  team?: {
    id: string;
    name: string;
    code: string;
  };
  roleId?: string;
  customRole?: string;
}

const STEPS = ['Chọn đội', 'Vai trò', 'Xác minh'];

export function OnboardingModal() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [state, setState] = useState<OnboardingState>({});
  const { saveOnboarding } = useOnboarding();

  const getStepNumber = () => {
    switch (currentStep) {
      case 'team_selection':
        return 1;
      case 'role_selection':
        return 2;
      case 'phone_verification':
        return 3;
      default:
        return 0;
    }
  };

  const handleStart = () => {
    setCurrentStep('team_selection');
  };

  const handleTeamSelection = (
    status: 'team_member' | 'free_agent',
    team?: { id: string; name: string; code: string },
  ) => {
    setState({ status, team });
    setCurrentStep('role_selection');
  };

  const handleRoleSelection = (roleId: string, customRole?: string) => {
    setState((prev) => ({ ...prev, roleId, customRole }));
    setCurrentStep('phone_verification');
  };

  const handlePhoneVerification = (phone: string, name: string) => {
    if (!state.status || !state.roleId) return;

    const allRoles = [...TEAM_ROLES, ...FREE_AGENT_ROLES];
    let selectedRole = allRoles.find((r) => r.id === state.roleId);

    // If custom role, create a new role object
    if (state.roleId === 'custom' && state.customRole) {
      selectedRole = {
        id: 'custom',
        label: state.customRole,
        icon: '⭐',
        requiresApproval: true,
      };
    }

    if (!selectedRole) return;

    saveOnboarding({
      status: state.status,
      team: state.team,
      role: selectedRole,
      phone,
      name,
    });

    // Navigate to homepage after successful onboarding
    router.push('/');
  };

  const handleBack = () => {
    if (currentStep === 'role_selection') {
      setCurrentStep('team_selection');
    } else if (currentStep === 'phone_verification') {
      setCurrentStep('role_selection');
    }
  };

  // Show welcome screen
  if (currentStep === 'welcome') {
    return <WelcomeScreen onStart={handleStart} />;
  }

  // Show stepper flow with clean layout
  return (
    <div className="bg-background fixed inset-0 z-50 flex flex-col">
      {/* Fixed Stepper at top - no border */}
      <div className="w-full shrink-0 px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <Stepper currentStep={getStepNumber()} totalSteps={3} steps={STEPS} />
        </div>
      </div>

      {/* Content area - fills remaining space */}
      <div className="flex-1 overflow-hidden">
        <div className="mx-auto h-full max-w-2xl px-4">
          {currentStep === 'team_selection' && (
            <TeamSelectionStep onNext={handleTeamSelection} />
          )}
          {currentStep === 'role_selection' && (
            <RoleSelectionStep
              status={state.status!}
              onNext={handleRoleSelection}
              onBack={handleBack}
            />
          )}
          {currentStep === 'phone_verification' && (
            <PhoneVerificationStep
              status={state.status!}
              team={state.team}
              roleId={state.roleId!}
              customRole={state.customRole}
              onNext={handlePhoneVerification}
              onBack={handleBack}
            />
          )}
        </div>
      </div>
    </div>
  );
}
