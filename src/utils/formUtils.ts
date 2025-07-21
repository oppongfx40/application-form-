// Form validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  // Simple validation to check if phone has at least 10 digits
  const phoneRegex = /^\+?[\d\s\-()]{8,}$/;
  return phoneRegex.test(phone);
};

export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

export const validateMaxLength = (value: string, maxLength: number): boolean => {
  return value.length <= maxLength;
};

export interface FormError {
  field: string;
  message: string;
}

export const validatePaymentForm = (data: {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  name: string;
}): FormError[] => {
  const errors: FormError[] = [];
  
  // Validate card number (simple check for now - would use a library in production)
  if (!data.cardNumber || data.cardNumber.replace(/\s/g, '').length !== 16) {
    errors.push({ field: 'cardNumber', message: 'Please enter a valid 16-digit card number' });
  }
  
  // Validate expiry date (MM/YY format)
  const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
  if (!expiryRegex.test(data.expiryDate)) {
    errors.push({ field: 'expiryDate', message: 'Please enter a valid expiry date (MM/YY)' });
  } else {
    // Check if card is expired
    const [month, year] = data.expiryDate.split('/');
    const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
    const today = new Date();
    if (expiryDate < today) {
      errors.push({ field: 'expiryDate', message: 'Card is expired' });
    }
  }
  
  // Validate CVV (3 or 4 digits)
  if (!/^[0-9]{3,4}$/.test(data.cvv)) {
    errors.push({ field: 'cvv', message: 'Please enter a valid CVV' });
  }
  
  // Validate cardholder name
  if (!validateRequired(data.name)) {
    errors.push({ field: 'name', message: 'Please enter the cardholder name' });
  }
  
  return errors;
};

export interface ApplicationFormData {
  // Basic info
  firstName: string;
  middleName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  homePhone: string;
  country: string;
  city: string;
  street: string;
  addressLine2: string;
  stateRegion: string;
  zipCode: string;
  
  // Background
  experience: string;
  education: string;
  skills: string;
  
  // Motivation
  motivation: string;
  goals: string;
  
  // Business plan
  strategy: string;
  
  // Personal details
  dateOfBirth: string;
  age: string;
  ethnicity: string;
  representCountry: string;
  alternateCountry: string;
  bio: string;
  socialMedia: string;
  
  // Physical measurements
  height: string;
  weight: string;
  bust: string;
  waist: string;
  hips: string;
  dressSize: string;
  shoeSize: string;
  swimsuitSizeTop: string;
  swimsuitSizeBottom: string;
  
  // Education & interests
  schoolAttended: string;
  fieldOfStudy: string;
  highestEducation: string;
  threeWords: string;
  hobbies: string;
  pageantExperience: string;
  charity: string;
  hearAboutUs: string;
  
  // Photos
  headShot1: File | null;
  headShot2: File | null;
  bodyShot1: File | null;
  bodyShot2: File | null;
  additionalImage1: File | null;
  additionalImage2: File | null;
  
  // Country info
  countryOverview: string;
  culturalInfo: string;
  
  // Eligibility
  isEligible: boolean;
  hasValidPassport: boolean;
  canTravel: boolean;
  isGoodHealth: boolean;
  willFollowRules: boolean;
}

