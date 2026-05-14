"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase';
import { 
  Send, 
  Paperclip, 
  Loader2,
  User,
  ShieldCheck,
  EyeOff
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SupportChatProps {
  ticketId: string;
  currentUserRole: 'user' | 'admin';
}

export const SupportChat = ({ ticketId, currentUserRole }: SupportChatProps) => {
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [isInternalNote, setIsInternalNote] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchMessages();
    const unsubscribe = subscribeToMessages();
    return () => {
      unsubscribe();
    };
  }, [ticketId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    let query = supabase
      .from('skin_ticket_messages')
      .select('*, skin_ticket_attachments(*)')
      .eq('skin_ticket_id', ticketId)
      .order('skin_created_at', { ascending: true });

    // If user, RLS already hides internal notes, but adding explicit filter is good practice
    if (currentUserRole === 'user') {
      query = query.eq('skin_is_internal_note', false);
    }

    const { data } = await query;
    if (data) setMessages(data);
    setLoading(false);
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`ticket-${ticketId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'skin_ticket_messages',
        filter: `skin_ticket_id=eq.${ticketId}`
      }, async (payload) => {
        // Fetch attachments for the new message
        const { data: attachments } = await supabase
          .from('skin_ticket_attachments')
          .select('*')
          .eq('skin_message_id', payload.new.skin_id);
          
        setMessages(prev => [...prev, { ...payload.new, skin_ticket_attachments: attachments || [] }]);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  };

  const handleSendMessage = async (e: React.FormEvent, uploadedUrl?: string, fileName?: string) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() && !uploadedUrl) return;

    const { data: { session } } = await supabase.auth.getSession();
    const msg = newMessage;
    setNewMessage('');

    // 1. Insert Message
    const { data: messageData, error: msgError } = await supabase
      .from('skin_ticket_messages')
      .insert({
        skin_ticket_id: ticketId,
        skin_sender_id: session?.user.id,
        skin_sender_type: currentUserRole,
        skin_message: msg || (uploadedUrl ? 'Sent an attachment' : ''),
        skin_is_internal_note: currentUserRole === 'admin' ? isInternalNote : false
      })
      .select()
      .single();

    if (msgError) {
      console.error(msgError);
      return;
    }

    // 2. Insert Attachment if exists
    if (uploadedUrl && messageData) {
      await supabase
        .from('skin_ticket_attachments')
        .insert({
          skin_message_id: messageData.skin_id,
          skin_file_url: uploadedUrl,
          skin_file_name: fileName || 'Attachment'
        });
    }

    // 3. Update Ticket Last Reply At
    if (!isInternalNote) {
      await supabase
        .from('skin_tickets')
        .update({ skin_last_reply_at: new Date().toISOString() })
        .eq('skin_id', ticketId);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `tickets/${ticketId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('support_attachments') // Ensure this bucket exists
      .upload(filePath, file);

    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage
        .from('support_attachments')
        .getPublicUrl(filePath);
      
      await handleSendMessage(null as any, publicUrl, file.name);
    } else {
      console.error(uploadError);
      alert('Failed to upload attachment.');
    }
    setUploading(false);
  };

  if (loading) {
    return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-accent-gold" size={32} /></div>;
  }

  return (
    <div className="flex flex-col h-full bg-secondary-ivory/5">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
        {messages.map((msg, idx) => {
          const isSenderAdmin = msg.skin_sender_type === 'admin';
          const isInternal = msg.skin_is_internal_note;
          const alignRight = msg.skin_sender_type === currentUserRole && !isInternal;

          return (
            <motion.div 
              key={msg.skin_id || idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-6 max-w-[85%] ${alignRight ? 'ml-auto flex-row-reverse' : ''}`}
            >
               <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-sm ${
                 isSenderAdmin ? 'bg-accent-gold text-text-dark' : 'bg-white text-text-muted border border-secondary-ivory'
               }`}>
                  {isSenderAdmin ? <ShieldCheck size={24} /> : <User size={24} />}
               </div>
               
               <div className={`p-6 rounded-[2rem] shadow-sm flex flex-col gap-4 relative ${
                 isInternal 
                   ? 'bg-yellow-50 border border-yellow-200' 
                   : alignRight 
                     ? 'bg-text-dark text-white rounded-tr-none' 
                     : 'bg-white border border-secondary-ivory rounded-tl-none'
               }`}>
                  {isInternal && (
                    <div className="absolute -top-3 -right-3 bg-yellow-200 text-yellow-800 p-1.5 rounded-full shadow-sm" title="Internal Admin Note">
                      <EyeOff size={14} />
                    </div>
                  )}

                  {msg.skin_message && (
                    <p className={`text-sm font-medium leading-relaxed italic ${isInternal ? 'text-yellow-800' : ''}`}>
                      {msg.skin_message}
                    </p>
                  )}
                  
                  {msg.skin_ticket_attachments?.map((attachment: any) => (
                    <div key={attachment.skin_id} className="mt-2">
                       {attachment.skin_file_url.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                         <img src={attachment.skin_file_url} alt="Attachment" className="rounded-2xl max-w-full h-auto border border-white/10" />
                       ) : (
                         <a href={attachment.skin_file_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs underline opacity-80 hover:opacity-100">
                           <Paperclip size={14} /> {attachment.skin_file_name}
                         </a>
                       )}
                    </div>
                  ))}
                  
                  <p className={`text-[9px] font-black uppercase tracking-widest mt-1 ${
                    isInternal ? 'text-yellow-600' : alignRight ? 'text-white/40 text-right' : 'text-text-muted'
                  }`}>
                     {new Date(msg.skin_created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
               </div>
            </motion.div>
          );
        })}
        {messages.length === 0 && (
          <div className="text-center text-text-muted text-sm font-medium italic mt-20">
            No messages in this thread yet.
          </div>
        )}
      </div>

      <footer className="p-6 border-t border-secondary-ivory bg-white">
        <form onSubmit={handleSendMessage} className="space-y-4">
          {currentUserRole === 'admin' && (
            <div className="flex items-center gap-2 px-4">
              <input 
                type="checkbox" 
                id="internalNote" 
                checked={isInternalNote} 
                onChange={(e) => setIsInternalNote(e.target.checked)}
                className="rounded border-gray-300 text-accent-gold focus:ring-accent-gold"
              />
              <label htmlFor="internalNote" className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-1 cursor-pointer">
                <EyeOff size={12} /> Mark as Internal Note (Hidden from user)
              </label>
            </div>
          )}
          
          <div className={`flex items-center gap-4 p-3 rounded-[3rem] border transition-all shadow-inner focus-within:ring-2 focus-within:ring-accent-gold/20 ${
            isInternalNote ? 'bg-yellow-50/50 border-yellow-200' : 'bg-secondary-ivory/30 border-secondary-ivory/50 focus-within:border-accent-gold'
          }`}>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileUpload}
            />
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm transition-all ${
                isInternalNote ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-white text-text-muted hover:text-text-dark hover:shadow-md'
              }`}
            >
               {uploading ? <Loader2 className="animate-spin" size={20} /> : <Paperclip size={20} />}
            </button>
            <input 
              placeholder={isInternalNote ? "Type an internal admin note..." : "Type your message here..."}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className={`flex-1 bg-transparent border-none outline-none px-4 text-sm font-medium italic ${
                isInternalNote ? 'text-yellow-800 placeholder:text-yellow-500/70' : 'text-text-dark placeholder:text-text-muted'
              }`}
            />
            <button 
              type="submit"
              className={`w-12 h-12 rounded-full text-white transition-all flex items-center justify-center flex-shrink-0 shadow-xl ${
                isInternalNote ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-text-dark hover:bg-accent-gold'
              }`}
            >
               <Send size={20} />
            </button>
          </div>
        </form>
      </footer>
    </div>
  );
};
