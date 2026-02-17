import { Check } from 'lucide-react';

interface StepperProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

export function Stepper({ currentStep, totalSteps, steps }: StepperProps) {
  return (
    <div className="mx-auto mb-6 w-full max-w-md">
      {/* Progress bar */}
      <div className="relative mb-8">
        <div className="bg-muted h-1 overflow-hidden rounded-full">
          <div
            className="from-primary to-accent h-full bg-gradient-to-r transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="relative flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div
              key={stepNumber}
              className="relative flex flex-1 flex-col items-center"
            >
              {/* Connector line */}
              {stepNumber < totalSteps && (
                <div
                  className={`absolute top-4 left-1/2 -z-10 h-0.5 w-full transition-all duration-500 ${isCompleted ? 'bg-primary' : 'bg-muted'} `}
                />
              )}

              {/* Step circle */}
              <div
                className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
                  isCompleted
                    ? 'bg-primary text-primary-foreground scale-100 shadow-lg'
                    : isCurrent
                      ? 'from-primary to-accent text-primary-foreground ring-primary/20 scale-110 bg-gradient-to-br shadow-xl ring-4'
                      : 'bg-muted text-muted-foreground scale-90'
                } `}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" strokeWidth={3} />
                ) : (
                  stepNumber
                )}
              </div>

              {/* Step label */}
              <span
                className={`mt-2 text-center text-xs font-medium transition-all duration-300 ${isCurrent ? 'text-foreground scale-105' : 'text-muted-foreground scale-100'} `}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
