# Chatbot History Feature

This document explains the chat history feature that saves user conversations to Supabase.

## Overview

The chatbot now automatically saves all conversations to Supabase, allowing users to:
- Persist chat history across sessions
- Start new conversations while preserving old ones
- Automatically resume the most recent conversation
- Have conversations tied to their user account

## Database Schema

### Tables

#### `chat_sessions`
Stores individual chat sessions for each user.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to auth.users |
| title | TEXT | Auto-generated from first user message |
| created_at | TIMESTAMP | Session creation time |
| updated_at | TIMESTAMP | Last update time |

#### `chat_messages`
Stores individual messages within chat sessions.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| session_id | UUID | Foreign key to chat_sessions |
| user_id | UUID | Foreign key to auth.users |
| role | TEXT | Either 'user' or 'assistant' |
| content | TEXT | Message content |
| created_at | TIMESTAMP | Message timestamp |

### Functions

#### `get_user_chat_sessions(p_user_id UUID, p_limit INTEGER)`
Returns a user's chat sessions with statistics:
- Session ID and title
- Message count
- Last message timestamp
- Creation timestamp

#### `auto_generate_session_title()`
Trigger function that automatically generates a session title from the first user message (first 50 characters).

## Setup Instructions

### 1. Run the Migration

Execute the migration file in your Supabase SQL Editor:

```bash
# The migration file is located at:
supabase/migrations/004_chatbot_history_schema.sql
```

Or if you're using Supabase CLI:

```bash
supabase db push
```

### 2. Verify Tables

In your Supabase dashboard:
1. Go to the Table Editor
2. Verify that `chat_sessions` and `chat_messages` tables exist
3. Check that Row Level Security (RLS) is enabled on both tables

### 3. Test the Feature

1. Sign in to your application
2. Start a conversation with the chatbot
3. Refresh the page - your conversation should persist
4. Click "New Chat" to start a fresh conversation
5. Your previous conversation is saved and can be accessed later

## Features

### Automatic Session Management
- When a user first opens the chatbot, the system loads their most recent session
- If no session exists, a new one is created automatically
- Sessions are tied to the authenticated user

### Message Persistence
- Every message (both user and assistant) is saved to Supabase immediately after being sent
- Messages are loaded when the user returns to the chatbot
- All messages are associated with both a session and a user

### New Chat Functionality
- Users can click the "New Chat" button to start a fresh conversation
- Previous conversations are automatically saved
- A toast notification confirms the new chat creation

### Authentication Integration
- Chat history requires user authentication
- Unauthenticated users see a warning when trying to send messages
- All data is protected by Row Level Security (RLS)

## Service API

The `chatHistoryService` provides the following methods:

### Session Management
```typescript
// Create a new session
await chatHistoryService.createSession(userId, title?);

// Get user's sessions with stats
await chatHistoryService.getUserSessions(userId, limit?);

// Get a specific session
await chatHistoryService.getSession(sessionId);

// Update session title
await chatHistoryService.updateSessionTitle(sessionId, title);

// Delete a session (cascades to messages)
await chatHistoryService.deleteSession(sessionId);

// Get or create current session
await chatHistoryService.getOrCreateCurrentSession(userId);
```

### Message Management
```typescript
// Save a message
await chatHistoryService.saveMessage(sessionId, userId, role, content);

// Get all messages for a session
await chatHistoryService.getSessionMessages(sessionId);

// Delete a specific message
await chatHistoryService.deleteMessage(messageId);

// Clear all messages from a session
await chatHistoryService.clearSessionMessages(sessionId);
```

## Security

### Row Level Security (RLS)
All tables have RLS enabled with the following policies:

**chat_sessions:**
- Users can only view, insert, update, and delete their own sessions

**chat_messages:**
- Users can only view, insert, update, and delete their own messages

### Data Privacy
- All queries are filtered by `user_id` to ensure users can only access their own data
- Foreign key constraints ensure data integrity
- Cascade deletes ensure cleanup when sessions are deleted

## Future Enhancements

Potential improvements for the chat history feature:

1. **Session List UI**: Add a sidebar showing all previous chat sessions
2. **Search**: Allow users to search through their chat history
3. **Export**: Enable users to export conversations as PDF or text
4. **Session Naming**: Allow users to manually rename sessions
5. **Favorites**: Let users mark important conversations
6. **Analytics**: Track conversation metrics and insights
7. **Sharing**: Allow users to share conversations (with privacy controls)

## Troubleshooting

### Messages not saving
- Check that the user is authenticated
- Verify Supabase connection in browser console
- Check that RLS policies are correctly set up

### Session not loading
- Clear browser cache and reload
- Check browser console for errors
- Verify the migration was run successfully

### Performance issues
- The current implementation loads all messages for a session
- For very long conversations, consider implementing pagination
- Add indexes if query performance degrades

## Files Modified

1. `supabase/migrations/004_chatbot_history_schema.sql` - Database schema
2. `src/services/chatHistoryService.ts` - Service layer for chat operations
3. `src/pages/Chatbot.tsx` - Updated UI component with history integration