export const validateApplicationForm = (
  data: Partial<ApplicationFormData>,
  currentSection: string
): FormError[] => {
  const errors: FormError[] = [];
  
  // Contact Information section validation
  if (currentSection === 'contact') {
    if (!validateRequired(data.firstName || '')) {
      errors.push({ field: 'firstName', message: 'First name is required' });
    }
    
    if (!validateRequired(data.lastName || '')) {
      errors.push({ field: 'lastName', message: 'Last name is required' });
    }
    
    if (!validateEmail(data.email || '')) {
      errors.push({ field: 'email', message: 'Please enter a valid email address' });
    }
    
    if (!validatePhone(data.phone || '')) {
      errors.push({ field: 'phone', message: 'Please enter a valid phone number' });
    }
    
    if (!validateRequired(data.country || '')) {
      errors.push({ field: 'country', message: 'Country is required' });
    }
    
    if (!validateRequired(data.city || '')) {
      errors.push({ field: 'city', message: 'City is required' });
    }
  }
  
  // Eligibility section validation
  if (currentSection === 'eligibility') {
    if (data.isEligible !== true) {
      errors.push({ field: 'isEligible', message: 'You must confirm your eligibility to proceed' });
    }
    
    if (data.hasValidPassport !== true) {
      errors.push({ field: 'hasValidPassport', message: 'You must have a valid international passport' });
    }
    
    if (data.canTravel !== true) {
      errors.push({ field: 'canTravel', message: 'You must be available to travel' });
    }
    
    if (data.isGoodHealth !== true) {
      errors.push({ field: 'isGoodHealth', message: 'You must be in good physical and mental health' });
    }
    
    if (data.willFollowRules !== true) {
      errors.push({ field: 'willFollowRules', message: 'You must commit to follow pageant rules and regulations' });
    }
  }
  
  // Personal Information section validation
  if (currentSection === 'personal') {
    if (!validateRequired(data.dateOfBirth || '')) {
      errors.push({ field: 'dateOfBirth', message: 'Date of birth is required' });
    }
    
    if (!validateRequired(data.ethnicity || '')) {
      errors.push({ field: 'ethnicity', message: 'Ethnicity is required' });
    }
    
    if (!validateRequired(data.representCountry || '')) {
      errors.push({ field: 'representCountry', message: 'Country to represent is required' });
    }
    
    if (!validateRequired(data.height || '')) {
      errors.push({ field: 'height', message: 'Height is required' });
    }
    
    if (!validateRequired(data.weight || '')) {
      errors.push({ field: 'weight', message: 'Weight is required' });
    }
  }
  
  // Background section validation
  if (currentSection === 'background') {
    if (!validateRequired(data.experience || '')) {
      errors.push({ field: 'experience', message: 'Work experience information is required' });
    }
    
    if (!validateRequired(data.education || '')) {
      errors.push({ field: 'education', message: 'Education information is required' });
    }
    
    if (!validateRequired(data.skills || '')) {
      errors.push({ field: 'skills', message: 'Skills information is required' });
    }
  }
  
  // Motivation section validation
  if (currentSection === 'motivation') {
    if (!validateRequired(data.motivation || '')) {
      errors.push({ field: 'motivation', message: 'Motivation information is required' });
    }
    
    if (!validateRequired(data.goals || '')) {
      errors.push({ field: 'goals', message: 'Goals information is required' });
    }
  }
  
  // Business Plan section validation
  if (currentSection === 'business') {
    if (!validateRequired(data.strategy || '')) {
      errors.push({ field: 'strategy', message: 'Strategy information is required' });
    }
  }
  
  // Profile section validation
  if (currentSection === 'profile') {
    if (!validateRequired(data.dateOfBirth || '')) {
      errors.push({ field: 'dateOfBirth', message: 'Date of birth is required' });
    }
    
    if (!validateRequired(data.bio || '')) {
      errors.push({ field: 'bio', message: 'Bio is required' });
    }
    
    if (data.bio && !validateMaxLength(data.bio, 500)) {
      errors.push({ field: 'bio', message: 'Bio must be 500 words or less' });
    }
    
    if (!validateRequired(data.socialMedia || '')) {
      errors.push({ field: 'socialMedia', message: 'Social media information is required' });
    }
  }
  
  // Photos section validation
  if (currentSection === 'photos') {
    if (!data.headShot1) {
      errors.push({ field: 'headShot1', message: 'Head shot #1 is required' });
    }
    
    if (!data.headShot2) {
      errors.push({ field: 'headShot2', message: 'Head shot #2 is required' });
    }
    
    if (!data.bodyShot1) {
      errors.push({ field: 'bodyShot1', message: 'Body shot #1 is required' });
    }
    
    if (!data.bodyShot2) {
      errors.push({ field: 'bodyShot2', message: 'Body shot #2 is required' });
    }
  }
  
  // Country Info section validation
  if (currentSection === 'countryInfo') {
    if (!validateRequired(data.countryOverview || '')) {
      errors.push({ field: 'countryOverview', message: 'Country overview is required' });
    }
    
    if (data.countryOverview && !validateMaxLength(data.countryOverview, 500)) {
      errors.push({ field: 'countryOverview', message: 'Country overview must be 500 words or less' });
    }
    
    if (!validateRequired(data.culturalInfo || '')) {
      errors.push({ field: 'culturalInfo', message: 'Cultural information is required' });
    }
    
    if (data.culturalInfo && !validateMaxLength(data.culturalInfo, 500)) {
      errors.push({ field: 'culturalInfo', message: 'Cultural information must be 500 words or less' });
    }
  }
  
  return errors;
};

// Function to count words in a string
export const countWords = (text: string): number => {
  return text.trim().split(/\s+/).filter(Boolean).length;
};

// Format credit card number with spaces
export const formatCardNumber = (value: string): string => {
  return value
    .replace(/\s/g, '')
    .replace(/(\d{4})/g, '$1 ')
    .trim();
};

// Format expiry date as MM/YY
export const formatExpiryDate = (value: string): string => {
  const cleaned = value.replace(/[^\d]/g, '');
  if (cleaned.length <= 2) {
    return cleaned;
  } else {
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
  }
};

// Calculate age from date of birth
export const calculateAge = (dateOfBirth: string): number => {
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  
  return age;
};

// Check if age is between min and max
export const isAgeInRange = (dateOfBirth: string, min: number, max: number): boolean => {
  const age = calculateAge(dateOfBirth);
  return age >= min && age <= max;
};