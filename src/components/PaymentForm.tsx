import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Lock, Wallet, Building, AlertCircle, CheckCircle, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { PaystackButton } from 'react-paystack'; // Import PaystackButton

// Define a simple FormError type if not already in formUtils
interface FormError {
  field: string;
  message: string;
}

interface PaymentFormProps {
  onPaymentSuccess: () => void;
  onBack: () => void;
}

// Expanded currency conversion rates and country-currency mapping for various African countries.
// IMPORTANT: These rates are illustrative and should be replaced with real-time, accurate rates
// from a reliable financial API in a production environment.
// Also, your Paystack merchant account MUST be configured to accept payments in these currencies.
// If a currency is not enabled on your Paystack account, transactions will fail with a "Currency not supported by merchant" error.
const countryCurrencyMap: { [key: string]: { currency: string; rate: number; symbol: string } } = {
  'Ghana': { currency: 'GHS', rate: 10, symbol: '₵' }, // Example: 1 USD = 10 GHS
  'Nigeria': { currency: 'NGN', rate: 1500, symbol: '₦' }, // Example: 1 USD = 1500 NGN
  'Kenya': { currency: 'KES', rate: 130, symbol: 'KSh' },  // Example: 1 USD = 130 KES
  'South Africa': { currency: 'ZAR', rate: 18, symbol: 'R' }, // Example: 1 USD = 18 ZAR
  'Egypt': { currency: 'EGP', rate: 47, symbol: 'E£' }, // Example: 1 USD = 47 EGP
  'Morocco': { currency: 'MAD', rate: 10, symbol: 'DH' }, // Example: 1 USD = 10 MAD
  'Algeria': { currency: 'DZD', rate: 135, symbol: 'DA' }, // Example: 1 USD = 135 DZD
  'Ethiopia': { currency: 'ETB', rate: 57, symbol: 'Br' }, // Example: 1 USD = 57 ETB
  'Tanzania': { currency: 'TZS', rate: 2500, symbol: 'TSh' }, // Example: 1 USD = 2500 TZS
  'Uganda': { currency: 'UGX', rate: 3800, symbol: 'USh' }, // Example: 1 USD = 3800 UGX
  'Rwanda': { currency: 'RWF', rate: 1250, symbol: 'RF' }, // Example: 1 USD = 1250 RWF
  'Cameroon': { currency: 'XAF', rate: 600, symbol: 'FCFA' }, // Example: 1 USD = 600 XAF (Central African CFA franc)
  'Senegal': { currency: 'XOF', rate: 600, symbol: 'FCFA' }, // Example: 1 USD = 600 XOF (West African CFA franc)
  'Ivory Coast': { currency: 'XOF', rate: 600, symbol: 'FCFA' }, // Example: 1 USD = 600 XOF
  'Zambia': { currency: 'ZMW', rate: 25, symbol: 'ZK' }, // Example: 1 USD = 25 ZMW
  'Botswana': { currency: 'BWP', rate: 13, symbol: 'P' }, // Example: 1 USD = 13 BWP
  'Mauritius': { currency: 'MUR', rate: 46, symbol: 'Rs' }, // Example: 1 USD = 46 MUR
};

