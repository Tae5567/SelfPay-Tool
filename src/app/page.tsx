//src/app/page.tsx
'use client';

import {useState, useEffect, useRef} from 'react';
import Script from 'next/script';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {Separator} from '@/components/ui/separator';
import {ScrollArea} from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {useToast} from '@/hooks/use-toast';
import {Search, X, ShoppingCart, PlusCircle} from 'lucide-react';

// Service data from local JSON file
import servicesData from './services.json';

const SELF_PAY_TITLE = "SelfPay";

// Interface for the service data
interface Service {
  id: number;
  name: string;
  price: number;
  billing_code: string;
  category?: string;
  description?: string;
  tags?: string[];
  lab_code?: string | string[];
  is_fee?: boolean;
  fee_type?: string;
  requires_fees?: string[];
}

// Interface for the keyword mappings
interface KeywordMappings {
  [key: string]: string[];
}


// Enhanced keyword mappings for semantic search
const keywordMappings: KeywordMappings = {
  // Mental health related terms
  "mental health": ["psychiatry", "psychiatric", "therapy", "counseling", "mental", "behavioral health", "spravato", "ketamine", "depression"],
  "psychiatry": ["mental health", "psychiatric", "therapy", "counseling", "mental", "behavioral health", "medication management"],
  "therapy": ["psychiatry", "mental health", "counseling", "behavioral health"],
  "depression": ["mental health", "psychiatry", "spravato", "ketamine", "therapy"],
  "spravato": ["mental health", "psychiatry", "ketamine", "depression", "treatment"],
  "ketamine": ["mental health", "psychiatry", "spravato", "depression", "treatment"],
  
  // Telemedicine related terms
  "telemedicine": ["virtual", "tele", "remote", "video", "online", "digital", "virtual care", "tele visit", "telehealth"],
  "virtual": ["telemedicine", "tele", "remote", "video", "online", "digital", "virtual care", "tele visit", "telehealth"],
  "remote": ["telemedicine", "virtual", "tele", "video", "online"],
  "telehealth": ["telemedicine", "virtual", "tele", "video", "online", "digital"],

  // Physical examination related terms
  "physical": ["exam", "checkup", "check-up", "examination", "health check", "wellness exam", "pre-op", "clearance"],
  "examination": ["physical", "exam", "checkup", "check-up"],
  "exam": ["physical", "examination", "checkup", "check-up"],
  "pre-op": ["physical", "clearance", "surgery", "examination"],
  
  // Women's health related terms
  "women": ["women's health", "gynecological", "gynecology", "female", "women's physical", "pap", "smear", "cervical"],
  "gynecology": ["women", "women's health", "female", "women's physical", "pap smear"],
  "pap": ["women", "smear", "hpv", "cervical", "screening", "women's health"],
  "iud": ["women", "contraception", "gynecology", "women's health"],
  
  // Travel related terms
  "travel": ["international", "abroad", "vacation", "trip", "travel visit", "travel consultation", "yellow fever", "typhoid"],
  
  // Drug testing related terms
  "drug test": ["urine drug", "panel", "drug screen", "drug screening", "substance screening", "uds"],
  "urine": ["drug test", "urinalysis", "collection", "specimen"],
  "uds": ["drug test", "urine", "screening", "panel", "substance", "testing"],
  
  // COVID related terms
  "covid": ["coronavirus", "covid-19", "covid19", "covid test", "pcr", "rapid"],
  
  // CDL/DOT related terms
  "cdl": ["dot", "commercial driver", "driver", "truck driver", "driving test", "driver physical", "certificate"],
  "dot": ["cdl", "commercial driver", "driver physical", "commercial"],
  
  // Immigration related terms
  "immigration": ["visa", "foreign national", "immigrant", "i-693", "form i-693", "rpr", "quantiferon"],
  
  // Nutrition related terms
  "nutrition": ["diet", "dietary", "food", "eating", "dietitian", "nutritionist", "nutrition counseling"],
  
  // Weight loss related terms
  "weight": ["weight loss", "obesity", "diet", "weight management", "semaglutide"],
  "weight loss": ["weight", "obesity", "diet", "weight management", "semaglutide"],
  "semaglutide": ["weight", "weight loss", "obesity", "injection"],
  
  // Regular visit related terms
  "visit": ["appointment", "consultation", "checkup", "regular visit"],
  "regular": ["standard", "routine", "primary care", "visit", "general", "primary"],
  "primary": ["primary care", "general care", "regular visit", "general"],
  
  // Follow up related terms
  "follow up": ["follow-up", "subsequent", "return visit", "check back"],
  
  // Vaccination related terms
  "vaccine": ["vaccination", "shot", "immunization", "flu shot", "ppd", "flu vaccine"],
  "flu": ["influenza", "flu shot", "flu vaccine", "flu test", "flu wash"],
  "immunization": ["vaccine", "vaccination", "shot", "flu shot", "ppd"],
  
  // Hearing and vision related terms
  "hearing": ["audio", "audiometry", "ear", "auditory", "hearing test"],
  "vision": ["eye", "visual", "sight", "vision test", "vision screening"],
  
  // Substance treatment related terms
  "suboxone": ["addiction", "substance use", "bridge", "buprenorphine", "treatment"],
  "addiction": ["suboxone", "substance use", "treatment", "substance treatment"],
  "substance": ["addiction", "suboxone", "treatment", "substance use"],
  
  // Procedures and treatments
  "wound": ["laceration", "repair", "suture", "dressing", "care", "treatment", "i & d"],
  "injection": ["medication", "administration", "shot"],
  "infusion": ["iv", "fluids", "hydration", "immunity"],
  "iv": ["infusion", "fluids", "hydration", "therapy"],

  // Laboratory and diagnostics
  "lab": ["test", "laboratory", "diagnostic", "screening", "panel", "blood", "specimen"],
  "blood": ["test", "lab", "laboratory", "draw", "venipuncture", "specimen"],
  "x-ray": ["radiology", "imaging", "diagnostic"],
  "std": ["screening", "test", "sexual health", "infection"],
  
  // Primary care related terms
  "primary care": ["regular", "general", "routine", "visit", "checkup"],
  
  // Occupational health
  "occupational": ["employment", "job", "workplace", "commercial", "cdl", "dot"],
  
  // Blood work specific terms
  "blood work": ["blood test", "venipuncture", "lab", "laboratory", "panel"],
  "venipuncture": ["blood draw", "phlebotomy", "blood test"],
  
  // Category-specific terms
  "diagnostics": ["test", "screening", "panel", "lab"],
  "medications": ["injection", "drug", "shot", "treatment"],
  "procedures": ["treatment", "care", "removal", "therapy"],


   // Lab code related terms
   "lab code": ["test code", "cpt", "code", "laboratory code"],
   "test code": ["lab code", "cpt", "laboratory code"],
   "cpt": ["test code", "lab code", "billing code"],
   
   // Add specific lab codes as needed
   "7750": ["apolipoprotein b", "apo b", "lipid", "cholesterol"]

};

