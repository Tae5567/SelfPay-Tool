//src/app/payment-status/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation'; // Still keep this, though not directly used for status here

export default function PaymentStatusPage() {
  // We'll set these statically to indicate success
  const [message, setMessage] = useState('Payment Successful! Thank you.');
  const [isSuccess, setIsSuccess] = useState<boolean>(true); // Always true

  // The searchParams are no longer used for status determination on this page
  // const searchParams = useSearchParams();

  useEffect(() => {
    // This page will always display "Payment Successful"
    // and then attempt to close itself.

    // No polling needed here, as we're not checking actual status on this page.

    // Attempt to close the window/tab after a short delay
    const closeTabTimeout = setTimeout(() => {
      // Check if this window was opened by another (i.e., if window.opener exists)
      if (window.opener) {
        window.close();
      } else {
        // If it's not a popup (e.g., opened directly), we might just
        // show a message about manually closing.
        console.log("Not a popup, cannot auto-close. User should close this tab.");
        setMessage(prev => prev + " You can now close this window.");
      }
    }, 2000); // 2 seconds delay before attempting to close

    // Cleanup function: clear the timeout if the component unmounts
    return () => clearTimeout(closeTabTimeout);
  }, []); // Empty dependency array means this effect runs once on mount

  // Basic styling for the status message
  let bgColor = 'bg-green-100'; // Green for success
  let textColor = 'text-green-800'; // Darker green text

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div
        className={`p-6 rounded-lg shadow-lg text-center ${bgColor} ${textColor} transition-all duration-300 ease-in-out`}
        style={{
          minWidth: '300px',
          maxWidth: '500px',
          opacity: isSuccess !== null ? 1 : 0, // Fade in the message
          transform: isSuccess !== null ? 'translateY(0)' : 'translateY(20px)',
        }}
      >
        <p className="text-xl font-semibold mb-2">{message}</p>
        <p className="text-sm">Redirecting you shortly or you can close this window.</p>
      </div>
    </div>
  );
}