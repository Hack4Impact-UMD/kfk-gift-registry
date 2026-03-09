import { Outlet, createFileRoute } from "@tanstack/react-router";
import { FormProvider } from "@/components/providers/FormProvider";

export const Route = createFileRoute("/family/form")({
  component: FormLayoutComponent,
});

function FormLayoutComponent() {
  return (
    <FormProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="w-full max-w-md mx-auto px-4 py-6 sm:py-8">
          <Outlet />
        </div>
      </div>
    </FormProvider>
  );
}