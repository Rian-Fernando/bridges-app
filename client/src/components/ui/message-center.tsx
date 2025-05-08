
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Input } from "./input";
import { Button } from "./button";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { ScrollArea } from "./scroll-area";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Message } from "@shared/schema";

export function MessageCenter() {
  const [newMessage, setNewMessage] = useState("");
  const [recipient, setRecipient] = useState("");
  
  const { data: messages } = useQuery<Message[]>({
    queryKey: ['/api/messages']
  });

  const queryClient = useQueryClient();
  
  const sendMessage = useMutation({
    mutationFn: async (message: { content: string, recipientEmail: string }) => {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      setNewMessage("");
      setRecipient("");
    }
  });

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle>Messages</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 mb-4">
          <div className="space-y-4">
            {messages?.map((message) => (
              <div key={message.id} className="flex items-start space-x-3">
                <Avatar>
                  <AvatarFallback>{message.sender.firstName[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{message.sender.firstName} {message.sender.lastName}</p>
                  <p className="text-sm text-gray-500">{message.content}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="space-y-2">
          <Input
            placeholder="Recipient email"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
          <div className="flex space-x-2">
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <Button 
              onClick={() => sendMessage.mutate({ content: newMessage, recipientEmail: recipient })}
            >
              Send
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
