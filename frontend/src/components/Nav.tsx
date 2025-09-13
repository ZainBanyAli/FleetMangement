'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Nav() {
  const { token, logout, initialized } = useAuth();
  const router = useRouter();

  if (!initialized) {
    // Prevent UI flicker while checking token
    return null;
  }

  return (
    <nav className="w-full bg-gray-100 border-b px-4 py-3 flex items-center justify-between">
      {/* Left side links */}
      <div className="flex items-center gap-4">
        <Link href="/" className="font-semibold">
          Fleet
        </Link>
        {token && (
          <>
            <Link href="/dashboard" className="text-sm">
              Dashboard
            </Link>
            <Link href="/vehicles" className="text-sm">
              Vehicles
            </Link>
          </>
        )}
      </div>

      {/* Right side auth buttons */}
      {token ? (
        <button
          type="button"
          onClick={() => {
            logout(); // clears storage + context
            router.replace('/login');
          }}
          className="text-sm px-3 py-1 bg-gray-800 text-white rounded hover:bg-gray-700 transition"
        >
          Logout
        </button>
      ) : (
        <div className="flex gap-3 text-sm">
          <Link
            href="/login"
            className="px-3 py-1 rounded bg-gray-800 text-white hover:bg-gray-700 transition"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-3 py-1 rounded border border-gray-800 text-gray-800 hover:bg-gray-100 transition"
          >
            Register
          </Link>
        </div>
      )}
    </nav>
  );
}
