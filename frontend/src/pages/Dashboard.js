import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, FileText, Sparkles, LogOut, Cpu } from 'lucide-react';

const Dashboard = ({ sessionData }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('roblox_session');
    window.location.reload();
  };

  const stats = [
    { label: 'Place ID', value: sessionData.placeId, icon: Cpu },
    { label: 'User ID', value: sessionData.userId, icon: Cpu },
  ];

  return (
    <div className="min-h-screen p-6 md:p-12" style={{ fontFamily: 'Inter, sans-serif' }} data-testid="dashboard">
      {/* Background glows */}
      <div className="absolute top-40 right-40 w-96 h-96 bg-glow rounded-full opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-40 left-40 w-96 h-96 bg-glow rounded-full opacity-20 pointer-events-none"></div>

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-glow" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            Welcome back, {sessionData.displayName}!
          </h1>
          <p className="text-muted-foreground mt-2">@{sessionData.username}</p>
        </div>
        <Button 
          onClick={handleLogout} 
          variant="ghost" 
          className="hover:bg-accent hover:text-accent-foreground"
          data-testid="logout-button"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <Card key={idx} className="bg-black/40 backdrop-blur-md border-white/10 hover:shadow-[0_0_20px_rgba(239,68,68,0.1)] transition-all duration-300">
            <CardContent className="p-6 flex items-center space-x-4">
              <stat.icon className="w-8 h-8 text-[#ef4444]" />
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card 
          className="bg-black/40 backdrop-blur-md border-white/10 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
          onClick={() => navigate('/editor')}
          data-testid="navigate-editor"
        >
          <CardHeader>
            <Code className="w-10 h-10 text-[#ef4444] mb-4" />
            <CardTitle style={{ fontFamily: 'JetBrains Mono, monospace' }}>Script Editor</CardTitle>
            <CardDescription>Write and execute Luau scripts with AI assistance</CardDescription>
          </CardHeader>
        </Card>

        <Card 
          className="bg-black/40 backdrop-blur-md border-white/10 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
          onClick={() => navigate('/scripts')}
          data-testid="navigate-scripts"
        >
          <CardHeader>
            <FileText className="w-10 h-10 text-[#ef4444] mb-4" />
            <CardTitle style={{ fontFamily: 'JetBrains Mono, monospace' }}>Script Hub</CardTitle>
            <CardDescription>Browse and execute pre-made scripts</CardDescription>
          </CardHeader>
        </Card>

        <Card className="bg-black/40 backdrop-blur-md border-white/10 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] transition-all duration-300">
          <CardHeader>
            <Sparkles className="w-10 h-10 text-[#ef4444] mb-4" />
            <CardTitle style={{ fontFamily: 'JetBrains Mono, monospace' }}>AI Assistant</CardTitle>
            <CardDescription>Available in Script Editor</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
