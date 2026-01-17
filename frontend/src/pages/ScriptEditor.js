import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Play, Plus, X, ArrowLeft, Bot, Send, Terminal } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const AUTH_KEY = 'Āă↺↙₥Ⅱ₲ď℉⁐ↈă﷼↙ɱə';

const ScriptEditor = ({ sessionData }) => {
  const navigate = useNavigate();
  const [tabs, setTabs] = useState([{ id: 'script1', name: 'script1.lua', content: '-- Write your Luau code here\nprint("Hello, Roblox!")' }]);
  const [activeTab, setActiveTab] = useState('script1');
  const [output, setOutput] = useState([]);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState([]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const editorRef = useRef(null);

  const currentTab = tabs.find(t => t.id === activeTab);

  const addLog = (type, message) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    const icons = {
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      success: '✅'
    };
    setOutput(prev => [...prev, { type, message, timestamp, icon: icons[type] || 'ℹ️' }]);
  };

  const handleExecute = async () => {
    if (!currentTab?.content) {
      toast.error('No code to execute');
      return;
    }

    addLog('info', 'Executing script...');

    try {
      const url = `${BACKEND_URL}/api/v1/place?id=${sessionData.placeId}&user?id=${sessionData.userId}&auth?key=${AUTH_KEY}`;
      
      // Update script data
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          CanExecutable: true,
          Source: currentTab.content
        })
      });

      addLog('success', 'Script sent to Roblox successfully!');
      toast.success('Script executed!');
    } catch (error) {
      addLog('error', `Failed to execute: ${error.message}`);
      toast.error('Execution failed');
    }
  };

  const addTab = () => {
    const newId = `script${tabs.length + 1}`;
    const newTab = {
      id: newId,
      name: `script${tabs.length + 1}.lua`,
      content: '-- New script\n'
    };
    setTabs([...tabs, newTab]);
    setActiveTab(newId);
  };

  const closeTab = (tabId, e) => {
    e.stopPropagation();
    if (tabs.length === 1) {
      toast.error('Cannot close the last tab');
      return;
    }
    const newTabs = tabs.filter(t => t.id !== tabId);
    setTabs(newTabs);
    if (activeTab === tabId) {
      setActiveTab(newTabs[0].id);
    }
  };

  const updateTabContent = (content) => {
    setTabs(tabs.map(t => t.id === activeTab ? { ...t, content } : t));
  };

  const sendAiMessage = async () => {
    if (!aiInput.trim()) return;

    const userMsg = { role: 'user', content: aiInput };
    setAiMessages([...aiMessages, userMsg]);
    setAiInput('');
    setAiLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: aiInput })
      });

      const data = await response.json();
      setAiMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      toast.error('AI request failed');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background" style={{ fontFamily: 'Inter, sans-serif' }} data-testid="script-editor">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-black/40 backdrop-blur-md">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} data-testid="back-button">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Script Editor</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            onClick={() => setAiOpen(!aiOpen)} 
            variant={aiOpen ? 'default' : 'secondary'}
            className={aiOpen ? 'glow-red' : ''}
            data-testid="toggle-ai-button"
          >
            <Bot className="w-4 h-4 mr-2" />
            AI Assistant
          </Button>
          <Button 
            onClick={handleExecute} 
            className="bg-primary hover:bg-primary/90 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
            data-testid="execute-button"
          >
            <Play className="w-4 h-4 mr-2" />
            Execute
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Section */}
        <div className="flex-1 flex flex-col">
          {/* Tabs */}
          <div className="flex items-center bg-secondary/50 border-b border-border px-2 overflow-x-auto">
            {tabs.map(tab => (
              <div
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 cursor-pointer border-r border-border ${
                  activeTab === tab.id ? 'bg-background' : 'hover:bg-background/50'
                }`}
                data-testid={`tab-${tab.id}`}
              >
                <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{tab.name}</span>
                <X 
                  className="w-3 h-3 hover:text-red-500" 
                  onClick={(e) => closeTab(tab.id, e)}
                  data-testid={`close-tab-${tab.id}`}
                />
              </div>
            ))}
            <Button variant="ghost" size="sm" onClick={addTab} className="ml-2" data-testid="add-tab-button">
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1">
            <Editor
              height="100%"
              defaultLanguage="lua"
              theme="vs-dark"
              value={currentTab?.content}
              onChange={updateTabContent}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                fontFamily: 'Fira Code, JetBrains Mono, monospace',
                fontLigatures: true,
                scrollBeyondLastLine: false,
                automaticLayout: true
              }}
              onMount={(editor) => {
                editorRef.current = editor;
              }}
            />
          </div>

          {/* Output Console */}
          <Card className="m-4 bg-black/60 border-white/10" data-testid="output-console">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <Terminal className="w-4 h-4 mr-2" />
                Output Console
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-32">
                <div className="console-output space-y-1">
                  {output.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No output yet...</p>
                  ) : (
                    output.map((log, idx) => (
                      <div key={idx} className={`log-${log.type}`}>
                        {log.icon} [{log.timestamp}] {log.message}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* AI Assistant Panel */}
        {aiOpen && (
          <Card className="w-96 m-4 bg-black/60 border-white/10 flex flex-col" data-testid="ai-panel">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <Bot className="w-4 h-4 mr-2" />
                AI Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <ScrollArea className="flex-1 mb-4 pr-4">
                <div className="space-y-4">
                  {aiMessages.length === 0 ? (
                    <p className="text-muted-foreground text-sm">Ask me anything about Luau scripting!</p>
                  ) : (
                    aiMessages.map((msg, idx) => (
                      <div key={idx} className={`p-3 rounded-lg ${
                        msg.role === 'user' ? 'bg-primary/20 ml-4' : 'bg-secondary/50 mr-4'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    ))
                  )}
                  {aiLoading && (
                    <div className="bg-secondary/50 p-3 rounded-lg mr-4">
                      <p className="text-sm text-muted-foreground">Thinking...</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="flex space-x-2">
                <Input
                  placeholder="Ask AI..."
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendAiMessage()}
                  className="bg-input/50"
                  data-testid="ai-input"
                />
                <Button onClick={sendAiMessage} size="sm" disabled={aiLoading} data-testid="ai-send-button">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ScriptEditor;
