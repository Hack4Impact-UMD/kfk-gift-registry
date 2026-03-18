import { Outlet, createFileRoute } from "@tanstack/react-router";
import { FormProvider } from "@/components/providers/FormProvider";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { FormProgressBar } from "@/components/form/FormProgressBar";

export const Route = createFileRoute("/family/drive/$driveId/form")({
  component: FormLayoutComponent,
});

function FormLayoutComponent() {
  const { driveId } = Route.useParams();
  return (
    <FormProvider>
      <div className="min-h-screen p-4 bg-gray-50 flex flex-col items-center">
        <div className="w-full max-w-md">
          <Card className="w-full">
            <CardHeader>
              <CardDescription className="text-center">
                Fill all required fields to go to next step
                <span className="text-destructive">*</span>
              </CardDescription>
              <FormProgressBar driveId={driveId} />
            </CardHeader>
            <CardContent>
              <Outlet />
            </CardContent>
          </Card>
        </div>
      </div>
    </FormProvider>
  );
}
