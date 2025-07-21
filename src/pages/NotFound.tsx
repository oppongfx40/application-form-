
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <Card className="w-full max-w-md shadow-lg border-0 neo-shadow">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-light">
            <span className="text-bloom-gold">404</span> | Page Not Found
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center pb-6">
          <p className="text-bloom-muted">
            The page you are looking for doesn't exist or has been moved.
          </p>
        </CardContent>
        
        <CardFooter className="flex justify-center">
          <Button
            onClick={() => window.location.href = '/'}
            className="bg-bloom-primary hover:bg-bloom-primary/90 hover-lift"
          >
            Return to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default NotFound;