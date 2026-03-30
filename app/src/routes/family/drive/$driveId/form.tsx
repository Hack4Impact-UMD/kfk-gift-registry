import { Outlet, createFileRoute, useLocation } from "@tanstack/react-router";
import { FormProvider } from "@/components/providers/FormProvider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { FormProgressBar } from "@/components/form/FormProgressBar";

export const Route = createFileRoute("/family/drive/$driveId/form")({
  component: FormLayoutComponent,
  ssr: false,
});

function FormLayoutComponent() {
  const { driveId } = Route.useParams();
  const location = useLocation();

  const isConsentRoute = location.pathname.includes("/form/consent");
  const isThankYouRoute = location.pathname.includes("/form/thank-you");

  const showProgressBar = !isConsentRoute && !isThankYouRoute;
  const hideFormHeader = isThankYouRoute;

  return (
    <FormProvider key={driveId} driveId={driveId}>
      <div className="min-h-screen p-4 bg-gray-50 flex flex-col items-center">
        <div className="w-full max-w-md">
          <Card className="w-full">
            {!hideFormHeader && (
              <CardHeader>
                <CardDescription className="text-center">
                  Fill all required fields to go to next step
                  <span className="text-destructive">*</span>
                </CardDescription>
                {showProgressBar && <FormProgressBar driveId={driveId} />}
              </CardHeader>
            )}
            <CardContent>
              <Outlet />
            </CardContent>
          </Card>
        </div>
      </div>
    </FormProvider>
  );
}
