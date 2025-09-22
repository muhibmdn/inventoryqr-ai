'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { loginAction } from '@/app/actions/auth';
import Link from 'next/link';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

import type { ActionState } from '@/app/actions/auth';

const initialState: ActionState = {
  errors: { username: [], password: [], confirmPassword: [], _form: [] },
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" aria-disabled={pending} className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
      {pending ? 'Logging in...' : 'Login'}
    </button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useFormState(loginAction, initialState);
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered');

  useEffect(() => {
    if (state.errors?._form && state.errors._form.length > 0) {
      alert(state.errors._form.join(', '));
    }
    if (registered) {
      alert('Registration successful! Please log in.');
    }
  }, [state, registered]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900">Login</h2>
        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {state.errors?.username && (
              <p className="mt-1 text-sm text-red-600">{state.errors.username}</p>
            )}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {state.errors?.password && (
              <p className="mt-1 text-sm text-red-600">{state.errors.password}</p>
            )}
          </div>
          <SubmitButton />
        </form>
        <p className="text-sm text-center text-gray-600">
          Don&apos;t have an account? <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">Register</Link>
        </p>
      </div>
    </div>
  );
}
