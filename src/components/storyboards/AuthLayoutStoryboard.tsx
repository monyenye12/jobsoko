import AuthLayout from "../auth/AuthLayout";

export default function AuthLayoutStoryboard() {
  return (
    <AuthLayout>
      <div className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-md mx-auto">
        <p className="text-center text-gray-600">
          This is a preview of the authentication layout with JobSoko branding.
        </p>
      </div>
    </AuthLayout>
  );
}
