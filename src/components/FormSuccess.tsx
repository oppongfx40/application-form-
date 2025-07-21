import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from 'lucide-react';

const FormSuccess: React.FC = () => {
  return (
    <div className="w-full max-w-md mx-auto py-12 animate-fade-in">
      <div className="flex items-center justify-center mb-8">
        <div className="relative">
          <h1 className="text-3xl font-light text-center text-bloom-primary">
            Miss Bloom <span className="font-medium">Global</span>
          </h1>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-0.5 bg-bloom-gold"></div>
        </div>
      </div>
      
      <Card className="w-full shadow-lg border-0 neo-shadow overflow-hidden">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-bloom-gold/10 rounded-full flex items-center justify-center text-bloom-gold animate-fade-in">
              <CheckCircle2 size={48} />
            </div>
          </div>
          <CardTitle className="text-2xl font-medium">Application Submitted</CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-4 text-bloom-muted">
          <p>Thank you for applying to become a National Director for Miss Bloom Global.</p>
          <p>We've received your application and will review it shortly.</p>
          <p className="text-sm">You'll receive a confirmation email with more details at the email address you provided.</p>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4 pt-4">
          <div className="w-full border border-bloom-accent rounded-md p-4 bg-bloom-accent/30">
            <h3 className="font-medium text-sm mb-2">What's Next?</h3>
            <ul className="text-sm space-y-2 text-bloom-muted">
              <li className="flex items-start">
                <span className="mr-2 text-bloom-gold">1.</span>
                <span>Our team will review your application within 5-7 business days.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-bloom-gold">2.</span>
                <span>If selected, you'll be contacted for an interview.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-bloom-gold">3.</span>
                <span>Final selections will be announced on our official channels.</span>
              </li>
            </ul>
          </div>
          
          <Button 
            onClick={() => window.location.href = '/'}
            className="w-full bg-bloom-primary hover:bg-bloom-primary/90 hover-lift"
          >
            Return to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default FormSuccess;