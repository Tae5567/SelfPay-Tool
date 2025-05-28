// components/PaymentPostingButton.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PaymentPostingButtonProps {
  amount: number;
  serviceDateValue?: string; // Optional service date in MM/DD/YYYY format
}

const API_URL = process.env.NEXT_PUBLIC_PAYMENT_API_URL || 'http://localhost:5000';

export function PaymentPostingButton({ amount, serviceDateValue }: PaymentPostingButtonProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [patientId, setPatientId] = useState('');
  const [serviceDate, setServiceDate] = useState(serviceDateValue || '');
  const [isLoading, setIsLoading] = useState(false);

  const handlePostPayment = async () => {
    if (!patientId) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Patient ID is required.',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/post-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patient_id: patientId,
          amount,
          payment_method: 'Credit Card',
          service_date: serviceDate || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Payment Posted',
          description: `Successfully posted $${amount} payment for patient ${patientId}`,
        });
        setIsOpen(false);
      } else {
        toast({
          variant: 'destructive',
          title: 'Payment Failed',
          description: data.message || 'Failed to post payment',
        });
      }
    } catch (error) {
      console.error('Error posting payment:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Connection failed. Please check if the payment service is running.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md">
          Post to eCW (${amount})
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Post Payment to eClinicalWorks</AlertDialogTitle>
          <AlertDialogDescription>
            You are about to post a payment of ${amount} to eClinicalWorks.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="patientId">Patient ID</Label>
            <Input
              id="patientId"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              placeholder="Enter patient ID or account number"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="serviceDate">Service Date (MM/DD/YYYY)</Label>
            <Input
              id="serviceDate"
              value={serviceDate}
              onChange={(e) => setServiceDate(e.target.value)}
              placeholder="MM/DD/YYYY"
            />
            <p className="text-sm text-gray-500">
              * Important: This must match the DOS in eCW exactly
            </p>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handlePostPayment();
            }}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? 'Processing...' : 'Post Payment'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}