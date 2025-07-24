import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from 'lucide-react'; // Assuming you have lucide-react installed

const SuccessPage: React.FC = () => {
  return (
    <div className="w-full max-w-md mx-auto p-4 animate-fade-in">
      <Card className="text-center shadow-lg border-0 neo-shadow">
        <CardHeader className="space-y-4 pt-8 pb-4">
          <CheckCircle size={64} className="text-green-500 mx-auto animate-bounce-in" />
          <CardTitle className="text-3xl font-bold text-bloom-primary">Application Submitted!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pb-8">
          <p className="text-lg text-gray-700">
            Thank you for submitting your application to Miss Bloom Global.
          </p>
          <p className="text-md text-gray-600">
            We have received your details and will review them carefully. You will be contacted via email within 5-7 business days regarding the next steps.
          </p>
          <p className="text-sm text-gray-500">
            Please check your spam folder if you don't hear from us.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuccessPage;
