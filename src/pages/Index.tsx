import React, { useState } from 'react';
import ApplicationForm from '../components/ApplicationForm'; // Participant Application form
import DirectorApplicationForm from '../components/DirectorApplicationForm'; // National Director Application form
import PaymentForm from '../components/PaymentForm'; // Payment form
import { CheckCircle } from 'lucide-react'; // For success icon

// Main application component
const Index = () => {
  // State to manage which view is currently active:
  // 'selection': User chooses application type
  // 'participantApplication': User fills out the participant form
  // 'directorApplication': User fills out the director form
  // 'payment': User makes payment (for either application type)
  // 'finalSuccess': Generic success screen after payment
  const [currentView, setCurrentView] = useState<'selection' | 'participantApplication' | 'directorApplication' | 'payment' | 'finalSuccess'>('selection');

  // State to track which application type was chosen, to show relevant success message
  const [applicationTypeSubmitted, setApplicationTypeSubmitted] = useState<'participant' | 'director' | null>(null);

  // Handlers for navigating between views
  const handleSelectParticipant = () => {
    setApplicationTypeSubmitted('participant');
    setCurrentView('participantApplication');
  };
  const handleSelectDirector = () => {
    setApplicationTypeSubmitted('director');
    setCurrentView('directorApplication');
  };
  const handleBackToSelection = () => {
    setApplicationTypeSubmitted(null); // Reset type on going back to selection
    setCurrentView('selection');
  };

  // Callback for when either application form is successfully submitted (leads to payment)
  const handleApplicationFormSubmitted = () => {
    setTimeout(() => setCurrentView('payment'), 0); // Defer state update
  };

  // Callback for when payment is successful
  const handlePaymentSuccess = () => {
    setTimeout(() => setCurrentView('finalSuccess'), 0); // Defer state update
  };

  // Callback for going back from payment (returns to the specific application form)
  const handleBackFromPayment = () => {
    if (applicationTypeSubmitted === 'participant') {
      setCurrentView('participantApplication');
    } else if (applicationTypeSubmitted === 'director') {
      setCurrentView('directorApplication');
    } else {
      setCurrentView('selection'); // Fallback in case type is not set
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bloom-background-light to-bloom-background-dark flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Initial Application Type Selection Screen */}
      {currentView === 'selection' && (
        <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center animate-fade-in">
          <h2 className="text-3xl font-bold text-bloom-primary mb-6">Choose Your Application Type</h2>
          <p className="text-bloom-muted mb-8">
            Please select the type of application you wish to complete.
          </p>
          <div className="space-y-4">
            <button
              onClick={handleSelectParticipant}
              className="w-full bg-bloom-primary text-white py-3 rounded-md font-semibold hover:bg-bloom-primary/90 transition-colors duration-200"
            >
              Participant Application
            </button>
            <button
              onClick={handleSelectDirector}
              className="w-full bg-bloom-gold text-bloom-primary py-3 rounded-md font-semibold hover:bg-bloom-gold/80 transition-colors duration-200"
            >
              National Director Application
            </button>
          </div>
        </div>
      )}

      {/* Participant Application Form */}
      {currentView === 'participantApplication' && (
        <ApplicationForm onSubmitSuccess={handleApplicationFormSubmitted} onBack={handleBackToSelection} />
      )}

      {/* National Director Application Form */}
      {currentView === 'directorApplication' && (
        <DirectorApplicationForm onSubmitSuccess={handleApplicationFormSubmitted} onBack={handleBackToSelection} />
      )}

      {/* Payment Form (for both application types) */}
      {currentView === 'payment' && (
        <PaymentForm 
          onPaymentSuccess={handlePaymentSuccess} 
          onBack={handleBackFromPayment} // Use the unified back handler
        />
      )}

      {/* Final Success Screen (for both application types) */}
      {currentView === 'finalSuccess' && (
        <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center animate-fade-in">
          <CheckCircle size={64} className="text-green-500 mx-auto mb-6 animate-bounce-in" />
          <h2 className="text-3xl font-bold text-bloom-primary mb-4">
            {applicationTypeSubmitted === 'participant' ? 'Participant Application' : 'National Director Application'} Complete!
          </h2>
          <p className="text-bloom-muted mb-6">
            Thank you for completing your {applicationTypeSubmitted === 'participant' ? 'participant' : 'National Director'} application and payment.
          </p>
          <p className="text-bloom-muted mb-8">
            We will review your application and contact you soon.
          </p>
          <button
            onClick={handleBackToSelection}
            className="bg-bloom-primary text-white py-2 px-6 rounded-md font-semibold hover:bg-bloom-primary/90 transition-colors duration-200"
          >
            Start New Application
          </button>
        </div>
      )}
    </div>
  );
};

export default Index;
