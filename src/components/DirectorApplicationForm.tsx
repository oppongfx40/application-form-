import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form'; 
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react'; // Import Loader2 for submitting state
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';

// Define the component props
export interface DirectorApplicationFormProps {
  onSubmitSuccess: () => void;
  onBack: () => void;
}

// Define the form schema using Zod
const directorFormSchema = z.object({
  // Contact Information
  fullName: z.string().min(2, { message: "Full name is required" }),
  email: z.string().email({ message: "Valid email address is required" }),
  phone: z.string().min(8, { message: "Valid phone number is required" }),
  country: z.string().min(2, { message: "Country is required" }),
  city: z.string().min(2, { message: "City is required" }),
  
  // Motivation and Goals
  motivation: z.string().min(20, { message: "Please explain your motivation (min 20 characters)" }),
  goals: z.string().min(20, { message: "Please describe your goals (min 20 characters)" }),
  
  // Business Plan
  strategy: z.string().min(50, { message: "Please provide a detailed strategy (min 50 characters)" }),
  
  // National Director Agreement
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions",
  }),
  agreeToConfidentiality: z.boolean().refine(val => val === true, {
    message: "You must agree to the confidentiality terms",
  }),
  
  // Personal and Professional Information
  dateOfBirth: z.string()
    .min(1, { message: "Date of birth is required" })
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Date of birth must be in YYYY-MM-DD format" }), 
  bio: z.string().min(1, { message: "Bio is required" }).max(2500, { message: "Bio must be 2500 characters or less" }), 
  socialMedia: z.string().min(2, { message: "Social media information is required" }),
  
  // Country Information
  countryOverview: z.string().min(1, { message: "Country overview is required" }).max(2500, { message: "Country overview must be 2500 characters or less" }), 
  culturalInfo: z.string().min(1, { message: "Cultural information is required" }).max(2500, { message: "Cultural information must be 2500 characters or less" }), 
});

type DirectorFormValues = z.infer<typeof directorFormSchema>;

