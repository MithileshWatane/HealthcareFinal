import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Send, Bot, User, Sparkles, AlertCircle, Plus } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { sendMessageToRAG } from "@/services/ragChatbotService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { chatHistoryService } from "@/services/chatHistoryService";
import { ChatHistorySidebar } from "@/components/ChatHistorySidebar";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const quickQuestions = [
  "What are the symptoms of flu?",
  "How to manage high blood pressure?",
  "When should I see a doctor for headaches?",
  "What vitamins should I take daily?",
  "How can I improve my sleep quality?",
  "What are healthy eating habits?",
];

export default function Chatbot() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your AI medical assistant . I can help answer medical questions based on verified medical literature. How can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Load chat history on mount
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!user) {
        setIsLoadingHistory(false);
        return;
      }

      try {
        // Get or create current session
        const session = await chatHistoryService.getOrCreateCurrentSession(user.id);
        setCurrentSessionId(session.id);

        // Load messages from this session
        const savedMessages = await chatHistoryService.getSessionMessages(session.id);

        if (savedMessages.length > 0) {
          // Convert saved messages to Message format
          const loadedMessages: Message[] = savedMessages.map((msg) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.created_at),
          }));
          setMessages(loadedMessages);
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
        toast({
          title: "Warning",
          description: "Could not load chat history. Starting a new session.",
          variant: "default",
        });
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadChatHistory();
  }, [user, toast]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Check if user is authenticated
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save your chat history.",
        variant: "destructive",
      });
      return;
    }

    // Ensure we have a session
    let sessionId = currentSessionId;
    if (!sessionId) {
      try {
        const session = await chatHistoryService.createSession(user.id);
        sessionId = session.id;
        setCurrentSessionId(sessionId);
      } catch (error) {
        console.error('Error creating session:', error);
        toast({
          title: "Error",
          description: "Could not create chat session.",
          variant: "destructive",
        });
        return;
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      // Save user message to Supabase
      await chatHistoryService.saveMessage(
        sessionId,
        user.id,
        "user",
        input
      );

      // Send message to RAG backend
      const response = await sendMessageToRAG(input);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Save assistant message to Supabase
      await chatHistoryService.saveMessage(
        sessionId,
        user.id,
        "assistant",
        response
      );
    } catch (error) {
      console.error('Error sending message:', error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I apologize, but I'm having trouble processing your request right now. Please make sure the RAG backend is running and try again.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);

      toast({
        title: "Error",
        description: "Failed to get response from RAG chatbot. Is the Flask backend running?",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInput(question);
  };

  const handleNewChat = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create a new chat.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create a new session
      const newSession = await chatHistoryService.createSession(user.id);
      setCurrentSessionId(newSession.id);

      // Reset messages to initial state
      setMessages([
        {
          id: "1",
          role: "assistant",
          content: "Hello! I'm your AI medical assistant powered by RAG (Retrieval-Augmented Generation) with Groq. I can help answer medical questions based on verified medical literature. How can I assist you today?",
          timestamp: new Date(),
        },
      ]);

      toast({
        title: "New Chat Started",
        description: "Your previous conversation has been saved.",
        variant: "default",
      });
    } catch (error) {
      console.error('Error creating new chat:', error);
      toast({
        title: "Error",
        description: "Could not create a new chat session.",
        variant: "destructive",
      });
    }
  };

  const handleSessionSelect = async (sessionId: string) => {
    if (!user) return;

    try {
      setIsLoadingHistory(true);
      setCurrentSessionId(sessionId);

      // Load messages from the selected session
      const savedMessages = await chatHistoryService.getSessionMessages(sessionId);

      if (savedMessages.length > 0) {
        const loadedMessages: Message[] = savedMessages.map((msg) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.created_at),
        }));
        setMessages(loadedMessages);
      } else {
        // If no messages, show welcome message
        setMessages([
          {
            id: "1",
            role: "assistant",
            content: "Hello! I'm your AI medical assistant powered by RAG (Retrieval-Augmented Generation) with Groq. I can help answer medical questions based on verified medical literature. How can I assist you today?",
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error('Error loading session:', error);
      toast({
        title: "Error",
        description: "Failed to load conversation.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingHistory(false);
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <PageHeader
          icon={MessageSquare}
          title="Medical Q&A Chatbot"
          description="Get instant answers to your health questions from our RAG-powered AI assistant using verified medical literature."
        />
      </div>

      <div className="flex gap-6 h-[calc(100vh-200px)]">
        {/* Sidebar */}
        {user && (
          <ChatHistorySidebar
            userId={user.id}
            currentSessionId={currentSessionId}
            onSessionSelect={handleSessionSelect}
            onNewChat={handleNewChat}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-3 flex-1">
            <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden h-full flex flex-col">
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                {isLoadingHistory ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-muted-foreground">Loading chat history...</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className={cn(
                          "flex gap-3",
                          message.role === "user" && "flex-row-reverse"
                        )}
                      >
                        <div
                          className={cn(
                            "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
                            message.role === "assistant" ? "gradient-primary" : "bg-muted"
                          )}
                        >
                          {message.role === "assistant" ? (
                            <Bot className="w-5 h-5 text-primary-foreground" />
                          ) : (
                            <User className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div
                          className={cn(
                            "max-w-[80%] px-4 py-3 rounded-2xl",
                            message.role === "assistant"
                              ? "bg-muted text-foreground"
                              : "gradient-primary text-primary-foreground"
                          )}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                          <p className="text-xs opacity-60 mt-2">
                            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-3"
                      >
                        <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
                          <Bot className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div className="bg-muted px-4 py-3 rounded-2xl">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                            <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.1s]" />
                            <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]" />
                          </div>
                        </div>
                      </motion.div>
                    )}
                    <div ref={scrollRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Input Area */}
              <div className="p-4 border-t border-border bg-card/50">
                <div className="flex gap-3">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Type your health question..."
                    className="flex-1 h-12 rounded-xl"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="h-12 px-6 rounded-xl gradient-primary hover:opacity-90"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Questions */}
          <div className="w-80">
            <div className="bg-card rounded-2xl shadow-card border border-border p-5">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="font-display font-semibold text-foreground">Quick Questions</h3>
              </div>
              <div className="space-y-2">
                {quickQuestions.map((question) => (
                  <button
                    key={question}
                    onClick={() => handleQuickQuestion(question)}
                    className="w-full text-left px-4 py-3 text-sm text-muted-foreground bg-muted hover:bg-muted/80 rounded-xl transition-colors hover:text-foreground"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-5 border border-primary/20">
              <h4 className="font-display font-semibold text-foreground mb-2">⚠️ Important Notice</h4>
              <p className="text-sm text-muted-foreground">
                This AI assistant provides general health information only. Always consult a qualified healthcare professional for medical advice.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
