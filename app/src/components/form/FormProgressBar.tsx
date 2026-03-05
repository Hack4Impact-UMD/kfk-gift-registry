import { useFormContext, type FamilyFormState } from "@/components/providers/FormProvider";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { 
  UserIcon, 
  UsersIcon, 
  GiftIcon, 
  DocumentCheckIcon 
} from "@heroicons/react/24/solid";
import { generalInfoSchema, childrenFormSchema, giftsFormSchema } from "@/lib/formSchemas";

type FormStep = {
  id: string;
  label: string;
  path: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  sectionKey: keyof FamilyFormState;
  schema?: any;
  isReviewPage?: boolean; // Flag for pages without their own form data
};

const FORM_STEPS: FormStep[] = [
  {
    id: "general",
    label: "General",
    path: "/family/form/general-info",
    icon: UserIcon,
    sectionKey: "generalInfo",
    schema: generalInfoSchema,
  },
  {
    id: "children",
    label: "Child Info",
    path: "/family/form/children",
    icon: UsersIcon,
    sectionKey: "children",
    schema: childrenFormSchema,
  },
  {
    id: "gifts",
    label: "Gifts!",
    path: "/family/form/gift-details",
    icon: GiftIcon,
    sectionKey: "gifts",
    schema: giftsFormSchema,
  },
  {
    id: "review",
    label: "Review",
    path: "/family/form/review",
    icon: DocumentCheckIcon,
    sectionKey: "generalInfo", // Review doesn't have its own section
    isReviewPage: true, // Flag to identify review page
  },
];

type StepState = "current" | "complete" | "error" | "incomplete";

interface FormProgressBarProps {
  onNavigate?: (targetPath: string) => void | Promise<void>;
}