// Enhanced search function to include lab_code
const smarterSearch = (searchTerm: string, services: Service[]): Service[] => {
  // If search term is empty, return all services
  if (!searchTerm.trim()) return services;
  
  const lowerSearchTerm = searchTerm.toLowerCase();
  const searchWords = lowerSearchTerm.split(/\s+/).filter(word => word.length > 1);
  
  // Create an expanded set of search terms including synonyms
  let expandedSearchTerms = [...searchWords];
  
  // Add related keywords to search
  searchWords.forEach(word => {
    // Check if this word is a key in our mappings
    if (keywordMappings[word]) {
      expandedSearchTerms = [...expandedSearchTerms, ...keywordMappings[word]];
    }
    
    // Also check if this word appears in any keyword mapping values
    Object.entries(keywordMappings).forEach(([key, relatedTerms]) => {
      if (Array.isArray(relatedTerms)) {
        // Check if any term in relatedTerms includes the word or vice versa
        let termFound = false;
        for (const term of relatedTerms) {
          if (term.includes(word) || word.includes(term)) {
            termFound = true;
            break;
          }
        }
        
        if (termFound) {
          expandedSearchTerms.push(key);
          expandedSearchTerms = [...expandedSearchTerms, ...relatedTerms];
        }
      }
    });
  });
  
  // Remove duplicates from expanded search terms
  expandedSearchTerms = [...new Set(expandedSearchTerms)];
  
  // Score each service based on relevance to search terms
  interface ScoredService extends Service {
    score: number;
  }
  
  const scoredServices: ScoredService[] = services.map(service => {
    let score = 0;
    const serviceLower = {
      name: service.name.toLowerCase(),
      billing_code: service.billing_code.toLowerCase(),
      category: (service.category || '').toLowerCase(),
      tags: (service.tags || []).map((tag: string) => tag.toLowerCase()),
      lab_code: Array.isArray(service.lab_code) 
        ? service.lab_code.map((code: string) => code.toLowerCase())
        : (service.lab_code ? service.lab_code.toLowerCase() : '')
    };
    
    // Check direct matches in service fields
    expandedSearchTerms.forEach(term => {
      // Direct name match gets highest score
      if (serviceLower.name.includes(term)) score += 10;
      
      // Exact category match is most important
      if (serviceLower.category === term) score += 20;
      
      // Category contains term is also valuable
      if (serviceLower.category && serviceLower.category.includes(term)) score += 8;
      
      // Check tags if they exist
      if (service.tags && service.tags.length > 0) {
        // Check each tag individually
        for (const tag of serviceLower.tags) {
          if (tag.includes(term) || term.includes(tag)) {
            score += 5;
            break; // Only add score once if any tag matches
          }
        }
      }
      
      // Lab code match has high importance for lab tests
      if (service.lab_code) {
        if (Array.isArray(service.lab_code)) {
          // Check if any code in the array matches the term
          let containsTerm = false;
          for (const code of serviceLower.lab_code) {
            if (code === term) {
              score += 25;
              break;
            }
            if (code.includes(term)) {
              containsTerm = true;
            }
          }
          if (containsTerm) score += 15;
        } else if (typeof serviceLower.lab_code === 'string') {
          if (serviceLower.lab_code === term) {
            score += 25;
          } else if (serviceLower.lab_code.includes(term)) {
            score += 15;
          }
        }
      }
      
      // Billing code match has lower importance
      if (serviceLower.billing_code.includes(term)) score += 1;
    });
    
    // Match entire search phrase with lab_code gives a huge boost
    if (service.lab_code) {
      if (Array.isArray(service.lab_code)) {
        // Check if any code in the array exactly matches the search term
        let exactMatch = false;
        let containsMatch = false;
        
        for (const code of serviceLower.lab_code) {
          if (code === lowerSearchTerm) {
            exactMatch = true;
            break;
          }
          if (code.includes(lowerSearchTerm)) {
            containsMatch = true;
          }
        }
        
        if (exactMatch) score += 40;
        if (containsMatch) score += 20;
      } else if (typeof serviceLower.lab_code === 'string') {
        if (serviceLower.lab_code === lowerSearchTerm) {
          score += 40;
        } else if (serviceLower.lab_code.includes(lowerSearchTerm)) {
          score += 20;
        }
      }
    }
    
    // Match entire search phrase with name for better precision
    if (serviceLower.name.includes(lowerSearchTerm)) score += 30;
    
    // Match entire search phrase with category
    if (serviceLower.category && serviceLower.category.includes(lowerSearchTerm)) score += 25;
    
    // If the search term exactly matches the category, give a huge boost
    if (serviceLower.category === lowerSearchTerm) score += 50;
    
    // Also check direct match with billing code
    if (serviceLower.billing_code === lowerSearchTerm) score += 15;
    
    return { ...service, score };
  });
  
  // Only return services with a relevance score above a certain threshold
  const RELEVANCE_THRESHOLD = 5; // Minimum score to be considered relevant
  
  const matchedServices = scoredServices
    .filter(service => service.score >= RELEVANCE_THRESHOLD)
    .sort((a, b) => b.score - a.score);
  
  return matchedServices;
};


// FeeManager class to handle fee-related logic
// Update the FeeManager class to handle multiple occurrences of admin fees
// FeeManager class to handle fee-related logic
// Update the FeeManager class to handle multiple occurrences of admin fees
class FeeManager {
  private services: Service[];
  private appliedFees: Map<string, Service[]>;
  private feeServices: Service[];
  
  constructor(services: Service[]) {
    this.services = services;
    this.appliedFees = new Map<string, Service[]>();
    
    // Find fee services in the services data
    this.feeServices = this.services.filter(service => service.is_fee === true);
  }
  
  // Reset fees when cart is emptied or page is refreshed
  resetFees(): void {
    this.appliedFees.clear();
  }
  
  // Get the required fees for a list of selected services
  getRequiredFeeTypes(selectedServices: Service[]): Map<string, number> {
    const feeTypeCount = new Map<string, number>();
    
    // Determine if the "Immigration Physical with RPR, Quantiferon and Gonorrhea" is in the cart
    const hasImmigrationPhysical = selectedServices.some(service => service.id === 105); 

    selectedServices.forEach(service => {
      if (service.requires_fees && Array.isArray(service.requires_fees)) {
        service.requires_fees.forEach(feeType => {
          // --- NEW FEE LOGIC ---
          // If the cart contains the Immigration Physical AND the current feeType is 'venipuncture',
          // then SKIP adding this venipuncture fee.
          if (hasImmigrationPhysical && feeType.toLowerCase() === 'venipuncture') {
            console.log(`Waiving venipuncture fee because Immigration Physical (ID 105) is in cart.`);
            return; // Skip to the next feeType
          }
          // --- END NEW FEE LOGIC ---

          if (feeType.toLowerCase().includes('admin')) {
            // Increment count for admin fees
            const currentCount = feeTypeCount.get(feeType) || 0;
            feeTypeCount.set(feeType, currentCount + 1);
          } else {
            // For other non-admin fees (like venipuncture, if not skipped above), just mark it as needed once
            if (!feeTypeCount.has(feeType)) {
              feeTypeCount.set(feeType, 1);
            }
          }
        });
      }
    });
    
    return feeTypeCount;
  }
  
  // Find the fee service by type
  getFeeServiceByType(feeType: string): Service | undefined {
    return this.feeServices.find(service => service.fee_type === feeType);
  }
  
