import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, ChevronRight, ChevronLeft, Info, ArrowLeft, Loader2, Upload } from 'lucide-react';
import { toast } from "sonner";

// --- START: EMBEDDED UTILITY FUNCTIONS AND TYPES ---

// Define the structure for your form data
interface ApplicationFormData {
  firstName: string;
  middleName: string;
  lastName: string;
  fullName: string; // Derived field
  email: string;
  phone: string;
  homePhone: string;
  country: string;
  city: string;
  street: string;
  addressLine2: string;
  stateRegion: string;
  zipCode: string;
  experience: string;
  education: string;
  skills: string;
  motivation: string;
  goals: string;
  strategy: string;
  dateOfBirth: string;
  age: string; // Derived field
  ethnicity: string;
  representCountry: string;
  alternateCountry: string;
  bio: string;
  socialMedia: string;
  height: string;
  weight: string;
  bust: string;
  waist: string;
  hips: string;
  dressSize: string;
  shoeSize: string;
  swimsuitSizeTop: string;
  swimsuitSizeBottom: string;
  schoolAttended: string;
  fieldOfStudy: string;
  highestEducation: string;
  threeWords: string;
  hobbies: string;
  pageantExperience: string;
  charity: string;
  hearAboutUs: string;
  // Image fields will now store Base64 strings or null
  headShot1: string | null;
  headShot2: string | null;
  bodyShot1: string | null;
  bodyShot2: string | null;
  additionalImage1: string | null;
  additionalImage2: string | null;
  countryOverview: string;
  culturalInfo: string;
  isEligible: boolean;
  hasValidPassport: boolean;
  canTravel: boolean;
  isGoodHealth: boolean;
  willFollowRules: boolean;
}

// Define the structure for form validation errors
interface FormError {
  field: keyof ApplicationFormData | 'terms'; // 'terms' is a special case for the checkbox
  message: string;
}

// Utility function to count words in a string
const countWords = (text: string): number => {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

// Utility function to calculate age from a date of birth string (YYYY-MM-DD)
const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const dob = new Date(dateOfBirth);
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
};

// Utility function to check if age is within a specified range
const isAgeInRange = (dateOfBirth: string, minAge: number, maxAge: number): boolean => {
  const age = calculateAge(dateOfBirth);
  return age >= minAge && age <= maxAge;
};

// Main validation function for the form
const validateApplicationForm = (formData: ApplicationFormData, sectionId: string): FormError[] => {
  const errors: FormError[] = [];

  switch (sectionId) {
    case 'eligibility':
      if (!formData.dateOfBirth) {
        errors.push({ field: 'dateOfBirth', message: 'Date of birth is required.' });
      } else if (!isAgeInRange(formData.dateOfBirth, 18, 35)) {
        errors.push({ field: 'dateOfBirth', message: 'You must be between 18 and 35 years old to participate.' });
      }
      if (!formData.isEligible) errors.push({ field: 'isEligible', message: 'You must confirm eligibility.' });
      if (!formData.hasValidPassport) errors.push({ field: 'hasValidPassport', message: 'You must confirm having a valid passport.' });
      if (!formData.canTravel) errors.push({ field: 'canTravel', message: 'You must confirm ability to travel.' });
      if (!formData.isGoodHealth) errors.push({ field: 'isGoodHealth', message: 'You must confirm good health.' });
      if (!formData.willFollowRules) errors.push({ field: 'willFollowRules', message: 'You must agree to follow rules.' });
      break;
    case 'contact':
      if (!formData.firstName.trim()) errors.push({ field: 'firstName', message: 'First name is required.' });
      if (!formData.lastName.trim()) errors.push({ field: 'lastName', message: 'Last name is required.' });
      if (!formData.email.trim()) {
        errors.push({ field: 'email', message: 'Email is required.' });
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.push({ field: 'email', message: 'Email is invalid.' });
      }
      if (!formData.phone.trim()) errors.push({ field: 'phone', message: 'Cell phone is required.' });
      if (!formData.country.trim()) errors.push({ field: 'country', message: 'Country is required.' });
      if (!formData.city.trim()) errors.push({ field: 'city', message: 'City is required.' });
      break;
    case 'personal':
      if (!formData.ethnicity.trim()) errors.push({ field: 'ethnicity', message: 'Ethnicity is required.' });
      if (!formData.representCountry.trim()) errors.push({ field: 'representCountry', message: 'Country to represent is required.' });
      break;
    case 'background':
      if (!formData.experience.trim()) errors.push({ field: 'experience', message: 'Work experience is required.' });
      if (!formData.education.trim()) errors.push({ field: 'education', message: 'Education is required.' });
      if (!formData.skills.trim()) errors.push({ field: 'skills', message: 'Skills are required.' });
      break;
    case 'motivation':
      if (countWords(formData.motivation) < 20 || countWords(formData.motivation) > 500) {
        errors.push({ field: 'motivation', message: 'Motivation must be between 20 and 500 words.' });
      }
      if (countWords(formData.goals) < 20 || countWords(formData.goals) > 500) {
        errors.push({ field: 'goals', message: 'Goals must be between 20 and 500 words.' });
      }
      break;
    case 'business':
      if (countWords(formData.strategy) < 50 || countWords(formData.strategy) > 1000) {
        errors.push({ field: 'strategy', message: 'Strategy must be between 50 and 1000 words.' });
      }
      break;
    case 'photos':
      // Now checking for Base64 string presence
      if (!formData.headShot1) errors.push({ field: 'headShot1', message: 'Head Shot 1 is required.' });
      if (!formData.bodyShot1) errors.push({ field: 'bodyShot1', message: 'Body Shot 1 is required.' });
      break;
    case 'profile':
      if (!formData.bio.trim()) {
        errors.push({ field: 'bio', message: 'Bio is required.' });
      } else if (formData.bio.length > 2500) {
        errors.push({ field: 'bio', message: 'Bio must be 2500 characters or less.' });
      }
      if (!formData.socialMedia.trim()) errors.push({ field: 'socialMedia', message: 'Social Media Handles are required.' });
      break;
    case 'countryInfo':
      if (!formData.countryOverview.trim()) {
        errors.push({ field: 'countryOverview', message: 'Country overview is required.' });
      } else if (formData.countryOverview.length > 2500) {
        errors.push({ field: 'countryOverview', message: 'Country overview must be 2500 characters or less.' });
      }
      if (!formData.culturalInfo.trim()) {
        errors.push({ field: 'culturalInfo', message: 'Cultural information is required.' });
      } else if (formData.culturalInfo.length > 2500) {
        errors.push({ field: 'culturalInfo', message: 'Cultural information must be 2500 characters or less.' });
      }
      break;
    case 'terms':
      break;
    case 'review':
      break;
    default:
      break;
  }
  return errors;
};

// --- END: EMBEDDED UTILITY FUNCTIONS AND TYPES ---

interface ApplicationFormProps {
  onSubmitSuccess: () => void;
  onBack: () => void;
}

