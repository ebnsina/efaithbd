'use client';

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center p-6 text-center">
        <div>
          <h1 className="text-xl font-semibold">Something went wrong</h1>
          <p className="mt-2 text-sm text-gray-600">Please try again.</p>
          <button
            onClick={reset}
            className="mt-4 rounded bg-black px-4 py-2 text-sm text-white"
            type="button"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