  // Calculate fees for selected services
  calculateFees(selectedServices: Service[]): Service[] {
    // Reset the applied fees map
    this.resetFees();
    
    // Get the required fee types with their counts (now with the new waiver logic)
    const requiredFeeTypesWithCount = this.getRequiredFeeTypes(selectedServices);
    
    // Add each required fee, potentially multiple times for admin fees
    requiredFeeTypesWithCount.forEach((count, feeType) => {
      const feeService = this.getFeeServiceByType(feeType);
      if (feeService) {
        // If it's an admin fee, we need to add it multiple times
        if (feeType.toLowerCase().includes('admin')) {
          // Store as an array of fees for this type
          this.appliedFees.set(feeType, Array(count).fill(feeService));
        } else {
          // For non-admin fees like venipuncture, just add once
          this.appliedFees.set(feeType, [feeService]);
        }
      }
    });
    
    // Flatten the array of fees for return
    const allFees: Service[] = [];
    this.appliedFees.forEach(feeServices => {
      allFees.push(...feeServices);
    });
    
    return allFees;
  }
  
  // Get the total fees amount
  getTotalFeesAmount(): number {
    let total = 0;
    this.appliedFees.forEach(feeServices => {
      feeServices.forEach(fee => {
        total += fee.price;
      });
    });
    return total;
  }
}

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [displayedServices, setDisplayedServices] = useState<Service[]>(servicesData as Service[]);
  const [appliedFees, setAppliedFees] = useState<Service[]>([]);
  const {toast} = useToast();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const patientNameInput = useRef<HTMLInputElement>(null);
  const patientDOBInput = useRef<HTMLInputElement>(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [isSearchingPatient, setIsSearchingPatient] = useState(false);
  const [patientDetails, setPatientDetails] = useState<{
    name: string;
    dob: string;
    found: boolean;
  } | null>(null);
  const paymentMethodSelect = useRef<HTMLSelectElement>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [serviceDate, setServiceDate] = useState('');

  // Stripe Payment Polling States
  const [isStripeProcessing, setIsStripeProcessing] = useState(false); // Use to show waiting modal
  const [stripePaymentId, setStripePaymentId] = useState<string | null>(null);
  const [stripePaymentStatus, setStripePaymentStatus] = useState<'pending' | 'success' | 'failed' | null>(null); // 'pending' while waiting for message, then 'success' or 'failed'
  const [stripeStatusMessage, setStripeStatusMessage] = useState<string | null>(null); // Optional: Store a more detailed message
  const [generatedPaymentLinkUrl, setGeneratedPaymentLinkUrl] = useState<string | null>(null);
  const [showLinkModal, setShowLinkModal] = useState(false); // To show modal with the generated link

  // Polling specific states
  const [pollingIntervalId, setPollingIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [currentStripePaymentLinkId, setCurrentStripePaymentLinkId] = useState<string | null>(null);


  // Initialize the FeeManager
  const feeManagerRef = useRef(new FeeManager(servicesData));

  // Function to validate MM/DD/YYYY format
const isValidMMDDYYYY = (dateString: string): boolean => {
  if (!dateString) return false;
  
  // Check format using regex for MM/DD/YYYY
  const regex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
  if (!regex.test(dateString)) return false;
  
  // Additional validation for valid date values
  const [month, day, year] = dateString.split('/').map(Number);
  const date = new Date(year, month - 1, day);
  
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

// Function to get today's date in MM/DD/YYYY format
const getTodayAsMMDDYYYY = (): string => {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const year = today.getFullYear();
  
  return `${month}/${day}/${year}`;
};
  
  // Helper function to format date to MM/DD/YYYY
  const formatDateToMMDDYYYY = (dateString: string): string | null => {
    if (!dateString) return null;
    console.log("Formatting date string to MM/DD/YYYY:", dateString);
    try {
      // Parse the YYYY-MM-DD date from the HTML input
      const [year, month, day] = dateString.split('-');
      
      // Validate parts
      if (!year || !month || !day) {
        console.error("Invalid date string format, expected YYYY-MM-DD:", dateString);
        return null;
      }
      
      // Format to MM/DD/YYYY
      const formattedDate = `${month}/${day}/${year}`;
      console.log("Formatted date:", formattedDate);
      return formattedDate;
    } catch (error) {
      console.error("Error formatting date to MM/DD/YYYY:", error);
      return null;
    }
  };
  

  // Format DOB to MM/DD/YYYY for API requests
const formatDOBToMMDDYYYY = (dateString: string): string | null => {
  if (!dateString) return null;
  console.log("Formatting DOB string to MM/DD/YYYY:", dateString);
  try {
    // Parse the YYYY-MM-DD date from the HTML input
    const [year, month, day] = dateString.split('-');
    
    // Validate parts
    if (!year || !month || !day) {
      console.error("Invalid DOB string format, expected YYYY-MM-DD:", dateString);
      return null;
    }
    
    // Format to MM/DD/YYYY
    const formattedDOB = `${month}/${day}/${year}`;
    console.log("Formatted DOB:", formattedDOB);
    return formattedDOB;
  } catch (error) {
    console.error("Error formatting DOB to MM/DD/YYYY:", error);
    return null;
  }
};



  // Load cart data from local storage on component mount
  useEffect(() => {
    console.log("Component mounted. Setting default service date and loading cart.");

    // Set default service date to today in MM/DD/YYYY format
    const today = new Date();
    const defaultDateMMDDYYYY = formatDateToMMDDYYYY(today.toISOString().split('T')[0]); // Get today's date in YYYY-MM-DD first, then format to MM/DD/YYYY
    setServiceDate(defaultDateMMDDYYYY || ''); // Set state, handle potential null from formatting


    const storedCart = localStorage.getItem('selfPayCart');
    if (storedCart) {
      const parsedCart = JSON.parse(storedCart);
      console.log("Loaded cart from local storage:", parsedCart);
      setSelectedServices(parsedCart);

      // Calculate fees for the loaded cart
      const fees = feeManagerRef.current.calculateFees(parsedCart);
      console.log("Calculated fees for loaded cart:", fees);
      setAppliedFees(fees);
    }
}, []); // Empty dependency array means this runs once on mount

  // Save cart data to local storage whenever selectedServices changes
useEffect(() => {
  console.log("selectedServices changed. Saving cart and recalculating fees.");
  localStorage.setItem('selfPayCart', JSON.stringify(selectedServices));

  // Recalculate fees whenever the cart changes
  const fees = feeManagerRef.current.calculateFees(selectedServices);
  console.log("Recalculated fees:", fees);
  setAppliedFees(fees);
}, [selectedServices]); // Dependency array includes selectedServices

// Update displayed services when search term changes (from your provided code)
useEffect(() => {
  console.log("Search term changed:", searchTerm);
  const filteredServices = smarterSearch(searchTerm, servicesData);
  setDisplayedServices(filteredServices);
}, [searchTerm]); // Removed servicesData from dependency array


// --- NEW POLLING LOGIC ---
// Function to stop polling
const stopPolling = () => {
    if (pollingIntervalId) {
        clearInterval(pollingIntervalId);
        setPollingIntervalId(null);
        console.log("Polling interval cleared.");
    }
    setIsStripeProcessing(false); // No longer actively polling for Stripe status
    setStripePaymentStatus(null); // Reset status when polling stops
    setStripeStatusMessage(null); // Clear message
    setCurrentStripePaymentLinkId(null); // Clear the payment link ID
};

// Function to poll backend for Stripe payment status
const pollStripePaymentStatus = async (paymentLinkId: string) => {
    const apiUrl = 'https://payment-api-235406711585.us-central1.run.app'; // Your backend API base URL for status check
    try {
        console.log(`Polling status for Payment Link ID: ${paymentLinkId}`);
        const response = await fetch(`${apiUrl}/get-payment-status`, { // You need to implement this backend endpoint
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentLinkId }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: `Server error: ${response.status}` }));
            console.error('Polling API error:', errorData);
            setStripeStatusMessage(`Polling error: ${errorData.message}`);
            // If there's a severe error with polling endpoint, you might want to stop polling
            // For now, let's keep polling unless explicitly stopped
            return;
        }

        const data = await response.json();
        console.log('Polling response:', data);

        // Backend response should include Stripe status AND ECW posting status
        const stripeStatus = data.stripeStatus; // e.g., 'succeeded', 'failed', 'canceled', 'pending'
        const ecwPostedStatus = data.ecwPosted; // boolean: true if ECW posted, false otherwise
        const paymentIntentIdFromPoll = data.paymentIntentId; // Get ID from poll if available

        if (stripeStatus === 'succeeded' && ecwPostedStatus === true) {
            console.log('Payment Succeeded and ECW Posted! Stopping polling and updating UI.');
            stopPolling();
            setStripePaymentStatus('success');
            setStripePaymentId(paymentIntentIdFromPoll || null);
            setStripeStatusMessage('Payment successful and posted to ECW!');
            toast({ title: 'Payment Complete', description: 'Stripe payment succeeded and recorded in ECW.' });

            // Clear the cart and reset form after successful transaction and ECW posting
            setSelectedServices([]);
            setAppliedFees([]);
            setAccountNumber('');
            setPatientDetails(null);
            if (patientNameInput.current) patientNameInput.current.value = '';
            if (patientDOBInput.current) patientDOBInput.current.value = '';
            setCheckoutOpen(false); // Close the main checkout modal after success
        } else if (stripeStatus === 'failed' || stripeStatus === 'canceled') {
            console.log(`Payment ${stripeStatus}. Stopping polling.`);
            stopPolling();
            setStripePaymentStatus('failed');
            setStripePaymentId(paymentIntentIdFromPoll || null);
            setStripeStatusMessage(`Payment ${stripeStatus === 'failed' ? 'failed' : 'canceled'}. Please try again.`);
            toast({ variant: 'destructive', title: 'Payment Not Completed', description: stripeStatusMessage });
            // Do NOT clear cart/form on failure, allowing re-attempt
            setCheckoutOpen(false); // Close main checkout modal after failure
        } else {
            // Still pending, continue polling
            setStripeStatusMessage('Payment still pending. Please wait...');
            setStripePaymentStatus('pending'); // Keep status pending in UI
            console.log('Payment still pending, continuing to poll.');
        }

    } catch (error) {
        console.error('Error during polling:', error);
        stopPolling();
        setStripePaymentStatus('failed');
        setStripeStatusMessage('An error occurred during polling. Please check console.');
        toast({ variant: 'destructive', title: 'Polling Error', description: 'An error occurred while checking payment status.' });
    }
};