const formSections = [
  { id: 'eligibility', title: 'Eligibility', badge: '1' },
  { id: 'contact', title: 'Contact Information', badge: '2' },
  { id: 'personal', title: 'Personal Details', badge: '3' },
  { id: 'background', title: 'Background & Experience', badge: '4' },
  { id: 'motivation', title: 'Motivation & Goals', badge: '5' },
  { id: 'business', title: 'Business Plan', badge: '6' },
  { id: 'photos', title: 'Photos', badge: '7' },
  { id: 'terms', title: 'Terms & Conditions', badge: '8' },
  { id: 'profile', title: 'Personal Profile', badge: '9' },
  { id: 'countryInfo', title: 'Country Information', badge: '10' },
  { id: 'review', title: 'Review & Submit', badge: '11' },
];

const ApplicationForm: React.FC<ApplicationFormProps> = ({ onSubmitSuccess, onBack }) => {
  const [currentSection, setCurrentSection] = useState('eligibility');
  const [formData, setFormData] = useState<ApplicationFormData>({
    firstName: '',
    middleName: '',
    lastName: '',
    fullName: '',
    email: '',
    phone: '',
    homePhone: '',
    country: '',
    city: '',
    street: '',
    addressLine2: '',
    stateRegion: '',
    zipCode: '',
    experience: '',
    education: '',
    skills: '',
    motivation: '',
    goals: '',
    strategy: '',
    dateOfBirth: '',
    age: '',
    ethnicity: '',
    representCountry: '',
    alternateCountry: '',
    bio: '',
    socialMedia: '',
    height: '',
    weight: '',
    bust: '',
    waist: '',
    hips: '',
    dressSize: '',
    shoeSize: '',
    swimsuitSizeTop: '',
    swimsuitSizeBottom: '',
    schoolAttended: '',
    fieldOfStudy: '',
    highestEducation: '',
    threeWords: '',
    hobbies: '',
    pageantExperience: '',
    charity: '',
    hearAboutUs: '',
    // Initialize image fields as null strings
    headShot1: null,
    headShot2: null,
    bodyShot1: null,
    bodyShot1: null, // Corrected typo: should be bodyShot2
    additionalImage1: null,
    additionalImage2: null,
    countryOverview: '',
    culturalInfo: '',
    isEligible: false,
    hasValidPassport: false,
    canTravel: false,
    isGoodHealth: false,
    willFollowRules: false,
  });
  
  const [errors, setErrors] = useState<FormError[]>([]);
  const [focused, setFocused] = useState<string | null>(null);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  // Corrected typo in initial state for bodyShot1
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      bodyShot2: prev.bodyShot1 // If bodyShot1 was intended to be bodyShot2
    }));
  }, []); // Run once on mount

  // Reset scroll position when changing sections
  useEffect(() => {
    if (formRef.current) {
      formRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentSection]);

  // Update full name when first, middle, or last name changes
  useEffect(() => {
    const fullName = [
      formData.firstName,
      formData.middleName,
      formData.lastName
    ].filter(Boolean).join(' ');
    
    setFormData(prev => ({ ...prev, fullName }));
  }, [formData.firstName, formData.middleName, formData.lastName]);

  // Calculate age when date of birth changes
  useEffect(() => {
    if (formData.dateOfBirth) {
      const age = calculateAge(formData.dateOfBirth).toString();
      setFormData(prev => ({ ...prev, age }));
    }
  }, [formData.dateOfBirth]);

  const handleFieldChange = (field: keyof ApplicationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (field: keyof ApplicationFormData, checked: boolean) => {
    setFormData(prev => ({ ...prev, [field]: checked }));
  };

  // New function to handle file input and convert to Base64
  const handleFileChange = (field: keyof ApplicationFormData, files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      const MAX_FILE_SIZE_MB = 2; // 2 MB limit
      const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

      if (file.size > MAX_FILE_SIZE_BYTES) {
        setTimeout(() => {
          toast.error(`File size exceeds ${MAX_FILE_SIZE_MB}MB limit.`, {
            description: `Please upload a smaller image for ${field}.`,
            duration: 5000,
          });
        }, 0);
        setFormData(prev => ({ ...prev, [field]: null })); // Clear the field if too large
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.onerror = (error) => {
        console.error("Error reading file:", error);
        setTimeout(() => {
          toast.error("Failed to read image file.", {
            description: "Please try another image or format.",
            duration: 5000,
          });
        }, 0);
        setFormData(prev => ({ ...prev, [field]: null }));
      };
      reader.readAsDataURL(file); // Reads the file as a Base64 string
    } else {
      setFormData(prev => ({ ...prev, [field]: null })); // Clear if no file selected
    }
  };

  const getErrorMessage = (field: string): string | undefined => {
    return errors.find(error => error.field === field)?.message;
  };

  const handleNext = () => {
    const sectionErrors = validateApplicationForm(formData, currentSection);
    
    if (currentSection === 'eligibility' && formData.dateOfBirth) {
      if (!isAgeInRange(formData.dateOfBirth, 18, 35)) {
        sectionErrors.push({ 
          field: 'dateOfBirth', 
          message: 'You must be between 18 and 35 years old to participate' 
        });
      }
    }
    
    setErrors(sectionErrors);
    
    if (sectionErrors.length === 0) {
      const currentIndex = formSections.findIndex(section => section.id === currentSection);
      if (currentIndex < formSections.length - 1) {
        const nextSection = formSections[currentIndex + 1].id;
        setCurrentSection(nextSection);
      }
    } else {
      setTimeout(() => { // Wrap toast in setTimeout
        toast.error("Please fix the errors before proceeding to the next section.", {
          description: sectionErrors.map(e => e.message).join('; '),
          duration: 5000,
        });
      }, 0);
    }
  };

  const handlePrevious = () => {
    const currentIndex = formSections.findIndex(section => section.id === currentSection);
    if (currentIndex > 0) {
      const prevSection = formSections[currentIndex - 1].id;
      setCurrentSection(prevSection);
    }
  };

  const handleSubmit = async () => {
    let allErrors: FormError[] = [];
    
    formSections.forEach(section => {
      if (section.id !== 'review' && section.id !== 'terms') {
        const sectionErrors = validateApplicationForm(formData, section.id);
        allErrors = [...allErrors, ...sectionErrors];
      }
    });
    
    if (formData.dateOfBirth && !isAgeInRange(formData.dateOfBirth, 18, 35)) {
      allErrors.push({ field: 'dateOfBirth', message: 'You must be between 18 and 35 years old to participate' });
    }

    if (!agreeTerms) {
      allErrors.push({ field: 'terms', message: 'You must agree to the terms and conditions' });
    }
    
    setErrors(allErrors);
    
    if (allErrors.length === 0) {
      setIsSubmitting(true);
      
      try {
        // Construct the dataToSend object including Base64 image strings
        const dataToSend = {
          ...formData, // Send all form data
          // Override specific fields if needed for backend processing
          // For images, they are already Base64 strings in formData
          submittedAt: new Date().toISOString(), // Add submission timestamp
        };

        const response = await fetch('http://localhost:5000/api/submit-form', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataToSend),
        });

        const result = await response.json();

        if (response.ok) {
          setTimeout(() => { // Wrap toast in setTimeout
            toast.success("Application submitted successfully!", {
              description: "We'll review your application and contact you soon."
            });
          }, 0);
          console.log("Backend response:", result);
          // Clear form after successful submission
          setFormData({
            firstName: '', middleName: '', lastName: '', fullName: '', email: '', phone: '', homePhone: '',
            country: '', city: '', street: '', addressLine2: '', stateRegion: '', zipCode: '',
            experience: '', education: '', skills: '',
            motivation: '', goals: '', strategy: '',
            dateOfBirth: '', age: '', ethnicity: '', representCountry: '', alternateCountry: '',
            bio: '', socialMedia: '', height: '', weight: '', bust: '', waist: '', hips: '',
            dressSize: '', shoeSize: '', swimsuitSizeTop: '', swimsuitSizeBottom: '',
            schoolAttended: '', fieldOfStudy: '', highestEducation: '', threeWords: '', hobbies: '',
            pageantExperience: '', charity: '', hearAboutUs: '',
            headShot1: null, headShot2: null, bodyShot1: null, bodyShot2: null, additionalImage1: null, additionalImage2: null,
            countryOverview: '', culturalInfo: '',
            isEligible: false, hasValidPassport: false, canTravel: false, isGoodHealth: false, willFollowRules: false,
          });
          setAgreeTerms(false);
          onSubmitSuccess();
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
        setTimeout(() => setIsSubmitting(false), 0); // Wrap state update in setTimeout
      }
    } else {
      const firstErrorSection = formSections.find(section => 
        allErrors.some(error => validateApplicationForm(formData, section.id).some(e => e.field === error.field))
      );
      
      if (firstErrorSection && firstErrorSection.id !== currentSection) {
        setCurrentSection(firstErrorSection.id);
        setTimeout(() => { // Wrap toast in setTimeout
          toast.error("Please fix the errors before submitting", {
            description: "There are errors in your application that need to be corrected."
          });
        }, 0);
      } else if (allErrors.length > 0) {
        setTimeout(() => { // Wrap toast in setTimeout
          toast.error("Please fix the errors before submitting", {
            description: "There are errors in your application that need to be corrected."
          });
        }, 0);
      }
    }
  };

  const hasError = (field: string): boolean => {
    return errors.some(error => error.field === field);
  };

  return (
    <div className="w-full max-w-3xl mx-auto pb-10 animate-fade-in" ref={formRef}>
      <div className="flex items-center justify-center mb-8">
        <div className="relative">
          <h1 className="text-3xl font-light text-bloom-primary">
            Miss Bloom <span className="font-medium">Global</span>
          </h1>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-0.5 bg-bloom-gold"></div>
        </div>
      </div>

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
          Participant Application
        </div>
      </div>
      
      {/* Navigation Sections */}
      <div className="hidden md:flex mb-8 overflow-x-auto">
        <div className="flex w-full border rounded-md">
          {formSections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => {
                const currentIndex = formSections.findIndex(s => s.id === currentSection);
                if (index <= currentIndex) {
                  setCurrentSection(section.id);
                }
              }}
              className={`flex-1 py-2 px-4 text-sm font-medium relative ${
                currentSection === section.id
                  ? 'bg-bloom-primary text-white'
                  : index < formSections.findIndex(s => s.id === currentSection)
                  ? 'bg-bloom-accent text-bloom-primary'
                  : 'bg-white text-bloom-muted'
              } ${index === 0 ? 'rounded-l-md' : ''} ${index === formSections.length - 1 ? 'rounded-r-md' : ''}`}
            >
              <div className="flex items-center justify-center">
                <Badge variant="outline" className={`w-5 h-5 flex items-center justify-center mr-2 ${
                  currentSection === section.id
                    ? 'border-white text-white'
                    : index < formSections.findIndex(s => s.id === currentSection)
                    ? 'border-bloom-gold bg-bloom-gold text-white'
                    : 'border-bloom-muted text-bloom-muted'
                }`}>
                  {index < formSections.findIndex(s => s.id === currentSection) ? (
                    <Check size={12} />
                  ) : (
                    section.badge
                  )}
                </Badge>
                <span className="whitespace-nowrap">{section.title}</span>
              </div>
              
              {index < formSections.length - 1 && (
                <div className="absolute top-0 right-0 h-full w-4 flex items-center justify-center">
                  <ChevronRight size={16} className="text-bloom-muted" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
      
      <div className="md:hidden mb-6">
        <select
          value={currentSection}
          onChange={(e) => setCurrentSection(e.target.value)}
          className="w-full p-2 border rounded-md"
        >
          {formSections.map((section) => (
            <option key={section.id} value={section.id}>
              {section.title}
            </option>
          ))}
        </select>
      </div>
      
      <Card className="w-full shadow-lg border-0 neo-shadow overflow-hidden animate-slide-up">
        <CardHeader className="space-y-1 pb-4">
          <div className="flex items-center">
            <Badge variant="outline" className="mr-2 bg-bloom-primary text-white border-none">
              {formSections.find(s => s.id === currentSection)?.badge}
            </Badge>
            <CardTitle className="text-xl">{formSections.find(s => s.id === currentSection)?.title}</CardTitle>
          </div>
          <CardDescription>
            {currentSection === 'eligibility' && "Please confirm you meet all eligibility requirements"}
            {currentSection === 'contact' && "Your basic contact information"}
            {currentSection === 'personal' && "Your personal details and measurements"}
            {currentSection === 'background' && "Tell us about your experience and qualifications"}
            {currentSection === 'motivation' && "Why do you want to join Miss Bloom Global?"}
            {currentSection === 'business' && "Your strategy to promote Miss Bloom Global"}
            {currentSection === 'photos' && "Upload your photos for the application"}
            {currentSection === 'terms' && "Review and agree to the terms and conditions"}
            {currentSection === 'profile' && "Personal information for your profile"}
            {currentSection === 'countryInfo' && "Information about your country and culture"}
            {currentSection === 'review' && "Review your application before submitting"}
          </CardDescription>
        </CardHeader>
        
        <Separator />
        
        <CardContent className="space-y-6 pt-6">
          {/* Eligibility Requirements Section */}
          {currentSection === 'eligibility' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-bloom-accent/30 p-4 rounded-md">
                <h3 className="font-medium text-lg mb-4">Eligibility Requirements For Participation</h3>
                
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Must be female</li>
                  <li>Must be between the ages of 18-35 years old on pageant date</li>
                  <li>Must not currently be married or pregnant</li>
                  <li>Must be able to communicate in English</li>
                  <li>Must have never been arrested or convicted of any crime</li>
                  <li>Must have never modeled for any sexually explicit or pornographic materials. Artistic nude is acceptable but must be approved by the organization.</li>
                  <li>Must be in good physical and mental health and have no known current sickness that can be contagious</li>
                  <li>Must be committed to adhere to all the pageant rules and regulations upon acceptance.</li>
                  <li>Must have a valid international passport</li>
                  <li>Must be available to travel</li>
                </ol>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className={`${hasError('dateOfBirth') ? 'text-destructive' : ''}`}>
                  Date of Birth*
                </Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleFieldChange('dateOfBirth', e.target.value)}
                  onFocus={() => setFocused('dateOfBirth')}
                  onBlur={() => setFocused(null)}
                  className={`transition-all ${focused === 'dateOfBirth' ? 'border-bloom-gold ring-1 ring-bloom-gold/20' : ''} ${hasError('dateOfBirth') ? 'border-destructive' : ''}`}
                />
                {getErrorMessage('dateOfBirth') && (
                  <p className="text-xs text-destructive">{getErrorMessage('dateOfBirth')}</p>
                )}
              </div>
              
              {formData.dateOfBirth && (
                <div className="text-sm">
                  <span className="font-medium">Your age: </span>
                  <span>{formData.age} years old</span>
                </div>
              )}
              
              <div className="space-y-3 border p-4 rounded-md">
                <p className="font-medium text-sm">Please confirm that you meet the following requirements:</p>
                
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="isEligible" 
                      checked={formData.isEligible}
                      onCheckedChange={(checked) => handleCheckboxChange('isEligible', checked === true)}
                      className={hasError('isEligible') ? 'border-destructive' : ''}
                    />
                    <label htmlFor="isEligible" className="text-sm leading-tight">
                      I confirm that I meet all the eligibility requirements listed above
                    </label>
                  </div>
                  {hasError('isEligible') && (
                    <p className="text-xs text-destructive pl-6">{getErrorMessage('isEligible')}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="hasValidPassport" 
                      checked={formData.hasValidPassport}
                      onCheckedChange={(checked) => handleCheckboxChange('hasValidPassport', checked === true)}
                      className={hasError('hasValidPassport') ? 'border-destructive' : ''}
                    />
                    <label htmlFor="hasValidPassport" className="text-sm leading-tight">
                      I have a valid international passport
                    </label>
                  </div>
                  {hasError('hasValidPassport') && (
                    <p className="text-xs text-destructive pl-6">{getErrorMessage('hasValidPassport')}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="canTravel" 
                      checked={formData.canTravel}
                      onCheckedChange={(checked) => handleCheckboxChange('canTravel', checked === true)}
                      className={hasError('canTravel') ? 'border-destructive' : ''}
                    />
                    <label htmlFor="canTravel" className="text-sm leading-tight">
                      I am available to travel
                    </label>
                  </div>
                  {hasError('canTravel') && (
                    <p className="text-xs text-destructive pl-6">{getErrorMessage('canTravel')}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="isGoodHealth" 
                      checked={formData.isGoodHealth}
                      onCheckedChange={(checked) => handleCheckboxChange('isGoodHealth', checked === true)}
                      className={hasError('isGoodHealth') ? 'border-destructive' : ''}
                    />
                    <label htmlFor="isGoodHealth" className="text-sm leading-tight">
                      I am in good physical and mental health with no known contagious diseases
                    </label>
                  </div>
                  {hasError('isGoodHealth') && (
                    <p className="text-xs text-destructive pl-6">{getErrorMessage('isGoodHealth')}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="willFollowRules" 
                      checked={formData.willFollowRules}
                      onCheckedChange={(checked) => handleCheckboxChange('willFollowRules', checked === true)}
                      className={hasError('willFollowRules') ? 'border-destructive' : ''}
                    />
                    <label htmlFor="willFollowRules" className="text-sm leading-tight">
                      I commit to adhere to all pageant rules and regulations
                    </label>
                  </div>
                  {hasError('willFollowRules') && (
                    <p className="text-xs text-destructive pl-6">{getErrorMessage('willFollowRules')}</p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Contact Information Section */}
          {currentSection === 'contact' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className={`${hasError('firstName') ? 'text-destructive' : ''}`}>
                    First Name*
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleFieldChange('firstName', e.target.value)}
                    onFocus={() => setFocused('firstName')}
                    onBlur={() => setFocused(null)}
                    className={`transition-all ${focused === 'firstName' ? 'border-bloom-gold ring-1 ring-bloom-gold/20' : ''} ${hasError('firstName') ? 'border-destructive' : ''}`}
                  />
                  {getErrorMessage('firstName') && (
                    <p className="text-xs text-destructive">{getErrorMessage('firstName')}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="middleName">
                    Middle Name
                  </Label>
                  <Input
                    id="middleName"
                    value={formData.middleName}
                    onChange={(e) => handleFieldChange('middleName', e.target.value)}
                    onFocus={() => setFocused('middleName')}
                    onBlur={() => setFocused(null)}
                    className={`transition-all ${focused === 'middleName' ? 'border-bloom-gold ring-1 ring-bloom-gold/20' : ''}`}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName" className={`${hasError('lastName') ? 'text-destructive' : ''}`}>
                  Last Name*
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleFieldChange('lastName', e.target.value)}
                  onFocus={() => setFocused('lastName')}
                  onBlur={() => setFocused(null)}
                  className={`transition-all ${focused === 'lastName' ? 'border-bloom-gold ring-1 ring-bloom-gold/20' : ''} ${hasError('lastName') ? 'border-destructive' : ''}`}
                />
                {getErrorMessage('lastName') && (
                  <p className="text-xs text-destructive">{getErrorMessage('lastName')}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className={`${hasError('email') ? 'text-destructive' : ''}`}>
                  Email Address*
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  className={`transition-all ${focused === 'email' ? 'border-bloom-gold ring-1 ring-bloom-gold/20' : ''} ${hasError('email') ? 'border-destructive' : ''}`}
                />
                {getErrorMessage('email') && (
                  <p className="text-xs text-destructive">{getErrorMessage('email')}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className={`${hasError('phone') ? 'text-destructive' : ''}`}>
                    Cell Phone*
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                    onFocus={() => setFocused('phone')}
                    onBlur={() => setFocused(null)}
                    className={`transition-all ${focused === 'phone' ? 'border-bloom-gold ring-1 ring-bloom-gold/20' : ''} ${hasError('phone') ? 'border-destructive' : ''}`}
                  />
                  {getErrorMessage('phone') && (
                    <p className="text-xs text-destructive">{getErrorMessage('phone')}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="homePhone">
                    Home Phone
                  </Label>
                  <Input
                    id="homePhone"
                    value={formData.homePhone}
                    onChange={(e) => handleFieldChange('homePhone', e.target.value)}
                    onFocus={() => setFocused('homePhone')}
                    onBlur={() => setFocused(null)}
                    className={`transition-all ${focused === 'homePhone' ? 'border-bloom-gold ring-1 ring-bloom-gold/20' : ''}`}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="street">
                  Street Address
                </Label>
                <Input
                  id="street"
                  value={formData.street}
                  onChange={(e) => handleFieldChange('street', e.target.value)}
                  onFocus={() => setFocused('street')}
                  onBlur={() => setFocused(null)}
                  className={`transition-all ${focused === 'street' ? 'border-bloom-gold ring-1 ring-bloom-gold/20' : ''}`}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="addressLine2">
                  Address Line 2
                </Label>
                <Input
                  id="addressLine2"
                  value={formData.addressLine2}
                  onChange={(e) => handleFieldChange('addressLine2', e.target.value)}
                  onFocus={() => setFocused('addressLine2')}
                  onBlur={() => setFocused(null)}
                  className={`transition-all ${focused === 'addressLine2' ? 'border-bloom-gold ring-1 ring-bloom-gold/20' : ''}`}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">
                    City
                  </Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleFieldChange('city', e.target.value)}
                    onFocus={() => setFocused('city')}
                    onBlur={() => setFocused(null)}
                    className={`transition-all ${focused === 'city' ? 'border-bloom-gold ring-1 ring-bloom-gold/20' : ''}`}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="stateRegion">
                    State/Region
                  </Label>
                  <Input
                    id="stateRegion"
                    value={formData.stateRegion}
                    onChange={(e) => handleFieldChange('stateRegion', e.target.value)}
                    onFocus={() => setFocused('stateRegion')}
                    onBlur={() => setFocused(null)}
                    className={`transition-all ${focused === 'stateRegion' ? 'border-bloom-gold ring-1 ring-bloom-gold/20' : ''}`}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zipCode">
                    Zip/Postal Code
                  </Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => handleFieldChange('zipCode', e.target.value)}
                    onFocus={() => setFocused('zipCode')}
                    onBlur={() => setFocused(null)}
                    className={`transition-all ${focused === 'zipCode' ? 'border-bloom-gold ring-1 ring-bloom-gold/20' : ''}`}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="country" className={`${hasError('country') ? 'text-destructive' : ''}`}>
                    Country*
                  </Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleFieldChange('country', e.target.value)}
                    onFocus={() => setFocused('country')}
                    onBlur={() => setFocused(null)}
                    className={`transition-all ${focused === 'country' ? 'border-bloom-gold ring-1 ring-bloom-gold/20' : ''} ${hasError('country') ? 'border-destructive' : ''}`}
                  />
                  {getErrorMessage('country') && (
                    <p className="text-xs text-destructive">{getErrorMessage('country')}</p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Personal Details Section */}
          {currentSection === 'personal' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ethnicity">
                    Ethnicity
                  </Label>
                  <Input
                    id="ethnicity"
                    value={formData.ethnicity}
                    onChange={(e) => handleFieldChange('ethnicity', e.target.value)}
                    onFocus={() => setFocused('ethnicity')}
                    onBlur={() => setFocused(null)}
                    className={`transition-all ${focused === 'ethnicity' ? 'border-bloom-gold ring-1 ring-bloom-gold/20' : ''}`}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="representCountry" className={`${hasError('representCountry') ? 'text-destructive' : ''}`}>
                    Country You Represent*
                  </Label>
                  <Input
                    id="representCountry"
                    value={formData.representCountry}
                    onChange={(e) => handleFieldChange('representCountry', e.target.value)}
                    onFocus={() => setFocused('representCountry')}
                    onBlur={() => setFocused(null)}
                    className={`transition-all ${focused === 'representCountry' ? 'border-bloom-gold ring-1 ring-bloom-gold/20' : ''} ${hasError('representCountry') ? 'border-destructive' : ''}`}
                  />
                  {getErrorMessage('representCountry') && (
                    <p className="text-xs text-destructive">{getErrorMessage('representCountry')}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="alternateCountry">
                  Alternate Country (Optional)
                </Label>
                <Input
                  id="alternateCountry"
                  value={formData.alternateCountry}
                  onChange={(e) => handleFieldChange('alternateCountry', e.target.value)}
                  onFocus={() => setFocused('alternateCountry')}
                  onBlur={() => setFocused(null)}
                  className={`transition-all ${focused === 'alternateCountry' ? 'border-bloom-gold ring-1 ring-bloom-gold/20' : ''}`}
                />
              </div>
              
              <h3 className="text-lg font-medium text-bloom-primary mt-8 mb-4">Measurements (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height">Height (e.g., 5'7" or 170cm)</Label>
                  <Input
                    id="height"
                    value={formData.height}
                    onChange={(e) => handleFieldChange('height', e.target.value)}
                    onFocus={() => setFocused('height')}
                    onBlur={() => setFocused(null)}
                    className={`transition-all ${focused === 'height' ? 'border-bloom-gold ring-1 ring-bloom-gold/20' : ''}`}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (e.g., 120 lbs or 54 kg)</Label>
                  <Input
                    id="weight"
                    value={formData.weight}
                    onChange={(e) => handleFieldChange('weight', e.target.value)}
                    onFocus={() => setFocused('weight')}
                    onBlur={() => setFocused(null)}
                    className={`transition-all ${focused === 'weight' ? 'border-bloom-gold ring-1 ring-bloom-gold/20' : ''}`}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bust">Bust (inches/cm)</Label>
                  <Input
                    id="bust"
                    value={formData.bust}
                    onChange={(e) => handleFieldChange('bust', e.target.value)}
                    onFocus={() => setFocused('bust')}
                    onBlur={() => setFocused(null)}
                    className={`transition-all ${focused === 'bust' ? 'border-bloom-gold ring-1 ring-bloom-gold/20' : ''}`}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="waist">Waist (inches/cm)</Label>
                  <Input
                    id="waist"
                    value={formData.waist}
                    onChange={(e) => handleFieldChange('waist', e.target.value)}
                    onFocus={() => setFocused('waist')}
                    onBlur={() => setFocused(null)}
                    className={`transition-all ${focused === 'waist' ? 'border-bloom-gold ring-1 ring-bloom-gold/20' : ''}`}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hips">Hips (inches/cm)</Label>
                  <Input
                    id="hips"
                    value={formData.hips}
                    onChange={(e) => handleFieldChange('hips', e.target.value)}
                    onFocus={() => setFocused('hips')}
                    onBlur={() => setFocused(null)}
                    className={`transition-all ${focused === 'hips' ? 'border-bloom-gold ring-1 ring-bloom-gold/20' : ''}`}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dressSize">Dress Size</Label>
                  <Input
                    id="dressSize"
                    value={formData.dressSize}
                    onChange={(e) => handleFieldChange('dressSize', e.target.value)}
                    onFocus={() => setFocused('dressSize')}
                    onBlur={() => setFocused(null)}
                    className={`transition-all ${focused === 'dressSize' ? 'border-bloom-gold ring-1 ring-bloom-gold/20' : ''}`}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shoeSize">Shoe Size</Label>
                  <Input
                    id="shoeSize"
                    value={formData.shoeSize}
                    onChange={(e) => handleFieldChange('shoeSize', e.target.value)}
                    onFocus={() => setFocused('shoeSize')}
                    onBlur={() => setFocused(null)}
                    className={`transition-all ${focused === 'shoeSize' ? 'border-bloom-gold ring-1 ring-bloom-gold/20' : ''}`}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="swimsuitSizeTop">Swimsuit Size (Top)</Label>
                  <Input
                    id="swimsuitSizeTop"
                    value={formData.swimsuitSizeTop}
                    onChange={(e) => handleFieldChange('swimsuitSizeTop', e.target.value)}
                    onFocus={() => setFocused('swimsuitSizeTop')}
                    onBlur={() => setFocused(null)}
                    className={`transition-all ${focused === 'swimsuitSizeTop' ? 'border-bloom-gold ring-1 ring-bloom-gold/20' : ''}`}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="swimsuitSizeBottom">Swimsuit Size (Bottom)</Label>
                  <Input
                    id="swimsuitSizeBottom"
                    value={formData.swimsuitSizeBottom}
                    onChange={(e) => handleFieldChange('swimsuitSizeBottom', e.target.value)}
                    onFocus={() => setFocused('swimsuitSizeBottom')}
                    onBlur={() => setFocused(null)}
                    className={`transition-all ${focused === 'swimsuitSizeBottom' ? 'border-bloom-gold ring-1 ring-bloom-gold/20' : ''}`}
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Background & Experience Section */}
          {currentSection === 'background' && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <Label htmlFor="schoolAttended">School(s) Attended</Label>
                <Input
                  id="schoolAttended"
                  value={formData.schoolAttended}
                  onChange={(e) => handleFieldChange('schoolAttended', e.target.value)}
                  onFocus={() => setFocused('schoolAttended')}
                  onBlur={() => setFocused(null)}
                  className={`transition-all ${focused === 'schoolAttended' ? 'border-bloom-gold ring-1 ring-bloom-gold/20' : ''}`}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fieldOfStudy">Field of Study</Label>
                <Input
                  id="fieldOfStudy"
                  value={formData.fieldOfStudy}
                  onChange={(e) => handleFieldChange('fieldOfStudy', e.target.value)}
                  onFocus={() => setFocused('fieldOfStudy')}
                  onBlur={() => setFocused(null)}
                  className={`transition-all ${focused === 'fieldOfStudy' ? 'border-bloom-gold ring-1 ring-bloom-gold/20' : ''}`}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="highestEducation">Highest Level of Education</Label>
                <Input
                  id="highestEducation"
                  value={formData.highestEducation}
                  onChange={(e) => handleFieldChange('highestEducation', e.target.value)}
                  onFocus={() => setFocused('highestEducation')}
                  onBlur={() => setFocused(null)}
                  className={`transition-all ${focused === 'highestEducation' ? 'border-bloom-gold ring-1 ring-bloom-gold/20' : ''}`}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience" className={`${hasError('experience') ? 'text-destructive' : ''}`}>
                  Work Experience*
                </Label>
                <Textarea
                  id="experience"
                  value={formData.experience}
                  onChange={(e) => handleFieldChange('experience', e.target.value)}
                  onFocus={() => setFocused('experience')}
                  onBlur={() => setFocused(null)}
                  className={`min-h-[100px] transition-all ${focused === 'experience' ? 'border-bloom-gold ring-1 ring-bloom-gold/20' : ''} ${hasError('experience') ? 'border-destructive' : ''}`}
                />
                {getErrorMessage('experience') && (
                  <p className="text-xs text-destructive">{getErrorMessage('experience')}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="education" className={`${hasError('education') ? 'text-destructive' : ''}`}>
                  Education & Qualifications*
                </Label>
                <Textarea
                  id="education"
                  value={formData.education}
                  onChange={(e) => handleFieldChange('education', e.target.value)}
                  onFocus={() => setFocused('education')}
                  onBlur={() => setFocused(null)}
                  className={`min-h-[100px] transition-all ${focused === 'education' ? 'border-bloom-gold ring-1 ring-bloom-gold/20' : ''} ${hasError('education') ? 'border-destructive' : ''}`}
                />
                {getErrorMessage('education') && (
                  <p className="text-xs text-destructive">{getErrorMessage('education')}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="skills" className={`${hasError('skills') ? 'text-destructive' : ''}`}>
                  Skills*
                </Label>
                <Textarea
                  id="skills"
                  value={formData.skills}
                  onChange={(e) => handleFieldChange('skills', e.target.value)}
                  onFocus={() => setFocused('skills')}
                  onBlur={() => setFocused(null)}
                  className={`min-h-[100px] transition-all ${focused === 'skills' ? 'border-bloom-gold ring-1 ring-bloom-gold/20' : ''} ${hasError('skills') ? 'border-destructive' : ''}`}
                />
                {getErrorMessage('skills') && (
                  <p className="text-xs text-destructive">{getErrorMessage('skills')}</p>
                )}
              </div>
            </div>
          )}
          
          {/* Motivation & Goals Section */}
          {currentSection === 'motivation' && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <Label htmlFor="motivation" className={`${hasError('motivation') ? 'text-destructive' : ''}`}>
                  Motivation* (Min 20 words, Max 500 words)
                </Label>
                <Textarea
                  id="motivation"
                  value={formData.motivation}
                  onChange={(e) => handleFieldChange('motivation', e.target.value)}
                  onFocus={() => setFocused('motivation')}
                  onBlur={() => setFocused(null)}
                  className={`min-h-[150px] transition-all ${focused === 'motivation' ? 'border-bloom-gold ring-1 ring-bloom-gold/20' : ''} ${hasError('motivation') ? 'border-destructive' : ''}`}
                />
                <div className="text-xs text-bloom-muted mt-1">
                  Words: {countWords(formData.motivation)}/500
                </div>
                {getErrorMessage('motivation') && (
                  <p className="text-xs text-destructive">{getErrorMessage('motivation')}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="goals" className={`${hasError('goals') ? 'text-destructive' : ''}`}>
                  Goals* (Min 20 words, Max 500 words)
                </Label>
                <Textarea
                  id="goals"
                  value={formData.goals}
                  onChange={(e) => handleFieldChange('goals', e.target.value)}
                  onFocus={() => setFocused('goals')}
                  onBlur={() => setFocused(null)}
                  className={`min-h-[150px] transition-all ${focused === 'goals' ? 'border-bloom-gold ring-1 ring-bloom-gold/20' : ''} ${hasError('goals') ? 'border-destructive' : ''}`}
                />
                <div className="text-xs text-bloom-muted mt-1">
                  Words: {countWords(formData.goals)}/500
                </div>
                {getErrorMessage('goals') && (
                  <p className="text-xs text-destructive">{getErrorMessage('goals')}</p>
                )}
              </div>
            </div>
          )}
          
          {/* Business Plan Section */}
          {currentSection === 'business' && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <Label htmlFor="strategy" className={`${hasError('strategy') ? 'text-destructive' : ''}`}>
                  Promotion Strategy* (Min 50 words, Max 1000 words)
                </Label>
                <Textarea
                  id="strategy"
                  value={formData.strategy}
                  onChange={(e) => handleFieldChange('strategy', e.target.value)}
                  onFocus={() => setFocused('strategy')}
                  onBlur={() => setFocused(null)}
                  className={`min-h-[200px] transition-all ${focused === 'strategy' ? 'border-bloom-gold ring-1 ring-bloom-gold/20' : ''} ${hasError('strategy') ? 'border-destructive' : ''}`}
                />
                <div className="text-xs text-bloom-muted mt-1">
                  Words: {countWords(formData.strategy)}/1000
                </div>
                {getErrorMessage('strategy') && (
                  <p className="text-xs text-destructive">{getErrorMessage('strategy')}</p>
                )}
              </div>
            </div>
          )}
          
          {/* Photos Section */}
          {currentSection === 'photos' && (
            <div className="space-y-6 animate-fade-in">
              <p className="text-sm text-bloom-muted mb-4">
                Please upload high-quality photos (Max 2MB per image). Required fields are marked with an asterisk (*).
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Head Shot 1 */}
                <div className="space-y-2">
                  <Label htmlFor="headShot1" className={`${hasError('headShot1') ? 'text-destructive' : ''}`}>
                    Head Shot 1*
                  </Label>
                  <Input
                    id="headShot1"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('headShot1', e.target.files)}
                    className={hasError('headShot1') ? 'border-destructive' : ''}
                  />
                  {formData.headShot1 && (
                    <p className="text-xs text-bloom-muted">File selected (Base64)</p>
                  )}
                  {getErrorMessage('headShot1') && (
                    <p className="text-xs text-destructive">{getErrorMessage('headShot1')}</p>
                  )}
                </div>
                
                {/* Head Shot 2 */}
                <div className="space-y-2">
                  <Label htmlFor="headShot2">
                    Head Shot 2 (Optional)
                  </Label>
                  <Input
                    id="headShot2"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('headShot2', e.target.files)}
                  />
                  {formData.headShot2 && (
                    <p className="text-xs text-bloom-muted">File selected (Base64)</p>
                  )}
                </div>
                
                {/* Body Shot 1 */}
                <div className="space-y-2">
                  <Label htmlFor="bodyShot1" className={`${hasError('bodyShot1') ? 'text-destructive' : ''}`}>
                    Body Shot 1*
                  </Label>
                  <Input
                    id="bodyShot1"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('bodyShot1', e.target.files)}
                    className={hasError('bodyShot1') ? 'border-destructive' : ''}
                  />
                  {formData.bodyShot1 && (
                    <p className="text-xs text-bloom-muted">File selected (Base64)</p>
                  )}
                  {getErrorMessage('bodyShot1') && (
                    <p className="text-xs text-destructive">{getErrorMessage('bodyShot1')}</p>
                  )}
                </div>
                
                {/* Body Shot 2 */}
                <div className="space-y-2">
                  <Label htmlFor="bodyShot2">
                    Body Shot 2 (Optional)
                  </Label>
                  <Input
                    id="bodyShot2"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('bodyShot2', e.target.files)}
                  />
                  {formData.bodyShot2 && (
                    <p className="text-xs text-bloom-muted">File selected (Base64)</p>
                  )}
                </div>
                
                {/* Additional Image 1 */}
                <div className="space-y-2">
                  <Label htmlFor="additionalImage1">
                    Additional Image 1 (Optional)
                  </Label>
                  <Input
                    id="additionalImage1"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('additionalImage1', e.target.files)}
                  />
                  {formData.additionalImage1 && (
                    <p className="text-xs text-bloom-muted">File selected (Base64)</p>
                  )}
                </div>
                
                {/* Additional Image 2 */}
                <div className="space-y-2">
                  <Label htmlFor="additionalImage2">
                    Additional Image 2 (Optional)
                  </Label>
                  <Input
                    id="additionalImage2"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('additionalImage2', e.target.files)}
                  />
                  {formData.additionalImage2 && (
                    <p className="text-xs text-bloom-muted">File selected (Base64)</p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Terms & Conditions Section */}
          {currentSection === 'terms' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-gray-50 p-6 rounded-lg border">
                <h3 className="font-semibold text-lg text-bloom-primary mb-4">General Terms and Conditions</h3>
                <p className="text-sm text-bloom-muted mb-3">
                  1. **Eligibility:** Participants must meet all specified eligibility criteria as outlined in the "Eligibility" section. Providing false information will result in immediate disqualification.<br />
                  2. **Conduct:** All participants are expected to conduct themselves in a respectful and professional manner at all times, both online and offline. Any behavior deemed inappropriate or detrimental to the organization's reputation will lead to disqualification.<br />
                  3. **Intellectual Property:** By participating, you grant Miss Bloom Global the right to use your submitted photos, videos, and personal statements for promotional and marketing purposes across all media channels.<br />
                  4. **Confidentiality:** All proprietary information, strategies, and internal communications of Miss Bloom Global are strictly confidential and must not be disclosed to third parties.<br />
                  5. **Travel:** Finalists must be available to travel internationally for the pageant finals. All travel and accommodation arrangements will be communicated in advance.<br />
                  6. **Health & Safety:** Participants must be in good physical and mental health. Any pre-existing medical conditions must be disclosed to the organization.<br />
                  7. **Disqualification:** Miss Bloom Global reserves the right to disqualify any participant who violates these terms and conditions, engages in unsportsmanlike conduct, or brings disrepute to the organization.<br />
                  8. **Changes to Terms:** Miss Bloom Global reserves the right to modify these terms and conditions at any time. Participants will be notified of any significant changes.
                </p>
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agreeTerms"
                  checked={agreeTerms}
                  onCheckedChange={(checked) => setAgreeTerms(checked === true)}
                  className={hasError('terms') ? 'border-destructive' : ''}
                />
                <label
                  htmlFor="agreeTerms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I have read and agree to the terms and conditions.*
                </label>
              </div>
              {getErrorMessage('terms') && (
                <p className="text-xs text-destructive pl-6">{getErrorMessage('terms')}</p>
              )}
            </div>
          )}
          
          {/* Personal Profile Section */}
          {currentSection === 'profile' && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <Label htmlFor="bio" className={`${hasError('bio') ? 'text-destructive' : ''}`}>
                  Bio* (Max 2500 characters)
                </Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleFieldChange('bio', e.target.value)}
                  onFocus={() => setFocused('bio')}
                  onBlur={() => setFocused(null)}
                  className={`min-h-[150px] transition-all ${focused === 'bio' ? 'border-bloom-gold ring-1 ring-bloom-gold/20' : ''} ${hasError('bio') ? 'border-destructive' : ''}`}
                />
                <div className="text-xs text-bloom-muted mt-1">
                  Characters: {formData.bio.length}/2500
                </div>
                {getErrorMessage('bio') && (
                  <p className="text-xs text-destructive">{getErrorMessage('bio')}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="socialMedia" className={`${hasError('socialMedia') ? 'text-destructive' : ''}`}>
                  Social Media Handles* (e.g., Instagram: @yourhandle, Facebook: yourname)
                </Label>
                <Textarea
                  id="socialMedia"
                  value={formData.socialMedia}
                  onChange={(e) => handleFieldChange('socialMedia', e.target.value)}
                  onFocus={() => setFocused('socialMedia')}
                  onBlur={() => setFocused(null)}
                  className={`min-h-[100px] transition-all ${focused === 'socialMedia' ? 'border-bloom-gold ring-1 ring-bloom-gold/20' : ''} ${hasError('socialMedia') ? 'border-destructive' : ''}`}
                />
                {getErrorMessage('socialMedia') && (
                  <p className="text-xs text-destructive">{getErrorMessage('socialMedia')}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="threeWords">
                  Three Words to Describe Yourself
                </Label>
                <Input
                  id="threeWords"
                  value={formData.threeWords}
                  onChange={(e) => handleFieldChange('threeWords', e.target.value)}
                  onFocus={() => setFocused('threeWords')}
                  onBlur={() => setFocused(null)}
                  className={`transition-all ${focused === 'threeWords' ? 'border-bloom-gold ring-1 ring-bloom-gold/20' : ''}`}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hobbies">
                  Hobbies & Interests
                </Label>
                <Textarea
                  id="hobbies"
                  value={formData.hobbies}
                  onChange={(e) => handleFieldChange('hobbies', e.target.value)}
                  onFocus={() => setFocused('hobbies')}
                  onBlur={() => setFocused(null)}
                  className={`min-h-[100px] transition-all ${focused === 'hobbies' ? 'border-bloom-gold ring-1 ring-bloom-gold/20' : ''}`}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pageantExperience">
                  Previous Pageant Experience (if any)
                </Label>
                <Textarea
                  id="pageantExperience"
                  value={formData.pageantExperience}
                  onChange={(e) => handleFieldChange('pageantExperience', e.target.value)}
                  onFocus={() => setFocused('pageantExperience')}
                  onBlur={() => setFocused(null)}
                  className={`min-h-[100px] transition-all ${focused === 'pageantExperience' ? 'border-bloom-gold ring-1 ring-bloom-gold/20' : ''}`}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="charity">
                  Charity Work or Community Involvement
                </Label>
                <Textarea
                  id="charity"
                  value={formData.charity}
                  onChange={(e) => handleFieldChange('charity', e.target.value)}
                  onFocus={() => setFocused('charity')}
                  onBlur={() => setFocused(null)}
                  className={`min-h-[100px] transition-all ${focused === 'charity' ? 'border-bloom-gold ring-1 ring-bloom-gold/20' : ''}`}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hearAboutUs">
                  How did you hear about Miss Bloom Global?
                </Label>
                <Input
                  id="hearAboutUs"
                  value={formData.hearAboutUs}
                  onChange={(e) => handleFieldChange('hearAboutUs', e.target.value)}
                  onFocus={() => setFocused('hearAboutUs')}
                  onBlur={() => setFocused(null)}
                  className={`transition-all ${focused === 'hearAboutUs' ? 'border-bloom-gold ring-1 ring-bloom-gold/20' : ''}`}
                />
              </div>
            </div>
          )}
          
          {/* Country Information Section */}
          {currentSection === 'countryInfo' && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <Label htmlFor="countryOverview" className={`${hasError('countryOverview') ? 'text-destructive' : ''}`}>
                  Overview of Your Country* (Max 2500 characters)
                </Label>
                <Textarea
                  id="countryOverview"
                  value={formData.countryOverview}
                  onChange={(e) => handleFieldChange('countryOverview', e.target.value)}
                  onFocus={() => setFocused('countryOverview')}
                  onBlur={() => setFocused(null)}
                  className={`min-h-[150px] transition-all ${focused === 'countryOverview' ? 'border-bloom-gold ring-1 ring-bloom-gold/20' : ''} ${hasError('countryOverview') ? 'border-destructive' : ''}`}
                />
                <div className="text-xs text-bloom-muted mt-1">
                  Characters: {formData.countryOverview.length}/2500
                </div>
                {getErrorMessage('countryOverview') && (
                  <p className="text-xs text-destructive">{getErrorMessage('countryOverview')}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="culturalInfo" className={`${hasError('culturalInfo') ? 'text-destructive' : ''}`}>
                  Cultural and Custom Information* (Max 2500 characters)
                </Label>
                <Textarea
                  id="culturalInfo"
                  value={formData.culturalInfo}
                  onChange={(e) => handleFieldChange('culturalInfo', e.target.value)}
                  onFocus={() => setFocused('culturalInfo')}
                  onBlur={() => setFocused(null)}
                  className={`min-h-[150px] transition-all ${focused === 'culturalInfo' ? 'border-bloom-gold ring-1 ring-bloom-gold/20' : ''} ${hasError('culturalInfo') ? 'border-destructive' : ''}`}
                />
                <div className="text-xs text-bloom-muted mt-1">
                  Characters: {formData.culturalInfo.length}/2500
                </div>
                {getErrorMessage('culturalInfo') && (
                  <p className="text-xs text-destructive">{getErrorMessage('culturalInfo')}</p>
                )}
              </div>
            </div>
          )}
          
          {/* Review & Submit Section */}
          {currentSection === 'review' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-lg font-semibold text-bloom-primary mb-4">Review Your Application</h3>
              <p className="text-sm text-bloom-muted mb-6">
                Please review all the information you have provided before submitting your application.
                Ensure all required fields are filled and all eligibility criteria are met.
              </p>
              
              <div className="space-y-4">
                {formSections.filter(s => s.id !== 'review').map(section => (
                  <div key={section.id} className="border p-4 rounded-md bg-gray-50">
                    <h4 className="font-medium text-bloom-primary mb-2">{section.title}</h4>
                    <ul className="text-sm text-bloom-muted list-disc pl-5">
                      {Object.keys(formData).map((key) => {
                        if (
                          (section.id === 'contact' && ['firstName', 'lastName', 'email', 'phone', 'country', 'city'].includes(key)) ||
                          (section.id === 'personal' && ['ethnicity', 'representCountry', 'height', 'weight'].includes(key)) ||
                          (section.id === 'background' && ['schoolAttended', 'fieldOfStudy', 'highestEducation', 'experience', 'education', 'skills'].includes(key)) ||
                          (section.id === 'motivation' && ['motivation', 'goals'].includes(key)) ||
                          (section.id === 'business' && ['strategy'].includes(key)) ||
                          (section.id === 'profile' && ['bio', 'socialMedia', 'threeWords'].includes(key)) ||
                          (section.id === 'countryInfo' && ['countryOverview', 'culturalInfo'].includes(key)) ||
                          (section.id === 'eligibility' && ['dateOfBirth', 'isEligible', 'hasValidPassport', 'canTravel', 'isGoodHealth', 'willFollowRules'].includes(key))
                        ) {
                          const value = formData[key as keyof ApplicationFormData];
                          let displayValue = '';
                          if (typeof value === 'boolean') {
                            displayValue = value ? 'Yes' : 'No';
                          } else if (typeof value === 'string' && value.startsWith('data:image/')) {
                            displayValue = `Image data present (Base64)`; // Indicate Base64 image
                          } else {
                            displayValue = value?.toString() || 'N/A';
                          }
                          return (
                            <li key={key}>
                              <span className="font-semibold">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span> {displayValue}
                            </li>
                          );
                        }
                        return null;
                      })}
                      {section.id === 'terms' && (
                        <li><span className="font-semibold">Agreed to Terms:</span> {agreeTerms ? 'Yes' : 'No'}</li>
                      )}
                      {section.id === 'photos' && (
                        <>
                          <li><span className="font-semibold">Head Shot 1:</span> {formData.headShot1 ? 'Image uploaded' : 'Not provided'}</li>
                          <li><span className="font-semibold">Head Shot 2:</span> {formData.headShot2 ? 'Image uploaded' : 'Not provided'}</li>
                          <li><span className="font-semibold">Body Shot 1:</span> {formData.bodyShot1 ? 'Image uploaded' : 'Not provided'}</li>
                          <li><span className="font-semibold">Body Shot 2:</span> {formData.bodyShot2 ? 'Image uploaded' : 'Not provided'}</li>
                          <li><span className="font-semibold">Additional Image 1:</span> {formData.additionalImage1 ? 'Image uploaded' : 'Not provided'}</li>
                          <li><span className="font-semibold">Additional Image 2:</span> {formData.additionalImage2 ? 'Image uploaded' : 'Not provided'}</li>
                        </>
                      )}
                    </ul>
                  </div>
                ))}
              </div>
              
              {errors.length > 0 && (
                <div className="bg-red-50 border border-destructive text-destructive p-4 rounded-md">
                  <p className="font-medium mb-2">Please correct the following errors:</p>
                  <ul className="list-disc pl-5 text-sm">
                    {errors.map((error, index) => (
                      <li key={index}>{error.message}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentSection === formSections[0].id}
          >
            <ChevronLeft size={16} className="mr-2" /> Previous
          </Button>
          
          {currentSection !== formSections[formSections.length - 1].id ? (
            <Button onClick={handleNext}>
              Next <ChevronRight size={16} className="ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  Submit Application <Check size={16} className="ml-2" />
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default ApplicationForm;
