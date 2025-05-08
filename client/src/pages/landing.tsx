
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Landing() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();
  
  const handleLogin = async () => {
    if (!email.endsWith("@adelphi.edu")) {
      toast({
        title: "Invalid Email",
        description: "Please use your Adelphi University email address",
        variant: "destructive"
      });
      return;
    }
    // TODO: Implement auth login
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-adelphi-gold/10 to-adelphi-brown/10">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <h1 className="text-4xl font-bold text-adelphi-brown">
              Welcome to Bridges at Adelphi
            </h1>
            <div className="prose max-w-none">
              <p className="text-lg">
                The Bridges to Adelphi program provides individualized comprehensive support services to students who would benefit from enhanced academic, social, and vocational support.
              </p>
              
              <h2 className="text-2xl font-semibold mt-8">Our Support Services</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Academic Support (Learning Strategist)</li>
                <li>Vocational Counseling</li>
                <li>Social Coaching</li>
                <li>Academic Coaching</li>
                <li>Regular Check-ins</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8">Platform Features</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Smart Scheduling System</li>
                <li>Real-time Room Allocation</li>
                <li>Integrated Messaging</li>
                <li>Remote Session Support</li>
                <li>Collaborative Notes & Comments</li>
              </ul>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Sign In</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="your.email@adelphi.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Button 
                    className="w-full bg-adelphi-brown hover:bg-adelphi-brown/90"
                    onClick={handleLogin}
                  >
                    Continue with Adelphi Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