const PaymentForm: React.FC<PaymentFormProps> = ({ onPaymentSuccess, onBack }) => {
  const [emailAddress, setEmailAddress] = useState(''); // Email for Paystack transaction
  const [amountUSD, setAmountUSD] = useState<string>('250'); // Base amount in USD
  const [selectedCountry, setSelectedCountry] = useState('Ghana'); // Default to Ghana

  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<FormError[]>([]);
  const [focused, setFocused] = useState<string | null>(null);

  // Ensure selectedCountry is always a valid key in countryCurrencyMap
  // This handles cases where the default might not be in the map if it's changed.
  useEffect(() => {
    if (!countryCurrencyMap[selectedCountry]) {
      // Fallback to the first country in the map if the selected one is invalid
      setSelectedCountry(Object.keys(countryCurrencyMap)[0] || 'Ghana'); 
    }
  }, [selectedCountry]);

  // Get the current currency and rate based on selected country
  const currentCountryData = countryCurrencyMap[selectedCountry];
  const localCurrency = currentCountryData ? currentCountryData.currency : 'GHS'; // Fallback
  const usdToLocalRate = currentCountryData ? currentCountryData.rate : 10; // Fallback
  const localCurrencySymbol = currentCountryData ? currentCountryData.symbol : '₵'; // Fallback

  // Calculate the amount in local currency (Paystack expects smallest unit, e.g., pesewas for GHS)
  const amountInLocalCurrency = parseFloat(amountUSD || '0') * usdToLocalRate;
  const paystackAmount = Math.round(amountInLocalCurrency * 100); // Convert to kobo/pesewas (integer)

  // IMPORTANT: Get your actual Paystack Public Key from your Paystack Dashboard -> Settings -> API Keys & Webhooks.
  // It should start with 'pk_test_' or 'pk_live_'.
  const PAYSTACK_PUBLIC_KEY = 'pk_test_c3b1cb7ae067c2063006705db8c4133d5604e5c9'; // Your actual public key

  // Helper function to get error message for a field
  const getErrorMessage = (field: string): string | undefined => {
    return errors.find(error => error.field === field)?.message;
  };

  // Helper function to check if a field has an error
  const hasError = (field: string): boolean => {
    return errors.some(error => error.field === field);
  };

  const handleAmountUSDChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numbers and decimal point
    const value = e.target.value.replace(/[^\d.]/g, '');
    
    // Validate format (optional decimal with max 2 decimal places)
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setAmountUSD(value);
    }
  };

  // Paystack configuration object
  const paystackConfig = {
    reference: (new Date()).getTime().toString(), // Unique reference for the transaction
    email: emailAddress, // Use the email from the form
    amount: paystackAmount, // Amount in kobo/pesewas
    publicKey: PAYSTACK_PUBLIC_KEY,
    currency: localCurrency, // Dynamically set based on selected country
    metadata: {
      custom_fields: [
        {
          display_name: "Application Type",
          variable_name: "app_type",
          value: "National Director Application", 
        },
        {
          display_name: "Original Amount (USD)",
          variable_name: "original_amount_usd",
          value: amountUSD,
        },
        {
          display_name: "Selected Country",
          variable_name: "selected_country",
          value: selectedCountry,
        },
        {
          display_name: "Processed Currency",
          variable_name: "processed_currency",
          value: localCurrency,
        },
      ],
    },
  };

  // Log the Paystack config right before it's used to help debugging
  useEffect(() => {
    console.log("Paystack Configuration:", paystackConfig);
  }, [paystackConfig]);


  // Callback function for successful Paystack payment
  const handlePaystackSuccess = (response: any) => {
    console.log('Paystack Success Response:', response);
    setIsProcessing(false);
    toast.success("Payment successful! Verifying transaction...");

    // In a real application, you would send `response.reference` to your backend
    // for server-side verification using Paystack's /transaction/verify endpoint.
    // This is CRUCIAL for security and to confirm the payment's legitimacy.
    // For this example, we're simulating verification with a timeout.
    setTimeout(() => {
        toast.success("Transaction verified! Your application is complete.");
        onPaymentSuccess(); // Move to the success screen in Index.jsx
    }, 1500); // Simulate network delay for verification
  };

  // Callback function for when the Paystack modal is closed by the user
  const handlePaystackClose = () => {
    setIsProcessing(false);
    toast.info("Payment cancelled or closed.");
    console.log('Paystack Closed');
  };

  // This `handleSubmit` will now primarily validate local fields
  // before allowing the PaystackButton to be clicked.
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors([]); // Clear previous errors

    const currentErrors: FormError[] = [];
    const numAmount = parseFloat(amountUSD);

    if (!amountUSD.trim()) {
      currentErrors.push({ field: 'amountUSD', message: 'Payment amount is required.' });
    } else if (isNaN(numAmount) || numAmount <= 0) {
      currentErrors.push({ field: 'amountUSD', message: 'Please enter a valid amount greater than 0.' });
    }

    if (!emailAddress.trim()) {
      currentErrors.push({ field: 'emailAddress', message: 'Email address is required for payment.' });
    } else if (!/\S+@\S+\.\S+/.test(emailAddress)) { // Basic email regex
      currentErrors.push({ field: 'emailAddress', message: 'Please enter a valid email format.' });
    }

    setErrors(currentErrors);

    if (currentErrors.length === 0) {
      toast.info("Proceeding to payment gateway...");
    } else {
      toast.error("Please fix the errors before proceeding.");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in animate-slide-up">
      <div className="flex flex-col items-center justify-center mb-8 space-y-3">
        <div className="relative">
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
            <Crown size={24} className="text-bloom-gold animate-float" />
          </div>
          <h1 className="text-3xl font-light text-bloom-primary">
            Miss Bloom <span className="font-medium">Global</span>
          </h1>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-0.5 bg-gradient-to-r from-bloom-gold/30 via-bloom-gold to-bloom-gold/30"></div>
        </div>
        <p className="text-sm text-bloom-muted max-w-xs text-center">
          Complete your payment to finalize your application
        </p>
      </div>
      
      <Card className="w-full shadow-lg border-0 neo-shadow overflow-hidden transform transition-all hover:shadow-xl hover-lift">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-bloom-gold/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-bloom-gold/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <CardHeader className="space-y-1 pb-4 relative z-10">
          <div className="absolute top-0 right-0 h-1 w-full bg-gradient-to-r from-bloom-gold/30 via-bloom-gold to-bloom-gold/30"></div>
          <CardTitle className="text-xl text-center font-medium">Application Payment</CardTitle>
          <CardDescription className="text-center">
            Complete your payment to submit your application
          </CardDescription>
        </CardHeader>
        
        <Separator />
        
        <form onSubmit={handleSubmit}> {/* This form's submit now triggers local validation */}
          <CardContent className="space-y-6 pt-6 relative z-10">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-1 text-sm text-bloom-muted">
                <Lock size={14} className="text-bloom-gold" />
                <span>Secure Payment</span>
              </div>
              <div className="flex items-center gap-2">
                {/* Payment method icons */}
                <div className="w-8 h-5 bg-[#1434CB] rounded-sm transform transition-transform hover:scale-105"></div> {/* Visa/Mastercard blue */}
                <div className="w-8 h-5 bg-gradient-to-r from-[#FF5F00] via-[#FF5F00] to-[#FF5F00] rounded-sm transform transition-transform hover:scale-105"></div> {/* Mastercard orange */}
                <div className="w-8 h-5 bg-[#000000] rounded-sm transform transition-transform hover:scale-105"></div> {/* Placeholder for other cards */}
                <div className="w-8 h-5 bg-[#253B80] rounded-sm transform transition-transform hover:scale-105"></div> {/* Placeholder for other cards */}
              </div>
            </div>

            <div className="space-y-2 group">
              <div className="flex items-center justify-between">
                <Label htmlFor="paymentEmail" className={`text-sm font-medium group-hover:text-bloom-gold transition-colors duration-200 ${hasError('emailAddress') ? 'text-destructive' : ''}`}>
                  Email Address for Payment*
                </Label>
              </div>
              <div className="relative overflow-hidden rounded-md">
                <Input 
                  id="paymentEmail" 
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  onFocus={() => setFocused('emailAddress')}
                  onBlur={() => setFocused(null)}
                  className={`transition-all duration-300 ${
                    focused === 'emailAddress' 
                      ? 'border-bloom-gold ring-1 ring-bloom-gold/20 shadow-[0_0_0_4px_rgba(220,174,103,0.1)]' 
                      : ''
                  } ${
                    hasError('emailAddress') 
                      ? 'border-destructive' 
                      : 'group-hover:border-bloom-gold/50'
                  }`}
                  placeholder="your@example.com"
                  required
                />
                <div className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full bg-bloom-gold transition-all duration-700 opacity-70"></div>
              </div>
              {getErrorMessage('emailAddress') && (
                <p className="text-xs text-destructive flex items-center gap-1 animate-fade-in">
                  <AlertCircle size={12} />
                  {getErrorMessage('emailAddress')}
                </p>
              )}
            </div>

            <div className="space-y-2 group">
              <div className="flex items-center justify-between">
                <Label htmlFor="amountUSD" className={`text-sm font-medium group-hover:text-bloom-gold transition-colors duration-200 ${hasError('amountUSD') ? 'text-destructive' : ''}`}>
                  Payment Amount (USD)*
                </Label>
                <span className="text-xs text-bloom-muted">Base amount in USD</span>
              </div>
              <div className="relative overflow-hidden rounded-md group">
                <Input 
                  id="amountUSD" 
                  value={amountUSD}
                  onChange={handleAmountUSDChange}
                  onFocus={() => setFocused('amountUSD')}
                  onBlur={() => setFocused(null)}
                  className={`pl-8 transition-all duration-300 ${
                    focused === 'amountUSD' 
                      ? 'border-bloom-gold ring-1 ring-bloom-gold/20 shadow-[0_0_0_4px_rgba(220,174,103,0.1)]' 
                      : ''
                  } ${
                    hasError('amountUSD') 
                      ? 'border-destructive' 
                      : 'group-hover:border-bloom-gold/50'
                  }`}
                  placeholder="Enter payment amount in USD"
                  type="number" 
                  step="0.01"
                  min="0.01"
                  required
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-bloom-muted group-hover:text-bloom-gold transition-colors duration-200">
                  $
                </div>
                <div className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full bg-bloom-gold transition-all duration-700 opacity-70"></div>
              </div>
              {getErrorMessage('amountUSD') && (
                <p className="text-xs text-destructive flex items-center gap-1 animate-fade-in">
                  <AlertCircle size={12} />
                  {getErrorMessage('amountUSD')}
                </p>
              )}
              <p className="text-xs text-bloom-muted mt-1">
                Application fee for National Director position
              </p>
            </div>

            {/* Country Selection */}
            <div className="space-y-2 group">
              <Label htmlFor="countrySelect" className="text-sm font-medium group-hover:text-bloom-gold transition-colors duration-200">
                Select Your Country for Payment
              </Label>
              <div className="relative overflow-hidden rounded-md">
                <select
                  id="countrySelect"
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  onFocus={() => setFocused('countrySelect')}
                  onBlur={() => setFocused(null)}
                  className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-bloom-gold focus:border-bloom-gold transition-all duration-300 ${
                    focused === 'countrySelect' 
                      ? 'border-bloom-gold ring-1 ring-bloom-gold/20 shadow-[0_0_0_4px_rgba(220,174,103,0.1)]' 
                      : ''
                  } group-hover:border-bloom-gold/50`}
                >
                  {Object.keys(countryCurrencyMap).map((countryName) => (
                    <option key={countryName} value={countryName}>
                      {countryName} ({countryCurrencyMap[countryName].currency})
                    </option>
                  ))}
                </select>
                <div className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full bg-bloom-gold transition-all duration-700 opacity-70"></div>
              </div>
            </div>

            {/* Converted Amount Display */}
            <div className="flex items-center justify-between p-3 bg-bloom-accent/20 rounded-md border border-bloom-gold/30 animate-fade-in">
              <span className="text-sm font-medium text-bloom-primary">Amount to Pay in {localCurrencySymbol === 'FCFA' ? 'CFA Franc' : localCurrencySymbol === '₦' ? 'Nigerian Naira' : localCurrencySymbol === 'KSh' ? 'Kenyan Shilling' : localCurrencySymbol === 'R' ? 'South African Rand' : localCurrencySymbol === 'E£' ? 'Egyptian Pound' : localCurrencySymbol === 'DH' ? 'Moroccan Dirham' : localCurrencySymbol === 'DA' ? 'Algerian Dinar' : localCurrencySymbol === 'Br' ? 'Ethiopian Birr' : localCurrencySymbol === 'TSh' ? 'Tanzanian Shilling' : localCurrencySymbol === 'USh' ? 'Ugandan Shilling' : localCurrencySymbol === 'RF' ? 'Rwandan Franc' : localCurrencySymbol === 'ZK' ? 'Zambian Kwacha' : localCurrencySymbol === 'P' ? 'Botswana Pula' : localCurrencySymbol === 'Rs' ? 'Mauritian Rupee' : 'Local Currency'}:</span>
              <span className="text-lg font-bold text-bloom-gold">
                {localCurrencySymbol} {amountInLocalCurrency.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center p-4 bg-blue-50 rounded-md mb-4 border border-blue-100">
              <div className="bg-blue-100 rounded-full p-1.5 mr-3">
                <AlertCircle size={16} className="text-blue-500" />
              </div>
              <p className="text-sm text-blue-700">
                You will be redirected to Paystack's secure payment page to complete your payment in {localCurrency}.
              </p>
            </div>

          </CardContent>
          
          <CardFooter className="flex flex-col space-y-2 pb-6">
            <Button 
              type="button" 
              onClick={onBack}
              variant="outline"
              disabled={isProcessing}
              className="w-full mb-2" 
            >
              ← Back to Application
            </Button>
            
            {/* The PaystackButton component */}
            <PaystackButton
              className="w-full bg-gradient-to-r from-bloom-gold/80 via-bloom-gold to-bloom-gold/80 text-white hover:from-bloom-gold hover:to-bloom-gold hover:shadow-md hover:translate-y-[-2px] transition-all duration-300 overflow-hidden group relative flex items-center justify-center py-2 px-4 rounded-md font-semibold"
              {...paystackConfig} 
              onSuccess={handlePaystackSuccess} 
              onClose={handlePaystackClose} 
              disabled={isProcessing || !emailAddress || parseFloat(amountUSD) <= 0 || errors.length > 0} 
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/30 to-white/0 -translate-x-full group-hover:translate-x-full transition-all duration-1000 ease-out"></span>
              
              {isProcessing ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </div>
              ) : (
                <span className="flex items-center gap-1.5">
                  <CreditCard size={16} />
                  Pay ${parseFloat(amountUSD || '0').toFixed(2)} ({localCurrencySymbol} {amountInLocalCurrency.toFixed(2)})
                </span>
              )}
            </PaystackButton>
            
            <div className="flex flex-col items-center justify-center gap-2 mt-3">
              <div className="flex items-center justify-center gap-1">
                <Lock size={12} className="text-bloom-gold" />
                <p className="text-xs text-center text-bloom-muted">
                  Your payment information is secure and encrypted
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-xs text-bloom-muted">
                  <CheckCircle size={12} className="text-green-500" />
                  <span>Secure</span>
                </div>
                <div className="w-1 h-1 bg-bloom-muted rounded-full"></div>
                <div className="flex items-center gap-1 text-xs text-bloom-muted">
                  <CheckCircle size={12} className="text-green-500" />
                  <span>Encrypted</span>
                </div>
                <div className="w-1 h-1 bg-bloom-muted rounded-full"></div>
                <div className="flex items-center gap-1 text-xs text-bloom-muted">
                  <CheckCircle size={12} className="text-green-500" />
                  <span>Protected</span>
                </div>
              </div>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default PaymentForm;
