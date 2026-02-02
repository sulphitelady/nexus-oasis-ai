import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Loader2,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

const welcomeMessage: Message = {
  id: 'welcome',
  role: 'assistant',
  content: "👋 Hello! I'm your NEXUS-AI Assistant powered by AIRIA. I can help you understand our water-energy optimization platform, explain how our AI agents work, or answer any questions about the UAE's water-energy nexus. What would you like to know?",
  timestamp: new Date()
};

const quickQuestions = [
  "What is NEXUS-AI?",
  "How do the AI agents work?",
  "What scenarios can I simulate?",
  "How accurate are predictions?"
];

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Add typing indicator
    const typingMessage: Message = {
      id: 'typing',
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isTyping: true
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      // Build context from conversation history
      const conversationContext = messages
        .filter(m => m.id !== 'typing')
        .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n');

      const { data, error } = await supabase.functions.invoke('airia-explain', {
        body: {
          question: messageText,
          context: `You are a helpful AI assistant for NEXUS-AI, a water-energy optimization platform for the UAE. Be friendly, informative, and concise. 

Previous conversation:
${conversationContext}

User's new question: ${messageText}

Provide a helpful, friendly response. If the question is about NEXUS-AI features, AI agents, or water-energy topics, provide detailed information. For off-topic questions, politely redirect to platform-related topics.`
        }
      });

      // Remove typing indicator and add response
      setMessages(prev => prev.filter(m => m.id !== 'typing'));

      if (error) throw error;

      const responseContent = data?.explanation || 
        "I apologize, but I'm having trouble connecting to my knowledge base right now. Please try asking your question again, or explore the FAQ section above for common questions!";

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages(prev => prev.filter(m => m.id !== 'typing'));
      
      // Fallback response
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I encountered an issue processing your question. In the meantime, you can:\n\n• Check out our **FAQ section** above for common questions\n• **Launch the Dashboard** to explore the platform hands-on\n• Try asking a different question\n\nHow else can I help you? 😊",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, fallbackMessage]);
      
      toast.error('Connection issue - using fallback response');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickQuestion = (question: string) => {
    sendMessage(question);
  };

  const clearChat = () => {
    setMessages([welcomeMessage]);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg gradient-gold text-primary-foreground hover:scale-110 transition-transform z-50"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
        <span className="absolute -top-1 -right-1 h-4 w-4 bg-success rounded-full animate-pulse" />
      </Button>
    );
  }

  return (
    <Card className={`fixed z-50 shadow-2xl border-primary/20 transition-all duration-300 ${
      isExpanded 
        ? 'bottom-4 right-4 left-4 top-4 md:left-auto md:w-[500px] md:h-[700px]' 
        : 'bottom-6 right-6 w-[380px] h-[500px]'
    }`}>
      {/* Header */}
      <CardHeader className="p-4 border-b border-border/50 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-10 w-10 border-2 border-primary/30">
                <AvatarFallback className="bg-primary/20">
                  <Bot className="h-5 w-5 text-primary" />
                </AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0 h-3 w-3 bg-success rounded-full border-2 border-background" />
            </div>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                NEXUS-AI Assistant
                <Sparkles className="h-4 w-4 text-primary" />
              </CardTitle>
              <p className="text-xs text-muted-foreground">Powered by AIRIA</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="p-0 flex flex-col h-[calc(100%-140px)]">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <Avatar className={`h-8 w-8 flex-shrink-0 ${message.role === 'user' ? 'bg-primary/20' : 'bg-accent/20'}`}>
                  <AvatarFallback>
                    {message.role === 'user' 
                      ? <User className="h-4 w-4 text-primary" />
                      : <Bot className="h-4 w-4 text-accent" />
                    }
                  </AvatarFallback>
                </Avatar>
                <div className={`max-w-[80%] ${message.role === 'user' ? 'text-right' : ''}`}>
                  <div className={`rounded-2xl px-4 py-2.5 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-muted rounded-bl-sm'
                  }`}>
                    {message.isTyping ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Thinking...</span>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    )}
                  </div>
                  <p className={`text-xs text-muted-foreground mt-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Questions - show only after welcome message */}
          {messages.length === 1 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Quick questions:</p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    className="px-3 py-1.5 text-xs rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-border/50">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              type="submit" 
              size="icon"
              disabled={!input.trim() || isLoading}
              className="gradient-gold text-primary-foreground"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
          <div className="flex justify-between items-center mt-2">
            <button
              onClick={clearChat}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear chat
            </button>
            <p className="text-xs text-muted-foreground">
              Press Enter to send
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
