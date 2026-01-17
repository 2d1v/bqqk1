import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, Play } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ScriptHub = ({ sessionData }) => {
  const navigate = useNavigate();
  const [scripts, setScripts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScripts();
  }, []);

  const fetchScripts = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/scripts`);
      const data = await response.json();
      setScripts(data);
    } catch (error) {
      toast.error('Failed to load scripts');
    } finally {
      setLoading(false);
    }
  };

  const executeScript = async (script) => {
    toast.success(`Executing: ${script.title}`);
    // In a real scenario, this would send the script to Roblox
  };

  const categoryColors = {
    Admin: 'bg-red-500/20 text-red-400 border-red-500/50',
    Troll: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
    Fun: 'bg-green-500/20 text-green-400 border-green-500/50'
  };

  return (
    <div className="min-h-screen p-6 md:p-12" style={{ fontFamily: 'Inter, sans-serif' }} data-testid="script-hub">
      {/* Background glows */}
      <div className="absolute top-40 right-40 w-96 h-96 bg-glow rounded-full opacity-20 pointer-events-none"></div>

      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} data-testid="back-button">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-4xl md:text-5xl font-bold text-glow" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          Script Hub
        </h1>
      </div>

      {/* Scripts Grid */}
      {loading ? (
        <p className="text-muted-foreground">Loading scripts...</p>
      ) : scripts.length === 0 ? (
        <Card className="bg-black/40 backdrop-blur-md border-white/10 p-8 text-center">
          <p className="text-muted-foreground">No scripts available yet. Check back soon!</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scripts.map((script) => (
            <Card 
              key={script.id} 
              className="bg-black/40 backdrop-blur-md border-white/10 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] transition-all duration-300 transform hover:-translate-y-1"
              data-testid={`script-card-${script.id}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <CardTitle style={{ fontFamily: 'JetBrains Mono, monospace' }}>{script.title}</CardTitle>
                  <Badge className={categoryColors[script.category]}>{script.category}</Badge>
                </div>
                <CardDescription>{script.subtitle}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => executeScript(script)} 
                  className="w-full bg-primary hover:bg-primary/90 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                  data-testid={`execute-script-${script.id}`}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Execute
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScriptHub;
