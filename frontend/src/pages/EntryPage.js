import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Terminal } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const EntryPage = ({ onLogin }) => {
  const [placeId, setPlaceId] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!placeId || !userId) {
      toast.error('Please enter both Place ID and User ID');
      return;
    }

    setLoading(true);

    try {
      // Verify user exists
      const response = await fetch(`${BACKEND_URL}/api/v1/user/${userId}`);
      const userData = await response.json();

      onLogin({
        placeId: parseInt(placeId),
        userId: parseInt(userId),
        username: userData.username,
        displayName: userData.displayName
      });

      toast.success(`Welcome, ${userData.displayName}!`);
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to verify user. Please check your User ID.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Background glows */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-glow rounded-full opacity-30"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-glow rounded-full opacity-30"></div>
      
      <Card className="w-full max-w-md bg-black/40 backdrop-blur-xl border-white/10 glow-red" data-testid="entry-card">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Terminal className="w-12 h-12 text-[#ef4444]" />
          </div>
          <CardTitle className="text-4xl font-bold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            Script Commander
          </CardTitle>
          <CardDescription className="text-muted-foreground/80">
            Enter your Roblox credentials to access the panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="placeId" className="text-sm font-medium">
                Place ID
              </Label>
              <Input
                id="placeId"
                type="number"
                placeholder="Enter Place ID"
                value={placeId}
                onChange={(e) => setPlaceId(e.target.value)}
                className="bg-input/50 border-transparent focus:border-primary focus:ring-1 focus:ring-primary"
                data-testid="place-id-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userId" className="text-sm font-medium">
                User ID
              </Label>
              <Input
                id="userId"
                type="number"
                placeholder="Enter User ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="bg-input/50 border-transparent focus:border-primary focus:ring-1 focus:ring-primary"
                data-testid="user-id-input"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all duration-300"
              disabled={loading}
              data-testid="enter-button"
            >
              {loading ? 'Verifying...' : 'Enter Dashboard'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EntryPage;
