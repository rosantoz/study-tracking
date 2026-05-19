import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="w-full max-w-md">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Study Tracker</h1>
        <p className="mt-1 text-sm text-slate-500">Sign in to log your study sessions</p>
      </div>
      <Suspense>
        <LoginForm />
      </Suspense>
      <p className="mt-4 text-center text-xs text-slate-500">
        Seed logins: <code>student1@example.com</code> &hellip; <code>student10@example.com</code>
        <br />
        Password: <code>password123</code>
      </p>
    </div>
  );
}
