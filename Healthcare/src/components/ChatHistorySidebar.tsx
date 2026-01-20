import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    MessageSquare,
    Plus,
    Trash2,
    Edit2,
    Check,
    X,
    Search,
    Clock,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { chatHistoryService, ChatSessionWithStats } from "@/services/chatHistoryService";
import { useToast } from "@/hooks/use-toast";

interface ChatHistorySidebarProps {
    userId: string;
    currentSessionId: string | null;
    onSessionSelect: (sessionId: string) => void;
    onNewChat: () => void;
}

export function ChatHistorySidebar({
    userId,
    currentSessionId,
    onSessionSelect,
    onNewChat,
}: ChatHistorySidebarProps) {
    const [sessions, setSessions] = useState<ChatSessionWithStats[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { toast } = useToast();

    // Load sessions
    useEffect(() => {
        loadSessions();
    }, [userId]);

    const loadSessions = async () => {
        try {
            setIsLoading(true);
            const userSessions = await chatHistoryService.getUserSessions(userId, 50);
            setSessions(userSessions);
        } catch (error) {
            console.error("Error loading sessions:", error);
            toast({
                title: "Error",
                description: "Failed to load chat history.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
        e.stopPropagation();

        if (!confirm("Are you sure you want to delete this conversation?")) {
            return;
        }

        try {
            await chatHistoryService.deleteSession(sessionId);
            setSessions(sessions.filter((s) => s.id !== sessionId));

            // If deleting current session, create a new one
            if (sessionId === currentSessionId) {
                onNewChat();
            }

            toast({
                title: "Deleted",
                description: "Conversation deleted successfully.",
            });
        } catch (error) {
            console.error("Error deleting session:", error);
            toast({
                title: "Error",
                description: "Failed to delete conversation.",
                variant: "destructive",
            });
        }
    };

    const handleStartEdit = (session: ChatSessionWithStats, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingSessionId(session.id);
        setEditTitle(session.title || "");
    };

    const handleSaveEdit = async (sessionId: string, e: React.MouseEvent) => {
        e.stopPropagation();

        if (!editTitle.trim()) {
            setEditingSessionId(null);
            return;
        }

        try {
            await chatHistoryService.updateSessionTitle(sessionId, editTitle.trim());
            setSessions(
                sessions.map((s) =>
                    s.id === sessionId ? { ...s, title: editTitle.trim() } : s
                )
            );
            setEditingSessionId(null);

            toast({
                title: "Updated",
                description: "Conversation title updated.",
            });
        } catch (error) {
            console.error("Error updating session:", error);
            toast({
                title: "Error",
                description: "Failed to update title.",
                variant: "destructive",
            });
        }
    };

    const handleCancelEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingSessionId(null);
        setEditTitle("");
    };

    const filteredSessions = sessions.filter((session) =>
        session.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInDays = Math.abs(Math.floor(
            (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
        ));

        if (diffInDays === 0) return "Today";
        if (diffInDays === 1) return "Yesterday";
        if (diffInDays < 7) return `${diffInDays} days ago`;
        if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
        return date.toLocaleDateString();
    };

    // Helper function to get sort order for date groups
    const getSortOrder = (dateKey: string): number => {
        if (dateKey === "Today") return 0;
        if (dateKey === "Yesterday") return 1;
        if (dateKey.includes("days ago")) {
            const days = parseInt(dateKey.split(" ")[0]);
            return 1 + days;
        }
        if (dateKey.includes("weeks ago")) {
            const weeks = parseInt(dateKey.split(" ")[0]);
            return 7 + (weeks * 7);
        }
        return 999; // For actual dates (oldest)
    };

    // Group sessions by date
    const groupedSessions = filteredSessions.reduce((groups, session) => {
        const dateKey = formatDate(session.last_message_at || session.created_at);
        if (!groups[dateKey]) {
            groups[dateKey] = [];
        }
        groups[dateKey].push(session);
        return groups;
    }, {} as Record<string, ChatSessionWithStats[]>);

    return (
        <div
            className={cn(
                "bg-card border-r border-border flex flex-col transition-all duration-300",
                isCollapsed ? "w-16" : "w-80"
            )}
        >
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
                {!isCollapsed && (
                    <h2 className="font-display font-semibold text-lg">Chat History</h2>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="ml-auto"
                >
                    {isCollapsed ? (
                        <ChevronRight className="w-4 h-4" />
                    ) : (
                        <ChevronLeft className="w-4 h-4" />
                    )}
                </Button>
            </div>

            <AnimatePresence>
                {!isCollapsed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex-1 flex flex-col overflow-hidden"
                    >
                        {/* New Chat Button */}
                        <div className="p-3">
                            <Button
                                onClick={onNewChat}
                                className="w-full gradient-primary hover:opacity-90"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                New Chat
                            </Button>
                        </div>

                        {/* Search */}
                        <div className="px-3 pb-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search conversations..."
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        {/* Sessions List */}
                        <ScrollArea className="flex-1">
                            <div className="px-3 pb-3 space-y-4">
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                    </div>
                                ) : filteredSessions.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">
                                            {searchQuery ? "No conversations found" : "No conversations yet"}
                                        </p>
                                    </div>
                                ) : (
                                    Object.entries(groupedSessions)
                                        .sort(([dateKeyA], [dateKeyB]) => getSortOrder(dateKeyA) - getSortOrder(dateKeyB))
                                        .map(([dateKey, dateSessions]) => (
                                            <div key={dateKey}>
                                                <h3 className="text-xs font-semibold text-muted-foreground mb-2 px-2">
                                                    {dateKey}
                                                </h3>
                                                <div className="space-y-1">
                                                    {dateSessions.map((session) => (
                                                        <motion.div
                                                            key={session.id}
                                                            initial={{ opacity: 0, y: -10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className={cn(
                                                                "group relative rounded-lg transition-colors cursor-pointer",
                                                                session.id === currentSessionId
                                                                    ? "bg-primary/10 border border-primary/20"
                                                                    : "hover:bg-muted"
                                                            )}
                                                            onClick={() => onSessionSelect(session.id)}
                                                        >
                                                            <div className="p-3">
                                                                {editingSessionId === session.id ? (
                                                                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                                        <Input
                                                                            value={editTitle}
                                                                            onChange={(e) => setEditTitle(e.target.value)}
                                                                            className="h-7 text-sm"
                                                                            autoFocus
                                                                            onKeyDown={(e) => {
                                                                                if (e.key === "Enter") {
                                                                                    handleSaveEdit(session.id, e as any);
                                                                                } else if (e.key === "Escape") {
                                                                                    handleCancelEdit(e as any);
                                                                                }
                                                                            }}
                                                                        />
                                                                        <Button
                                                                            size="icon"
                                                                            variant="ghost"
                                                                            className="h-7 w-7 flex-shrink-0"
                                                                            onClick={(e) => handleSaveEdit(session.id, e)}
                                                                        >
                                                                            <Check className="w-3 h-3" />
                                                                        </Button>
                                                                        <Button
                                                                            size="icon"
                                                                            variant="ghost"
                                                                            className="h-7 w-7 flex-shrink-0"
                                                                            onClick={handleCancelEdit}
                                                                        >
                                                                            <X className="w-3 h-3" />
                                                                        </Button>
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        <div className="flex items-start justify-between gap-2">
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className="text-sm font-medium truncate">
                                                                                    {session.title || "Untitled conversation"}
                                                                                </p>
                                                                                <div className="flex items-center gap-2 mt-1">
                                                                                    <Clock className="w-3 h-3 text-muted-foreground" />
                                                                                    <p className="text-xs text-muted-foreground">
                                                                                        {session.message_count} messages
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                <Button
                                                                                    size="icon"
                                                                                    variant="ghost"
                                                                                    className="h-7 w-7"
                                                                                    onClick={(e) => handleStartEdit(session, e)}
                                                                                >
                                                                                    <Edit2 className="w-3 h-3" />
                                                                                </Button>
                                                                                <Button
                                                                                    size="icon"
                                                                                    variant="ghost"
                                                                                    className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
                                                                                    onClick={(e) => handleDeleteSession(session.id, e)}
                                                                                >
                                                                                    <Trash2 className="w-3 h-3" />
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                )}
                            </div>
                        </ScrollArea>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Collapsed state icon */}
            {isCollapsed && (
                <div className="flex-1 flex flex-col items-center py-4 gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onNewChat}
                        className="w-10 h-10"
                    >
                        <Plus className="w-5 h-5" />
                    </Button>
                    <div className="w-px h-full bg-border" />
                </div>
            )}
        </div>
    );
}
