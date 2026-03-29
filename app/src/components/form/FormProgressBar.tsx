import { Link, useLocation } from "@tanstack/react-router";
import {
  DocumentCheckIcon,
  GiftIcon,
  UserIcon,
  UsersIcon,
} from "@heroicons/react/24/solid";
import { Fragment } from "react";
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
    label: "Child(ren)",
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
    if (currentPath.includes(`/form/${getPathSegment(step.id)}`))
      return "current";
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
        <div className="flex flex-col gap-2 w-full">
          <div className="flex w-full items-center">
            {FORM_STEPS.map((step, index) => {
              const state = getStepState(step, index);
              const underlyingState = getUnderlyingState(step, index);
              const styles = getStepStyles(state, underlyingState);
              const Icon = step.icon;
              const clickable = isStepClickable(step, index);

              const segmentClass =
                index === 0
                  ? ""
                  : (() => {
                      const targetStep = FORM_STEPS[index];
                      const targetState = getStepState(targetStep, index);
                      const targetUnderlying = getUnderlyingState(
                        targetStep,
                        index,
                      );
                      const targetIconGray =
                        targetState === "incomplete" ||
                        (targetState === "current" &&
                          targetUnderlying === "incomplete");
                      if (targetIconGray) {
                        return "bg-gray-300";
                      }
                      return "bg-[var(--color-kfk-blue)]";
                    })();

              const iconCircle = (
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
              );

              const iconCell = clickable ? (
                <StepLink
                  stepId={step.id}
                  driveId={driveId}
                  className="flex shrink-0 w-[44px] justify-center cursor-pointer"
                >
                  {iconCircle}
                </StepLink>
              ) : (
                <div className="flex shrink-0 w-[44px] justify-center cursor-default">
                  {iconCircle}
                </div>
              );

              return (
                <Fragment key={step.id}>
                  {index > 0 && (
                    <div
                      className={`h-[3px] flex-1 min-w-[4px] rounded-full ${segmentClass} transition-colors duration-300`}
                      aria-hidden
                    />
                  )}
                  {iconCell}
                </Fragment>
              );
            })}
          </div>

          <div className="flex w-full items-start">
            {FORM_STEPS.map((step, index) => {
              const state = getStepState(step, index);
              const underlyingState = getUnderlyingState(step, index);
              const styles = getStepStyles(state, underlyingState);

              return (
                <Fragment key={`${step.id}-label`}>
                  {index > 0 && <div className="flex-1 min-w-0" aria-hidden />}
                  <div className="shrink-0 w-[44px] text-center">
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
                </Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function getPathSegment(stepId: string): string {
  switch (stepId) {
    case "general":
      return "general-info";
    case "children":
      return "children";
    case "gifts":
      return "gift-details";
    case "review":
      return "review";
    default:
      return "";
  }
}