// useEffect to handle polling lifecycle
useEffect(() => {
    // This runs on component mount or when dependencies change.
    // The actual polling `setInterval` will be set by `handleConfirmCheckout`.
    // This effect's main purpose is cleanup.
    return () => {
        // Cleanup interval if component unmounts while polling is active
        if (pollingIntervalId) {
            clearInterval(pollingIntervalId);
            console.log("Polling interval cleared on component unmount.");
        }
    };
}, [pollingIntervalId]); // Dependency to re-run cleanup if interval ID changes (e.g., new poll starts)

// --- END NEW POLLING LOGIC ---


const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const toggleService = (service: Service) => {
    // Don't add fee services directly - they're handled automatically
    if (service.is_fee === true) {
      toast({
        variant: 'destructive',
        title: 'Cannot add directly',
        description: 'Fees are automatically added based on selected services.',
      });
      return;
    }
    
    if (selectedServices.find(s => s.id === service.id)) {
      setSelectedServices(selectedServices.filter(s => s.id !== service.id));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const removeFromCart = (serviceId: number) => {
    setSelectedServices(
      selectedServices.filter(service => service.id !== serviceId)
    );
  };

  const calculateSubtotal = () => {
    return selectedServices.reduce(
      (total, service) => total + service.price,
      0
    );
  };
  
  const calculateFeesTotal = () => {
    return appliedFees.reduce(
      (total, fee) => total + fee.price,
      0
    );
  };
  
  const calculateTotal = () => {
    return calculateSubtotal() + calculateFeesTotal();
  };

  // Add this function to fetch patient details by account number
  const searchPatientByAccountNumber = async (accNumber: string) => {
    if (!accNumber.trim()) {
      toast({
        variant: 'destructive',
        title: 'Account Number Required',
        description: 'Please enter a valid account number to search for a patient.',
      });
      return;
    }
    
    setIsSearchingPatient(true);
    
    try {
      const apiUrl = 'https://payment-api-235406711585.us-central1.run.app';
      console.log(`Searching for patient with account number: ${accNumber}`);
      
      const response = await fetch(`${apiUrl}/get-patient-details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: accNumber.trim()
        }),
      });
      
      console.log(`Response status: ${response.status}`);
      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      if (!response.ok) {
        let errorMessage = `Server error (${response.status})`;
        
        try {
          const errorJson = JSON.parse(responseText);
          errorMessage = errorJson.message || errorMessage;
          console.error('Error details:', errorJson);
        } catch {
          errorMessage = `${errorMessage}: ${responseText.substring(0, 200)}`;
        }
        
        throw new Error(errorMessage);
      }
      
      const data = JSON.parse(responseText);
      console.log('Parsed response data:', data);
      
      if (data.status === 'success' && data.patient) {
        const { name, dob } = data.patient;
        console.log(`Found patient: ${name}, DOB: ${dob}`);
        
        setPatientDetails({
          name,
          dob,
          found: true
        });
        
        // Auto-fill patient name and DOB if refs are available
        if (patientNameInput.current) {
          patientNameInput.current.value = name;
        }
        if (patientDOBInput.current) {
          patientDOBInput.current.value = dob;
        }
        
        toast({
          title: 'Patient Found',
          description: `Found: ${name}`,
        });
      } else {
        console.log('No patient found in response');
        setPatientDetails({
          name: '',
          dob: '',
          found: false
        });
        
        toast({
          variant: 'destructive',
          title: 'Patient Not Found',
          description: data.message || 'No patient found with that account number',
        });
      }
    } catch (error) {
      console.error('Error fetching patient details:', error);
      setPatientDetails(null);
      
      toast({
        variant: 'destructive',
        title: 'Search Failed',
        description: error instanceof Error ? error.message : 'Failed to search for patient',
      });
    } finally {
      setIsSearchingPatient(false);
    }
  };

  // Payment API function types
  interface PaymentResult {
    success: boolean;
    message: string;
    processingTime?: string;
    requiresLogin?: boolean;
    elapsed_time?: string;
  }

//to initiate Stripe payment by getting a Payment Link URL
const initiateStripePaymentLink = async (
  totalAmount: number, // in dollars
  patientProfile: { name: string; dob: string; accountNumber: string; }, // Expects 'dob' as string
  serviceDt: string, // Expected MM/DD/YYYY from your form
  paymentDesc: string
): Promise<{ success: boolean; paymentLinkUrl?: string; paymentLinkId?: string; error?: string }> => {
  console.log("Frontend: Initiating Stripe Payment Link with metadata...");
  // Ensure this is your correct Cloud Run URL or local backend URL for testing
  const apiUrl = 'https://payment-api-235406711585.us-central1.run.app'; 

  try {
    const response = await fetch(`${apiUrl}/create-payment-link`, { // Ensure this matches your backend route
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: Math.round(totalAmount * 100),
        currency: 'usd', // Or make this dynamic if needed
        patient_name: patientProfile.name,
        patient_dob: patientProfile.dob, // Pass as MM/DD/YYYY
        patient_account_number: patientProfile.accountNumber,
        service_date: serviceDt, // Pass as MM/DD/YYYY
        payment_description: paymentDesc, // Description for the payment/product on Stripe
        // staff_id: "frontdesk_user_XYZ" // Optional: any other metadata
      }),
    });

    if (!response.ok) {
      // Try to parse a JSON error message from the backend if available
      const errorData = await response.json().catch(() => ({ message: `Server error: ${response.status}` }));
      console.error("Frontend: Error data from backend (/create-payment-link):", errorData);
      throw new Error(errorData.message || `Failed to create payment link (HTTP ${response.status})`);
    }

    const data = await response.json();
    if (data.status === 'success' && data.payment_link_url && data.payment_link_id) {
      return {
        success: true,
        paymentLinkUrl: data.payment_link_url,
        paymentLinkId: data.payment_link_id,
      };
    } else {
      // Handle cases where backend responds 200 OK but operation failed logically
      throw new Error(data.message || 'Backend did not return a valid payment link or ID.');
    }
  } catch (error) {
    console.error('Frontend: Error in initiateStripePaymentLink:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown frontend error creating payment link',
    };
  }
};


  // Updated postPaymentToECW function with better error handling and timeout control
  // Update the postPaymentToECW function to include service date:
  const postPaymentToECW = async (
    patientName: string,
    patientDOB: string, // Expects 'dob' as string
    amount: number,
    paymentMethod: string = 'Credit Card',
    serviceDateMMDDYYYY: string | null = null,
    accountNumber: string | null = null  // Add account number parameter
    ): Promise<PaymentResult> => {
    console.log("Attempting to post payment to ECW API with account number...");
    // Define the API URL for your deployed Cloud Run service
    const apiUrl = 'https://payment-api-235406711585.us-central1.run.app';
  
    // Set timeout for fetch to prevent UI from hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
        controller.abort();
        console.error('Payment API request timed out.');
        toast({
            variant: 'destructive',
            title: 'Request Timed Out',
            description: 'The payment API took too long to respond. The payment might still be processing.',
            duration: 8000,
        });
    }, 90000); // 90 seconds timeout
  
    toast({
      title: "Processing Payment",
      description: "Connecting to ECW and posting payment...",
      duration: 90000, // Longer duration as the process can take time
    });
  
    try {
      // Updated to send account number
      console.log("Making POST request to /post-payment endpoint with account number...");
      const response = await fetch(`${apiUrl}/post-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patient_name: patientName,
          patient_dob: patientDOB,
          acct_no: accountNumber, // Add account number to request
          payment_amount: amount,
          payment_method: paymentMethod,
          service_date: serviceDateMMDDYYYY
        }),
        signal: controller.signal // Attach the abort signal
      });
  
      // Rest of the function remains the same
      clearTimeout(timeoutId);
      console.log("Timeout cleared.");
  
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Server error (${response.status})`;
  
        try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || errorMessage;
        } catch {
            errorMessage = `${errorMessage}: ${errorText.substring(0, 200)}`;
        }
  
        console.error('API response not OK:', response.status, errorMessage);
        return {
          success: false,
          message: errorMessage,
          requiresLogin: false
        };
      }
  
      const data = await response.json();
      console.log('API response data:', data);
  
      if (data.status === 'success') {
        console.log('Payment posted successfully:', data.message);
        return {
          success: true,
          message: data.message,
          processingTime: data.processing_time
        };
      } else {
        console.error('Payment posting failed according to API:', data.message);
        return {
          success: false,
          message: data.message || 'Failed to post payment',
          processingTime: data.processing_time || data.elapsed_time,
          requiresLogin: false
        };
      }
  
    } catch (error: unknown) {
      console.error('Error in postPaymentToECW catch block:', error);
  
      if (error && typeof error === 'object' && 'name' in error && error.name === 'AbortError') {
        console.log('Fetch request aborted due to timeout (caught in catch block).');
        return {
          success: false,
          message: 'Request timed out. The payment might still be processing in the background.'
        };
      }
  
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        message: `Error connecting to payment API: ${errorMessage}`,
        requiresLogin: false
      };
    }
  };


  // Updated handleConfirmCheckout function
  const handleConfirmCheckout = async (action: 'redirectStripe' | 'generateLinkForPatient' | 'directECW') => {
    console.log(`Checkout action initiated: ${action}`);

    // --- Robust Validations ---
    if (!accountNumber.trim()) {
      toast({ variant: 'destructive', title: 'Account Number Required', description: 'Please enter patient MRN.' });
      return;
    }
    const patientName = patientNameInput.current?.value?.trim();
    if (!patientName) {
      toast({ variant: 'destructive', title: 'Patient Name Required' });
      return;
    }

    const patientDOBValue = patientDOBInput.current?.value?.trim();

    if (!patientDOBValue || !isValidMMDDYYYY(patientDOBValue)) {
      toast({ variant: 'destructive', title: 'Invalid DOB', description: 'Format must be MM/DD/YYYY.' });
      return;
    }

    if (!isValidMMDDYYYY(serviceDate)) {
      toast({ variant: 'destructive', title: 'Invalid Service Date', description: 'Format must be MM/DD/YYYY.' });
      return;
    }
    if (selectedServices.length === 0 && (action === 'redirectStripe' || action === 'generateLinkForPatient')) {
        toast({variant: 'destructive', title: 'No Services', description: 'Add services to cart for Stripe payment.'});
        return;
    }
    // --- End Validations ---

    const totalAmount = calculateTotal();
    const paymentMethodFromSelection = paymentMethodSelect.current?.value || 'Credit Card';

    const patientProfileForStripe = {
      name: patientName,
      dob: patientDOBValue,
      accountNumber: accountNumber
    };

    const servicesSummary = selectedServices.length > 0
        ? selectedServices.map(s => s.name).slice(0, 2).join(', ') + (selectedServices.length > 2 ? '...' : '')
        : 'Payment';
    const paymentDescriptionForStripe = `${servicesSummary} for ${patientName} (Acct: ${accountNumber})`;


    setIsProcessing(true); // Start general processing indicator
    setGeneratedPaymentLinkUrl(null); // Clear previous generated link

    if (action === 'redirectStripe' || action === 'generateLinkForPatient') {
      if (totalAmount <= 0 && action === 'redirectStripe') {
          toast({variant: 'destructive', title: 'Invalid Amount', description: 'Amount for Stripe payment must be > $0.'});
          setIsProcessing(false);
          return;
      }
      toast({
        title: action === 'redirectStripe' ? "Preparing Secure Payment..." : "Generating Payment Link...",
        description: "Please wait.",
      });

      // Call the backend to create the Stripe Payment Link
      const stripeResponse = await initiateStripePaymentLink(
          totalAmount,
          patientProfileForStripe,
          serviceDate,
          paymentDescriptionForStripe
      );

      if (stripeResponse.success && stripeResponse.paymentLinkUrl && stripeResponse.paymentLinkId) {
        if (action === 'redirectStripe') {
          toast({ title: "Opening Stripe...", description: "Complete payment in the new tab." });
          // Open Stripe in a new tab/window.
          window.open(stripeResponse.paymentLinkUrl, '_blank');

          // --- Start Polling for Stripe Status ---
          setCurrentStripePaymentLinkId(stripeResponse.paymentLinkId);
          setIsStripeProcessing(true); // Show the Stripe processing modal
          setStripePaymentStatus('pending'); // Set initial status to pending
          setStripeStatusMessage('Waiting for payment confirmation from Stripe...');

          // Clear any existing polling interval before starting a new one
          if (pollingIntervalId) {
              clearInterval(pollingIntervalId);
          }
          const intervalId = setInterval(async () => {
            if (currentStripePaymentLinkId) { // Ensure ID exists before polling
              await pollStripePaymentStatus(currentStripePaymentLinkId);
            }
          }, 5000); // Poll every 5 seconds (adjust as needed)
          setPollingIntervalId(intervalId);

          setCheckoutOpen(false); // Close the main checkout modal immediately
          // Do NOT clear cart/form or post to ECW here. Polling will handle that.

        } else if (action === 'generateLinkForPatient') {
          setGeneratedPaymentLinkUrl(stripeResponse.paymentLinkUrl);
          setShowLinkModal(true);
          toast({ title: "Stripe Link Generated", description: "Copy the link to send to the patient." });
        }
      } else {
        // Handle errors if generating the Stripe link fails
        toast({
          variant: 'destructive',
          title: 'Stripe Link Error',
          description: stripeResponse.error || "Could not create Stripe payment link."
        });
      }
    } else if (action === 'directECW') {
      // This logic is for direct posting to ECW (e.g., for Cash/Check payments)
      toast({ title: "Processing Direct ECW...", description: `Using method: ${paymentMethodFromSelection}` });
      const ecwResult = await postPaymentToECW(
          patientName,
          patientDOBValue,
          totalAmount,
          paymentMethodFromSelection,
          serviceDate,
          accountNumber
      );
      if (ecwResult.success) {
        toast({ title: 'ECW Payment Posted', description: ecwResult.message || 'Successfully recorded.' });
        setCheckoutOpen(false);
        // Clear form and cart ONLY after successful direct ECW post
        setSelectedServices([]);
        setAppliedFees([]);
        setAccountNumber('');
        setPatientDetails(null);
        if(patientNameInput.current) patientNameInput.current.value = '';
        if(patientDOBInput.current) patientDOBInput.current.value = '';
      } else {
        toast({ variant: 'destructive', title: 'ECW Posting Failed', description: ecwResult.message });
      }
    }

    // Stop the general processing indicator unless we are redirecting to Stripe,
    // in which case the user is leaving this page flow.
    if(action !== 'redirectStripe') {
       setIsProcessing(false);
    }
  };

  const handleCancelCheckout = () => {
    setCheckoutOpen(false);
  };

  const isServiceInCart = (serviceId: number) => {
    return selectedServices.some(service => service.id === serviceId);
  };
  
  const clearSearch = () => {
    setSearchTerm('');
    setDisplayedServices(servicesData);
  };

  return (
    <div className="container mx-auto p-4 w-full max-w-full bg-gradient-to-b from-blue-50 to-white min-h-screen">
      {/* Centered Title */}
      <h1 className="text-3xl font-bold text-center mb-6 text-blue-800">{SELF_PAY_TITLE}</h1>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Service Search and Display */}
        <div className="flex-1">
         <div className="mb-4 flex gap-2 relative">
  <div className="relative w-full">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
    <Input
      type="text"
      placeholder="Search by name, category, or lab code (e.g., 7750)..."
      onChange={handleSearch}
      value={searchTerm}
      className="w-full pl-10 shadow-sm border-slate-200 focus-visible:ring-blue-400"
    />
    {searchTerm && (
      <button
        onClick={clearSearch}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        <X size={16} />
      </button>
    )}
  </div>
</div>

          <Card className="w-full shadow-md border-none">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-3">
              <CardTitle className="text-blue-800">Services</CardTitle>
              <CardDescription>
                {displayedServices.length === servicesData.length
                  ? "Browse our services."
                  : `${displayedServices.length} services found for "${searchTerm}"`}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[60vh] rounded-b-lg">
                {displayedServices.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {displayedServices.map(service => (
                     <div
                     key={service.id}
                     className="p-4 hover:bg-blue-50 transition-colors duration-150 relative group"
                   >
                     <div className="flex items-center justify-between">
                       <div className="flex-1">
                         <span className="font-medium text-gray-800">{service.name}</span>

                         {/* Description - show for all services, but for blood work tests apply hover effect */}
                         {service.description && (
                           <p className="text-sm text-gray-600 mt-1.5 mb-2 leading-relaxed max-w-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                             {service.description}
                           </p>
                         )}

                         {/* Category badge and lab code badge container */}
                         <div className="mt-1 flex items-center space-x-2 flex-wrap gap-1">
                           <span className="text-xs font-medium text-blue-500 bg-blue-50 px-2 py-1 rounded-full">
                             {service.category}
                           </span>

                           {/* Lab code badge - only visible on hover for blood work/lab tests */}
                           {service.lab_code && (
                             <span className={`text-xs font-medium text-purple-700 bg-purple-50 px-2 py-1 rounded-full ${
                               service.category?.toLowerCase() === 'blood work' || service.category?.toLowerCase() === 'laboratory'
                                 ? 'opacity-0 group-hover:opacity-100 transition-opacity duration-200'
                                 : ''
                             }`}>
                               Code: {Array.isArray(service.lab_code)
                                 ? service.lab_code.join(', ')
                                 : service.lab_code}
                             </span>
                           )}

                           {/* Fees badge - only visible on hover */}
                           {service.requires_fees && service.requires_fees.length > 0 && (
                             <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-wrap gap-1">
                               {service.requires_fees.map((feeType, idx) => (
                                 <span key={idx} className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded-full flex items-center">
                                   <PlusCircle size={12} className="mr-1" />
                                   +{feeType} fee
                                 </span>
                               ))}
                             </div>
                           )}
                         </div>
                       </div>

                       {/* Price and Add button container - positioned at the right side */}
                       <div className="flex items-center space-x-3 ml-4">
                         <span className="font-bold text-green-600 text-lg">${service.price}</span>
                         {!isServiceInCart(service.id) && !service.is_fee && (
                           <Button
                             onClick={() => toggleService(service)}
                             size="sm"
                             className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
                           >
                             Add
                           </Button>
                         )}
                       </div>
                     </div>
                   </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No services found for &quot;{searchTerm}&quot;</p>
                    <Button onClick={clearSearch} variant="link" className="mt-2 text-blue-600">
                      Show all services
                    </Button>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Service Cart */}
        <div className="w-full md:w-1/3">
          <Card className="w-full shadow-md border-none">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 pb-3">
              <div className="flex items-center">
                <ShoppingCart size={20} className="mr-2 text-blue-800" />
                <CardTitle className="text-blue-800">Cart</CardTitle>
              </div>
              <CardDescription>Selected services and total price</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <ScrollArea className="h-[50vh] rounded-md mb-4">
                <div className="space-y-2">
                  {selectedServices.length > 0 ? (
                    <>
                      {/* Regular services */}
                      {selectedServices.map(service => (
                        <div
                          key={service.id}
                          className="p-3 border border-gray-100 rounded-md hover:bg-blue-50 transition-colors duration-150"
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-gray-800">{service.name}</div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-green-600">${service.price}</span>
                              <Button
                                onClick={() => removeFromCart(service.id)}
                                size="sm"
                                variant="destructive"
                                className="h-8 w-8 p-0 rounded-full"
                              >
                                <X size={14} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {/* Applied fees */}
{appliedFees.length > 0 && (
  <>
    <Separator className="my-3" />
    <div className="p-3 bg-amber-50 rounded-md">
      <p className="text-sm font-medium text-amber-800 mb-2">Applied Fees:</p>
      {/* Group fees by name for display purposes with proper typing */}
      {Object.entries(
        appliedFees.reduce<Record<string, { fee: Service; count: number }>>((acc, fee) => {
          if (!acc[fee.name]) {
            acc[fee.name] = { fee, count: 1 };
          } else {
            acc[fee.name].count += 1;
          }
          return acc;
        }, {})
      ).map(([name, groupedFee]) => (
        <div key={`${groupedFee.fee.id}-${groupedFee.count}`} className="flex justify-between items-center py-1">
          <span className="text-sm text-amber-900">
            {name} {groupedFee.count > 1 ? `(x${groupedFee.count})` : ''}
          </span>
          <span className="text-sm font-semibold text-amber-800">
            +${groupedFee.fee.price * groupedFee.count}
          </span>
        </div>
      ))}
    </div>
  </>
)}
                    </>
                  ) : (
                    <div className="text-center text-gray-500 py-12 px-4">
                      <ShoppingCart size={32} className="mx-auto mb-2 text-gray-300" />
                      <p>No services added to cart yet.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className="mt-4 pt-4 border-t border-gray-100">
                {selectedServices.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>${calculateSubtotal()}</span>
                    </div>
                    {appliedFees.length > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Fees:</span>
                        <span>${calculateFeesTotal()}</span>
                      </div>
                    )}
                  </div>
                )}
                <div className="text-xl font-bold text-right mb-4 text-green-700">
                  Total: ${calculateTotal()}
                </div>
                <AlertDialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
                  <AlertDialogTrigger asChild>
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700 text-white shadow-md"
                      size="lg"
                      disabled={selectedServices.length === 0}
                    >
                      Complete Checkout
                    </Button>
                  </AlertDialogTrigger>
                  {/* Modified AlertDialogContent className for wider modal */}
                  <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-auto"> {/* Increased width to max-w-2xl */}
  <AlertDialogHeader>
    <AlertDialogTitle className="text-blue-800">Checkout Confirmation</AlertDialogTitle>
    <AlertDialogDescription>
      Please search for a patient by account number and confirm services for checkout.
    </AlertDialogDescription>
  </AlertDialogHeader>
  <div className="py-4">
    {/* Account Number lookup section */}
    <div className="mb-4">
      <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-1">
        Account Number (MRN)
      </label>
      <div className="flex">
        <Input
          id="accountNumber"
          type="text"
          placeholder="Enter patient account number"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          className="w-full"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              searchPatientByAccountNumber(accountNumber);
            }
          }}
          required
        />
        <Button
          onClick={() => searchPatientByAccountNumber(accountNumber)}
          className="ml-2 bg-blue-600 hover:bg-blue-700"
          disabled={isSearchingPatient}
        >
          {isSearchingPatient ? (
            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Search size={16} />
          )}
        </Button>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        Enter the patient's account number as it appears in ECW
      </p>
    </div>

    {/* Patient Details Box */}
    {patientDetails !== null && (
      <div className={`mb-4 p-3 rounded-md ${patientDetails.found ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
        <h3 className={`text-sm font-medium ${patientDetails.found ? 'text-green-800' : 'text-red-800'}`}>
          {patientDetails.found ? 'Patient Found' : 'Patient Not Found'}
        </h3>
        {patientDetails.found && (
          <div className="mt-1">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Name:</span> {patientDetails.name}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">DOB:</span> {patientDetails.dob}
            </p>
          </div>
        )}
      </div>
    )}

    {/* Keep the rest of the fields, but hide them if needed or make them readonly */}
    <div className="mb-4">
      <label htmlFor="patientName" className="block text-sm font-medium text-gray-700 mb-1">
        Patient Name
      </label>
      <Input
        id="patientName"
        type="text"
        placeholder="Patient name will appear here"
        ref={patientNameInput}
        className="w-full bg-gray-50"
        readOnly={!!patientDetails?.found}
        required
      />
    </div>

    <div className="mb-4">
      <label htmlFor="patientDOB" className="block text-sm font-medium text-gray-700 mb-1">
        Date of Birth
      </label>
      <Input
        id="patientDOB"
        type="text"
        placeholder="MM/DD/YYYY"
        ref={patientDOBInput}
        className="w-full bg-gray-50"
        pattern="\d{2}/\d{2}/\d{4}"
        readOnly={!!patientDetails?.found}
        required
      />
    </div>

    {/* Payment Method Selection - unchanged */}
    <div className="mb-4">
      <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
        Payment Method
      </label>
      <select
        id="paymentMethod"
        ref={paymentMethodSelect}
        className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        defaultValue="Credit Card"
      >
        <option value="Credit Card">Credit Card</option>
        <option value="Credit Card (VISA)">Credit Card (VISA)</option>
        <option value="Credit Card (MASTER)">Credit Card (MASTER)</option>
        <option value="Credit Card (AMEX)">Credit Card (AMEX)</option>
        <option value="Credit Card (DISCOVER)">Credit Card (DISCOVER)</option>
        <option value="Cash">Cash</option>
        <option value="Check">Check</option>
        <option value="ACH (eCheck)">ACH (eCheck)</option>
      </select>
    </div>

    {/* Service Date Selection */}
    <div className="mb-4">
      <label htmlFor="serviceDate" className="block text-sm font-medium text-gray-700 mb-1">
        Date of Service
      </label>
      <Input
        id="serviceDate"
        type="text"
        placeholder="MM/DD/YYYY"
        value={serviceDate}
        onChange={(e) => setServiceDate(e.target.value)}
        pattern="\d{2}/\d{2}/\d{4}"
        className="w-full"
        required
      />
      <p className="text-xs text-gray-500 mt-1">
        Payment will be applied to this visit date (MM/DD/YYYY)
      </p>
    </div>

    {/* The cart items section remains unchanged */}
    <ScrollArea className="h-[20vh]">
      {/* ... cart items listing ... */}
      <div className="space-y-2">
                          {selectedServices.length > 0 ? (
                            <>
                              {/* Regular services in checkout modal */}
                              {selectedServices.map(service => (
                                <div
                                  key={service.id}
                                  className="flex items-center justify-between p-2 border border-gray-100 rounded-md"
                                >
                                  <div>
                                    <span className="font-medium">{service.name}</span>
                                  </div>
                                  <div>
                                    <span className="font-bold text-green-600">${service.price}</span>
                                  </div>
                                </div>
                              ))}

                              {/* Applied fees in checkout modal */}
                              {appliedFees.length > 0 && (
                                <>
                                  <Separator className="my-2" />
                                  <div className="p-2 bg-amber-50 rounded-md">
                                    <p className="text-sm font-medium text-amber-800 mb-2">Applied Fees:</p>
                                    {appliedFees.map(fee => (
                                      <div key={fee.id} className="flex justify-between items-center py-1">
                                        <span className="text-sm">{fee.name}</span>
                                        <span className="text-sm font-semibold text-amber-700">+${fee.price}</span>
                                      </div>
                                    ))}
                                  </div>
                                </>
                              )}
                            </>
                          ) : (
                            <div className="text-center text-gray-500 py-4">
                              No services added to cart.
                            </div>
                          )}
                        </div>
    </ScrollArea>

    <Separator className="my-4" />
    <div className="space-y-2">
      {/* ... pricing info ... */}
      <div className="flex justify-between text-sm">
                          <span>Subtotal:</span>
                          <span>${calculateSubtotal()}</span>
                        </div>
                        {appliedFees.length > 0 && (
                          <div className="flex justify-between text-sm">
                            <span>Fees:</span>
                            <span>${calculateFeesTotal()}</span>
                          </div>
                        )}
                        <div className="text-xl font-bold text-right text-green-700">
                          Total: ${calculateTotal()}
                        </div>
    </div>
  </div>
  <AlertDialogFooter>
  <AlertDialogCancel onClick={handleCancelCheckout} disabled={isProcessing}>
    Cancel
  </AlertDialogCancel>

  {/* Button for staff to redirect to Stripe for immediate payment */}
  <div className="flex flex-col sm:flex-row gap-2 w-full justify-end"> {/* Use a flex container for buttons */}
  <Button
    onClick={() => handleConfirmCheckout('redirectStripe')}
    className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
    disabled={isProcessing || !patientDetails?.found || selectedServices.length === 0}
  >
    {isProcessing ? 'Processing...' : 'Pay Now via Stripe (Redirect)'}
  </Button>

  {/* Button for staff to generate a link to send to the patient */}
  <Button
    onClick={() => handleConfirmCheckout('generateLinkForPatient')}
    className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
    disabled={isProcessing || !patientDetails?.found || selectedServices.length === 0}
  >
    {isProcessing ? 'Generating...' : 'Generate Stripe Link for Patient'}
  </Button>
  </div>

  {/* Keep this if you still have a direct non-Stripe path (e.g., for Cash/Check) */}
  {/* <Button
    onClick={() => handleConfirmCheckout('directECW')}
    className="bg-slate-600 hover:bg-slate-700 text-white"
    disabled={isProcessing || !patientDetails?.found}
  >
    {isProcessing ? 'Processing...' : `Post as ${paymentMethodSelect.current?.value || 'Other'}`}
  </Button> */}
