'use client';

import { useEffect, useRef, useState } from 'react';

export default function CopyrightNotice() {
  const [isOpen, setIsOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
    }
  }, [isOpen]);

  return (
    <>
      <footer className="px-4 pb-6 pt-8 text-center sm:px-6">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="text-xs text-gray-500 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          aria-haspopup="dialog"
        >
          © 2026 UniVerse-City. All Rights Reserved.
        </button>
      </footer>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          role="presentation"
          onClick={() => setIsOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="copyright-dialog-title"
            className="w-full max-w-md rounded-lg bg-white p-6 text-gray-700 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2
              id="copyright-dialog-title"
              className="mb-3 text-base font-semibold text-gray-700"
            >
              Copyright Notice
            </h2>

            <p className="text-sm leading-6 text-gray-500">
              UniVerse-City is protected under the laws of Ghana and other
              countries. Unauthorized Duplication, Distribution, or Exhibition
              may result in Civil Liability and Criminal Prosecution.
            </p>

            <div className="mt-5 text-right">
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
