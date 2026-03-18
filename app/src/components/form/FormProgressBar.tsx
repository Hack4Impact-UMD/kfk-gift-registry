import { Link, useLocation, useParams } from "@tanstack/react-router";
import {
  DocumentCheckIcon,
  GiftIcon,
  UserIcon,
  UsersIcon,
} from "@heroicons/react/24/solid";
import type { ReactNode } from "react";
import type { FamilyFormState } from "@/components/providers/FormProvider";
import { useFormContext } from "@/components/providers/FormProvider";
import { SECTION_SCHEMAS } from "@/lib/formSchemas";

type FormStep = {
  id: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  sectionKey: keyof FamilyFormState;
};

const FORM_STEPS: Array<FormStep> = [
  {
    id: "general",
    label: "General",
    icon: UserIcon,
    sectionKey: "generalInfo",
  },
  {
    id: "children",
    label: "Child Info",
    icon: UsersIcon,
    sectionKey: "children",
  },
  {
    id: "gifts",
    label: "Gifts!",
    icon: GiftIcon,
    sectionKey: "gifts",
  },
  {
    id: "review",
    label: "Review",
    icon: DocumentCheckIcon,
    sectionKey: "generalInfo",
  },
];

type StepLinkProps = {
  stepId: string;
  driveId: string;
  className: string;
  children: ReactNode;
};

function StepLink({ stepId, driveId, className, children }: StepLinkProps) {
  const params = { driveId };
  switch (stepId) {
    case "general":
      return (
        <Link
          to="/family/drive/$driveId/form/general-info"
          params={params}
          className={className}
        >
          {children}
        </Link>
      );
    case "children":
      return (
        <Link
          to="/family/drive/$driveId/form/children"
          params={params}
          className={className}
        >
          {children}
        </Link>
      );
    case "gifts":
      return (
        <Link
          to="/family/drive/$driveId/form/gift-details"
          params={params}
          className={className}
        >
          {children}
        </Link>
      );
    case "review":
      return (
        <Link
          to="/family/drive/$driveId/form/review"
          params={params}
          className={className}
        >
          {children}
        </Link>
      );
    default:
      return <div className={className}>{children}</div>;
  }
}

type StepState = "current" | "complete" | "error" | "incomplete";

export function FormProgressBar({ driveId }: { driveId: string }) {
  const { formState } = useFormContext();
  const location = useLocation();
  const currentPath = location.pathname;

  const getStepState = (step: FormStep, index: number): StepState => {
    if (currentPath.includes(`/form/${getPathSegment(step.id)}`)) return "current";
    return getUnderlyingState(step, index);
  };

  const getUnderlyingState = (step: FormStep, _: number): StepState => {
    if (step.id === "review") {
      const allPreviousComplete = FORM_STEPS.slice(0, -1).every((s) => {
        const data = formState[s.sectionKey];
        if (!data) return false;
        const schema = SECTION_SCHEMAS[s.sectionKey];
        return schema.safeParse(data).success;
      });
      return allPreviousComplete ? "complete" : "incomplete";
    }

    const stepData = formState[step.sectionKey];
    if (!stepData) return "incomplete";

    const schema = SECTION_SCHEMAS[step.sectionKey];
    return schema.safeParse(stepData).success ? "complete" : "error";
  };

  const isStepClickable = (step: FormStep, index: number): boolean => {
    if (getStepState(step, index) === "current") return false;

    const firstUnvisitedIndex = FORM_STEPS.findIndex(
      (s, i) => getUnderlyingState(s, i) === "incomplete",
    );

    if (firstUnvisitedIndex === -1) return true;

    return index < firstUnvisitedIndex;
  };

  const getStepStyles = (state: StepState, underlyingState: StepState) => {
    switch (state) {
      case "current": {
        let fillColor = "bg-gray-300";
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
          iconBorder: "border-[#F4D03F] border-[3px]",
          iconColor: iconColor,
          labelColor: "text-gray-900",
          underline: "border-b-2 border-[#F4D03F]",
        };
      }
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
          underline: "",
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
                const shouldColor =
                  currentState === "complete" || currentState === "current";
                const lineColor =
                  currentState === "error"
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

            const stepContent = (
              <>
                <div
                  className={`
                    w-[44px] h-[44px] rounded-full
                    ${styles.iconBorder}
                    ${styles.iconBg}
                    flex items-center justify-center
                    transition-all duration-300
                    shadow-sm
                    ${clickable ? "hover:scale-110 hover:shadow-md" : ""}
                  `}
                >
                  <Icon className={`w-5 h-5 ${styles.iconColor}`} />
                </div>
                <div className="mt-2.5 text-center">
                  <span
                    className={`
                      text-xs font-semibold ${styles.labelColor}
                      ${styles.underline}
                      inline-block pb-0.5
                      transition-colors duration-300
                      whitespace-nowrap
                    `}
                  >
                    {step.label}
                  </span>
                </div>
              </>
            );

            return clickable ? (
              <StepLink
                key={step.id}
                stepId={step.id}
                driveId={driveId ?? ""}
                className="flex flex-col items-center relative z-10 cursor-pointer"
              >
                {stepContent}
              </StepLink>
            ) : (
              <div
                key={step.id}
                className="flex flex-col items-center relative z-10 cursor-default"
              >
                {stepContent}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function getPathSegment(stepId: string): string {
  switch (stepId) {
    case "general": return "general-info";
    case "children": return "children";
    case "gifts": return "gift-details";
    case "review": return "review";
    default: return "";
  }
}