</AlertDialogFooter>
</AlertDialogContent>
                </AlertDialog>
                {/* Add this Stripe payment processing modal */}
<AlertDialog
  open={isStripeProcessing || stripePaymentStatus !== null} // This controls when the modal is visible
  onOpenChange={(open) => {
    if (!open) {
      // Only allow closing if not actively polling
      if (!isStripeProcessing) {
        setStripePaymentStatus(null); // Allow closing the modal
        setStripePaymentId(null); // Clear ID on close
        setStripeStatusMessage(null); // Clear message on close
      }
    }
  }}
>
  <AlertDialogContent className="max-w-md">
    <AlertDialogHeader>
      <AlertDialogTitle className={
        isStripeProcessing ? "text-blue-800" :
        stripePaymentStatus === 'success' ? "text-green-700" :
        "text-red-700"
      }>
        {isStripeProcessing ? "Processing Payment" :
         stripePaymentStatus === 'success' ? "Payment Successful" :
         "Payment Failed"}
      </AlertDialogTitle>
    </AlertDialogHeader>
    <div className="py-6 text-center">
      {isStripeProcessing && (
        <>
          <div className="mx-auto h-12 w-12 mb-4 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-700">{stripeStatusMessage || 'Waiting for payment confirmation...'}</p>
          <p className="text-sm text-gray-500 mt-2">Please keep the payment tab open.</p>
        </>
      )}

      {stripePaymentStatus === 'success' && (
        <>
          <div className="mx-auto h-12 w-12 mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-gray-700">{stripeStatusMessage || 'Your payment was successful!'}</p>
           {/* Only show payment ID if available */}
          {stripePaymentId && <p className="text-sm text-gray-500 mt-2">Payment ID: {stripePaymentId?.slice(-8)}</p>}
        </>
      )}

      {stripePaymentStatus === 'failed' && (
        <>
          <div className="mx-auto h-12 w-12 mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-gray-700">{stripeStatusMessage || 'Your payment could not be processed.'}</p>
          <p className="text-sm text-gray-500 mt-2">Please try again.</p>
        </>
      )}
    </div>
    <AlertDialogFooter>
      {/* Close button appears when not polling */}
      {!isStripeProcessing && (
        <AlertDialogAction
          onClick={() => {
            setStripePaymentStatus(null); // Close the modal
            setStripePaymentId(null); // Clear ID on close
            setStripeStatusMessage(null); // Clear message
            stopPolling(); // Ensure polling is stopped if user closes manually
          }}
           className={
              stripePaymentStatus === 'success' ? "bg-green-600 hover:bg-green-700" :
              "bg-blue-600 hover:bg-blue-700"
            }
        >
          {stripePaymentStatus === 'success' ? "Close" : "Close"} {/* Changed "Try Again" to "Close" */}
        </AlertDialogAction>
      )}
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>

