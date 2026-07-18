import {
  Outlet,
  createFileRoute,
  notFound,
  useLocation,
} from "@tanstack/react-router";
import { FormProvider } from "@/components/providers/FormProvider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { FormProgressBar } from "@/components/form/FormProgressBar";
import { getFormLinkById } from "@/server/functions/formLinks";

export const Route = createFileRoute("/family/form/$formLinkId")({
  head: () => ({
    meta: [
      { title: "Registration Form - Kisses for Kyle" },
      {
        name: "description",
        content: "Complete your family registration form",
      },
    ],
  }),
  loader: async ({ params }) => {
    const formLink = await getFormLinkById({ data: { id: params.formLinkId } });
    if (!formLink || !formLink.active) throw notFound();
    return { formLink };
  },
  component: FormLayoutComponent,
  notFoundComponent: FormNotFoundComponent,
  ssr: false,
});

function FormLayoutComponent() {
  const { formLinkId } = Route.useParams();
  const location = useLocation();

  const isConsentRoute = location.pathname.endsWith("/consent");
  const isThankYouRoute = location.pathname.endsWith("/thank-you");

  const showProgressBar = !isConsentRoute && !isThankYouRoute;
  const hideFormHeader = isThankYouRoute;

  return (
    <FormProvider key={formLinkId} formLinkId={formLinkId}>
      <div className="min-h-screen p-4 bg-gray-50 flex flex-col items-center">
        <div className="w-full max-w-md">
          <Card className="w-full">
            {!hideFormHeader && (
              <CardHeader>
                <CardDescription className="text-center">
                  Fill all required fields to go to next step
                  <span className="text-destructive">*</span>
                </CardDescription>
                {showProgressBar && <FormProgressBar formLinkId={formLinkId} />}
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

function FormNotFoundComponent() {
  return (
    <div className="w-full min-h-screen">
      <div className="w-full px-4 py-8 lg:px-8 lg:py-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8 font-gaegu">
            Form Not Found
          </h1>
          <p className="text-center text-muted-foreground">
            This registration link is invalid or no longer exists.
          </p>
        </div>
      </div>
    </div>
  );
}