const DirectorApplicationForm: React.FC<DirectorApplicationFormProps> = ({ 
  onSubmitSuccess,
  onBack 
}) => {
  const [currentSection, setCurrentSection] = useState<
    'contact' | 'motivation' | 'business' | 'agreement' | 'profile' | 'country'
  >('contact'); 
  const [isSubmitting, setIsSubmitting] = useState(false); // State for submission loading

  // Define form sections with updated badges
  const formSections = [
    { id: 'contact', title: 'Contact Information', badge: '1' },
    { id: 'motivation', title: 'Motivation & Goals', badge: '2' },
    { id: 'business', title: 'Business Plan', badge: '3' },
    { id: 'agreement', title: 'Agreement', badge: '4' },
    { id: 'profile', title: 'Personal Profile', badge: '5' },
    { id: 'country', title: 'Country Information', badge: '6' },
  ];
  
  // Initialize the form
  const form = useForm<DirectorFormValues>({ 
    resolver: zodResolver(directorFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      country: '',
      city: '',
      motivation: '',
      goals: '',
      strategy: '',
      agreeToTerms: false,
      agreeToConfidentiality: false,
      dateOfBirth: '',
      bio: '',
      socialMedia: '',
      countryOverview: '',
      culturalInfo: '',
    },
    mode: 'onChange',
  });
  
  // Handle form submission
  const onSubmit = async (data: DirectorFormValues) => {
    setIsSubmitting(true); // Start loading state
    console.log("Form submitted:", data); // This log will still appear in frontend console

    try {
      const response = await fetch('http://localhost:5000/api/submit-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setTimeout(() => { // Wrap toast in setTimeout
          toast.success("Director application submitted successfully!", {
            description: "We'll review your application and contact you soon."
          });
        }, 0);
        console.log("Backend response:", result);
        // Clear form after successful submission
        form.reset(); 
        onSubmitSuccess(); // Call the success callback to change view
      } else {
        setTimeout(() => { // Wrap toast in setTimeout
          toast.error(`Submission failed: ${result.message || 'Unknown error'}.`, {
            description: "Please check your input and try again."
          });
        }, 0);
        console.error("Submission error:", result);
      }
    } catch (error) {
      setTimeout(() => { // Wrap toast in setTimeout
        toast.error("Network error. Please ensure the backend server is running and try again.");
      }, 0);
      console.error("Network or unexpected error:", error);
    } finally {
      setTimeout(() => setIsSubmitting(false), 0); // End loading state
    }
  };
  
  // Navigate to the next section
  const goToNextSection = async () => {
    console.log(`Attempting to go to next section from: ${currentSection}`);
    let shouldContinue = false;
    let fieldsToValidate: (keyof DirectorFormValues)[] = [];

    if (currentSection === 'contact') {
      fieldsToValidate = ['fullName', 'email', 'phone', 'country', 'city'];
    } else if (currentSection === 'motivation') {
      fieldsToValidate = ['motivation', 'goals'];
    } else if (currentSection === 'business') {
      fieldsToValidate = ['strategy'];
    } else if (currentSection === 'agreement') {
      fieldsToValidate = ['agreeToTerms', 'agreeToConfidentiality'];
    } else if (currentSection === 'profile') {
      fieldsToValidate = ['dateOfBirth', 'bio', 'socialMedia'];
    } else if (currentSection === 'country') { // Should not be reachable via "Next" button
      fieldsToValidate = ['countryOverview', 'culturalInfo'];
    }

    shouldContinue = await form.trigger(fieldsToValidate);

    if (shouldContinue) {
      const currentIndex = formSections.findIndex(section => section.id === currentSection);
      if (currentIndex < formSections.length - 1) {
        setCurrentSection(formSections[currentIndex + 1].id);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const errorFields = fieldsToValidate.filter(field => form.formState.errors[field]);
      const errorMessages = errorFields.map(field => {
        const fieldName = String(field).replace(/([A-Z])/g, ' $1').toLowerCase(); 
        return `${fieldName}: ${form.formState.errors[field]?.message}`;
      });

      if (errorMessages.length > 0) {
        setTimeout(() => {
          toast.error("Please fix the following errors:", {
            description: errorMessages.join('; '), 
            duration: 8000, 
          });
        }, 0);
      } else {
        setTimeout(() => {
          toast.error("Please fix the errors before continuing. Check highlighted fields.");
        }, 0);
      }
    }
  };
  
  // Navigate to the previous section
  const goToPrevSection = () => {
    const currentIndex = formSections.findIndex(section => section.id === currentSection);
    if (currentIndex > 0) {
      setCurrentSection(formSections[currentIndex - 1].id);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center text-bloom-muted hover:text-bloom-primary"
          onClick={onBack}
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to selection
        </Button>
        <div className="text-sm text-bloom-muted">
          National Director Application
        </div>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 text-bloom-primary">
        National Director Application
      </h1>
      
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="h-2 w-full bg-gray-200 rounded-full mb-2">
          <div 
            className="h-full bg-bloom-gold rounded-full transition-all duration-300"
            style={{ 
              width: 
                currentSection === 'contact' ? '0%' : 
                currentSection === 'motivation' ? '20%' : 
                currentSection === 'business' ? '40%' : 
                currentSection === 'agreement' ? '60%' : 
                currentSection === 'profile' ? '80%' : 
                '100%' 
            }}
          ></div>
        </div>
        <div className="text-sm text-bloom-muted text-center">
          Step {
            formSections.findIndex(s => s.id === currentSection) + 1
          } of {formSections.length}
        </div>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Contact Information Section */}
          {currentSection === 'contact' && (
            <>
              <h2 className="text-xl font-semibold text-bloom-primary mb-4">Contact Information</h2>
              
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address*</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your.email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your country" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your city" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
          
          {/* Motivation and Goals Section */}
          {currentSection === 'motivation' && (
            <>
              <h2 className="text-xl font-semibold text-bloom-primary mb-4">Motivation and Goals</h2>
              
              <FormField
                control={form.control}
                name="motivation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motivation*</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Why do you want to become a National Director for Miss Bloom Global?" 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="goals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Goals*</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="What do you hope to achieve in this role?" 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
          
          {/* Business Plan Section */}
          {currentSection === 'business' && (
            <>
              <h2 className="text-xl font-semibold text-bloom-primary mb-4">Business Plan</h2>
              
              <FormField
                control={form.control}
                name="strategy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Promotion Strategy*</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Please outline your strategy for promoting Miss Bloom Global in your country" 
                        className="min-h-[200px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
          
          {/* Agreement Section */}
          {currentSection === 'agreement' && (
            <>
              <h2 className="text-xl font-semibold text-bloom-primary mb-4">National Director Agreement</h2>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-medium mb-2">Terms and Conditions</h3>
                <p className="text-sm text-bloom-muted mb-4">
                  1. The National Director agrees to promote and represent Miss Bloom Global in their designated country.<br />
                  2. The National Director will adhere to the rules, regulations, and guidelines set forth by Miss Bloom Global.
                </p>
                
                <h3 className="font-medium mb-2">Confidentiality and Non-Disclosure</h3>
                <p className="text-sm text-bloom-muted mb-4">
                  1. The National Director agrees to maintain confidentiality and protect sensitive information related to Miss Bloom Global.
                </p>
                
                <h3 className="font-medium mb-2">Territorial Rights</h3>
                <p className="text-sm text-bloom-muted mb-4">
                  1. The National Director will have exclusive rights to promote Miss Bloom Global in their designated country.
                </p>
                
                <h3 className="font-medium mb-2">Payment Terms</h3>
                <p className="text-sm text-bloom-muted">
                  1. The National Director will receive percentage or amount of revenue generated from their country.
                </p>
              </div>
              
              <FormField
                control={form.control}
                name="agreeToTerms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I agree to the Terms and Conditions*
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="agreeToConfidentiality"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I agree to maintain confidentiality*
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </>
          )}
          
          {currentSection === 'profile' && (
            <>
              <h2 className="text-xl font-semibold text-bloom-primary mb-4">National Director Profile</h2>
              
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth*</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio (max 2500 characters)*</FormLabel> 
                    <FormControl>
                      <Textarea 
                        placeholder="Please provide a professional bio" 
                        className="min-h-[200px]"
                        {...field} 
                      />
                    </FormControl>
                    <div className="text-xs text-bloom-muted mt-1">
                      Characters: {field.value ? field.value.length : 0}/2500 
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="socialMedia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Social Media Handles*</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Please provide your social media handles (Instagram, Facebook, LinkedIn, etc.)" 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
          
          {currentSection === 'country' && (
            <>
              <h2 className="text-xl font-semibold text-bloom-primary mb-4">Country Information</h2>
              
              <FormField
                control={form.control}
                name="countryOverview"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country Overview (max 2500 characters)*</FormLabel> 
                    <FormControl>
                      <Textarea 
                        placeholder="Please provide an overview of your country" 
                        className="min-h-[200px]"
                        {...field} 
                      />
                    </FormControl>
                    <div className="text-xs text-bloom-muted mt-1">
                      Characters: {field.value ? field.value.length : 0}/2500 
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="culturalInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cultural and Custom Information* (max 2500 characters)</FormLabel> 
                    <FormControl>
                      <Textarea 
                        placeholder="Please provide information about your country's culture and customs" 
                        className="min-h-[200px]"
                        {...field} 
                      />
                    </FormControl>
                    <div className="text-xs text-bloom-muted mt-1">
                      Characters: {field.value ? field.value.length : 0}/2500 
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="pt-4">
                <Button type="submit" className="w-full bg-bloom-gold text-bloom-primary hover:bg-bloom-gold/80" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </Button>
              </div>
            </>
          )}
          
          {currentSection !== 'country' && (
            <div className="flex justify-end pt-4">
              {currentSection !== 'contact' && (
                <Button 
                  type="button"
                  variant="outline"
                  onClick={goToPrevSection}
                  className="mr-2"
                  disabled={isSubmitting}
                >
                  Previous
                </Button>
              )}
              <Button 
                type="button"
                onClick={goToNextSection}
                disabled={isSubmitting}
              >
                Next
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
};

export default DirectorApplicationForm;