{/* Payment Link Modal - Add this here as a sibling to other AlertDialog components */}
{showLinkModal && generatedPaymentLinkUrl && (
  <AlertDialog open={showLinkModal} onOpenChange={setShowLinkModal}>
    <AlertDialogContent className="max-w-lg">
      <AlertDialogHeader>
        <AlertDialogTitle>Shareable Stripe Payment Link</AlertDialogTitle>
        <AlertDialogDescription>
          The following link can be sent to the patient for payment.
          After successful payment, the transaction will be automatically posted to ECW via our backend.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <div className="my-6">
        <Input
          type="text"
          value={generatedPaymentLinkUrl}
          readOnly
          className="w-full p-3 border rounded-md text-sm bg-gray-50"
        />
        <Button
          onClick={() => {
            navigator.clipboard.writeText(generatedPaymentLinkUrl);
            toast({ title: "Link Copied!", description: "Payment link copied to clipboard." });
          }}
          className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5"
        >
          Copy Link to Clipboard
        </Button>
      </div>
      <AlertDialogFooter>
        <AlertDialogAction
          onClick={() => {
            setShowLinkModal(false); // Close this modal
            setCheckoutOpen(false); // Also close the main checkout modal
            // Reset form and cart as the current "checkout" for this patient is complete from staff's POV
            setSelectedServices([]);
            setAppliedFees([]);
            setAccountNumber('');
            setPatientDetails(null);
            if(patientNameInput.current) patientNameInput.current.value = '';
            if(patientDOBInput.current) patientDOBInput.current.value = '';
            // Clear other relevant form fields
          }}
          className="bg-gray-600 hover:bg-gray-700" // Differentiate "Close" from primary actions
        >
          Close & Clear Checkout Form
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}