export function FormProgressBar({ onNavigate }: FormProgressBarProps) {
  const { formState } = useFormContext();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const getStepState = (step: FormStep, index: number): StepState => {
    // Check if this is the current step
    if (currentPath === step.path) {
      return "current";
    }

    // Special handling for review step
    if (step.id === "review") {
      // If we're past the review page (shouldn't happen, but handle it)
      if (currentPath.includes("/family/form/") && currentPath > step.path) {
        return "complete";
      }
      
      // Check if all previous steps are complete
      const allPreviousComplete = FORM_STEPS.slice(0, -1).every((s) => {
        const data = formState[s.sectionKey];
        if (!data) return false;
        if (s.schema) {
          const result = s.schema.safeParse(data);
          return result.success;
        }
        return true;
      });
      
      // Review is only accessible if all previous steps are valid
      return allPreviousComplete ? "complete" : "incomplete";
    }

    // Check if step has data
    const stepData = formState[step.sectionKey];
    if (!stepData) {
      return "incomplete";
    }

    // Validate with schema if available
    if (step.schema) {
      const result = step.schema.safeParse(stepData);
      return result.success ? "complete" : "error";
    }

    // If no schema, just check if data exists
    return "complete";
  };

  // Helper to get the underlying state (ignoring current status)
  const getUnderlyingState = (step: FormStep, index: number): StepState => {
    // Special handling for review step
    if (step.id === "review") {
      const allPreviousComplete = FORM_STEPS.slice(0, -1).every((s) => {
        const data = formState[s.sectionKey];
        if (!data) return false;
        if (s.schema) {
          const result = s.schema.safeParse(data);
          return result.success;
        }
        return true;
      });
      return allPreviousComplete ? "complete" : "incomplete";
    }

    // Check if step has data
    const stepData = formState[step.sectionKey];
    if (!stepData) {
      return "incomplete";
    }

    // Validate with schema if available
    if (step.schema) {
      const result = step.schema.safeParse(stepData);
      return result.success ? "complete" : "error";
    }

    // If no schema, just check if data exists
    return "complete";
  };

  // Find the furthest completed step (including current)
  const getFurthestAccessibleStep = (): number => {
    const currentStepIndex = FORM_STEPS.findIndex(step => step.path === currentPath);
    
    // User can access any step up to and including where they currently are
    // OR any step they've already visited (has data, even if invalid)
    let furthest = currentStepIndex >= 0 ? currentStepIndex : 0;
    
    // Check which steps have been visited (have any data)
    for (let i = 0; i < FORM_STEPS.length; i++) {
      const step = FORM_STEPS[i];
      
      // Skip review page for this check
      if (step.id === "review") {
        // Review is accessible if all previous steps have data
        const allPreviousHaveData = FORM_STEPS.slice(0, -1).every((s) => {
          return formState[s.sectionKey] !== undefined;
        });
        if (allPreviousHaveData && i > furthest) {
          furthest = i;
        }
        continue;
      }
      
      // If this step has ANY data (even if invalid), user has been there
      const stepData = formState[step.sectionKey];
      if (stepData !== undefined && i > furthest) {
        furthest = i;
      }
    }
    
    return furthest;
  };

  const isStepClickable = (step: FormStep, index: number): boolean => {
    const state = getStepState(step, index);
    
    // Current step is not clickable (already on it)
    if (state === "current") {
      return false;
    }
    
    // Can click on any step up to and including the furthest accessible step
    const furthestIndex = getFurthestAccessibleStep();
    return index <= furthestIndex;
  };

  const handleStepClick = async (step: FormStep, index: number) => {
    if (!isStepClickable(step, index)) {
      return;
    }

    // If onNavigate prop is provided, call it first
    // This allows the parent form to save current state before navigating
    if (onNavigate) {
      await onNavigate(step.path);
    } else {
      // Default navigation
      navigate({ to: step.path as any });
    }
  };

  const getStepStyles = (state: StepState, underlyingState: StepState) => {
    switch (state) {
      case "current":
        // For current step, use gold border and underline
        // but fill color based on underlying validation state
        let fillColor = "bg-gray-300"; // default
        let iconColor = "text-gray-500";
        
        if (underlyingState === "complete") {
          fillColor = "bg-[var(--color-kfk-blue)]";
          iconColor = "text-white";
        } else if (underlyingState === "error") {
          fillColor = "bg-red-500";
          iconColor = "text-white";
        }
        
        return {
          iconBg: fillColor,
          iconBorder: "border-[#F4D03F] border-[3px]", // Gold border
          iconColor: iconColor,
          labelColor: "text-gray-900",
          underline: "border-b-2 border-[#F4D03F]", // Gold underline
        };
      case "complete":
        return {
          iconBg: "bg-[var(--color-kfk-blue)]",
          iconBorder: "border-[var(--color-kfk-blue)] border-[3px]",
          iconColor: "text-white",
          labelColor: "text-gray-900",
          underline: "",
        };
      case "error":
        return {
          iconBg: "bg-red-500",
          iconBorder: "border-red-500 border-[3px]",
          iconColor: "text-white",
          labelColor: "text-gray-900",
          underline: "border-b-2 border-red-500",
        };
      case "incomplete":
      default:
        return {
          iconBg: "bg-gray-300",
          iconBorder: "border-gray-300 border-[3px]",
          iconColor: "text-gray-500",
          labelColor: "text-gray-400",
          underline: "",
        };
    }
  };

  return (
    <div className="w-full bg-white">
      <div className="max-w-md mx-auto py-4 px-6">
        <div className="relative flex items-center justify-between">
          {/* Connecting lines background */}
          <div className="absolute top-[22px] left-[10%] right-[10%] h-[2px] bg-gray-300 -z-10" />
          
          {/* Colored connecting lines for completed steps */}
          <div className="absolute top-[22px] left-[10%] right-[10%] h-[2px] -z-10">
            <div className="absolute inset-0 flex">
              {FORM_STEPS.slice(0, -1).map((step, index) => {
                const currentState = getStepState(step, index);
                const nextState = getStepState(FORM_STEPS[index + 1], index + 1);
                
                // Line is colored if current step is complete or current
                const shouldColor = currentState === "complete" || currentState === "current";
                const lineColor = currentState === "error"
                  ? "bg-red-500"
                  : shouldColor
                  ? "bg-[var(--color-kfk-blue)]"
                  : "bg-transparent";

                return (
                  <div
                    key={`line-${step.id}`}
                    className={`h-full flex-1 ${lineColor} transition-colors duration-300`}
                  />
                );
              })}
            </div>
          </div>

          {/* Steps */}
          {FORM_STEPS.map((step, index) => {
            const state = getStepState(step, index);
            const underlyingState = getUnderlyingState(step, index);
            const styles = getStepStyles(state, underlyingState);
            const Icon = step.icon;
            const clickable = isStepClickable(step, index);

            return (
              <div 
                key={step.id} 
                className="flex flex-col items-center relative z-10"
                onClick={() => handleStepClick(step, index)}
              >
                {/* Icon circle */}
                <div
                  className={`
                    w-[44px] h-[44px] rounded-full 
                    ${styles.iconBorder}
                    ${styles.iconBg}
                    flex items-center justify-center
                    transition-all duration-300
                    shadow-sm
                    ${clickable ? 'cursor-pointer hover:scale-110 hover:shadow-md' : 'cursor-default'}
                  `}
                >
                  <Icon className={`w-5 h-5 ${styles.iconColor}`} />
                </div>

                {/* Label with conditional underline */}
                <div className="mt-2.5 text-center">
                  <span
                    className={`
                      text-xs font-semibold ${styles.labelColor}
                      ${styles.underline}
                      inline-block pb-0.5
                      transition-colors duration-300
                      whitespace-nowrap
                      ${clickable ? 'cursor-pointer' : 'cursor-default'}
                    `}
                  >
                    {step.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}