'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Headset,
  Plus,
  Send,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  ArrowLeft,
  HelpCircle,
  Phone,
  Mail,
} from 'lucide-react'

interface Ticket {
  id: string
  restaurant_user_id: string
  restaurant_name: string | null
  subject: string
  status: string
  priority: string
  created_by: string
  created_at: string
  updated_at: string
  support_messages: { count: number }[]
}

interface Message {
  id: string
  ticket_id: string
  sender: string
  message: string
  created_at: string
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  open: { label: 'Otwarty', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', icon: AlertCircle },
  in_progress: { label: 'W trakcie', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300', icon: Clock },
  resolved: { label: 'Rozwiazany', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', icon: CheckCircle },
  closed: { label: 'Zamkniety', color: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300', icon: XCircle },
}

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: 'Niski', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  normal: { label: 'Normalny', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  high: { label: 'Wysoki', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
  urgent: { label: 'Pilny', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
}

export default function RestaurantSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [showNewTicket, setShowNewTicket] = useState(false)
  const [newTicket, setNewTicket] = useState({
    subject: '',
    message: '',
    priority: 'normal',
  })
  const [creating, setCreating] = useState(false)

  const fetchTickets = useCallback(async () => {
    const res = await fetch('/api/support')
    const data = await res.json()
    setTickets(data.tickets || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  const fetchMessages = async (ticketId: string) => {
    const res = await fetch('/api/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'get_messages', ticket_id: ticketId }),
    })
    const data = await res.json()
    setMessages(data.messages || [])
  }

  const openTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    fetchMessages(ticket.id)
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return
    setSendingMessage(true)
    await fetch('/api/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'send_message',
        ticket_id: selectedTicket.id,
        message: newMessage,
      }),
    })
    setNewMessage('')
    setSendingMessage(false)
    fetchMessages(selectedTicket.id)
    fetchTickets()
  }

  const createTicket = async () => {
    if (!newTicket.subject || !newTicket.message) return
    setCreating(true)
    await fetch('/api/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create_ticket',
        ...newTicket,
      }),
    })
    setShowNewTicket(false)
    setNewTicket({ subject: '', message: '', priority: 'normal' })
    setCreating(false)
    fetchTickets()
  }

  const openCount = tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length
  const resolvedCount = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length

  // Ticket detail view
  if (selectedTicket) {
    const statusCfg = statusConfig[selectedTicket.status] || statusConfig.open
    const StatusIcon = statusCfg.icon

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => setSelectedTicket(null)} className="bg-transparent">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Powrot
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">{selectedTicket.subject}</h1>
            <p className="text-sm text-muted-foreground">
              Utworzono{' '}
              {new Date(selectedTicket.created_at).toLocaleDateString('pl-PL', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <Badge className={statusCfg.color}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {statusCfg.label}
          </Badge>
        </div>

        {/* Messages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="w-5 h-5" />
              Konwersacja
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {messages.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Brak wiadomosci</p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-lg ${
                      msg.sender === 'user'
                        ? 'bg-primary/10 border border-primary/20 ml-8'
                        : 'bg-muted mr-8'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-foreground">
                        {msg.sender === 'admin' ? 'Pomoc techniczna' : 'Ty'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(msg.created_at).toLocaleString('pl-PL')}
                      </span>
                    </div>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{msg.message}</p>
                  </div>
                ))
              )}
            </div>

            {/* Send message */}
            {selectedTicket.status !== 'closed' && (
              <div className="flex gap-2 pt-4 border-t">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Napisz wiadomosc..."
                  className="flex-1 min-h-[80px]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) sendMessage()
                  }}
                />
                <Button onClick={sendMessage} disabled={sendingMessage || !newMessage.trim()} className="self-end">
                  <Send className="w-4 h-4 mr-2" />
                  Wyslij
                </Button>
              </div>
            )}

            {selectedTicket.status === 'closed' && (
              <div className="text-center py-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">To zgloszenie zostalo zamkniete.</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Jesli problem nadal wystepuje, utworz nowe zgloszenie.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main view
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pomoc techniczna</h1>
          <p className="text-muted-foreground mt-1">
            Masz problem? Napisz do nas - pomozemy!
          </p>
        </div>
        <Dialog open={showNewTicket} onOpenChange={setShowNewTicket}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nowe zgloszenie
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Zgloszenie problemu</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Temat</Label>
                <Input
                  className="mt-1"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  placeholder="Np. Problem z wyswietlaniem menu"
                />
              </div>
              <div>
                <Label>Priorytet</Label>
                <Select
                  value={newTicket.priority}
                  onValueChange={(v) => setNewTicket({ ...newTicket, priority: v })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Niski - ogolne pytanie</SelectItem>
                    <SelectItem value="normal">Normalny - maly problem</SelectItem>
                    <SelectItem value="high">Wysoki - wazny problem</SelectItem>
                    <SelectItem value="urgent">Pilny - system nie dziala</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Opis problemu</Label>
                <Textarea
                  className="mt-1 min-h-[120px]"
                  value={newTicket.message}
                  onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                  placeholder="Opisz dokladnie co sie dzieje, kiedy to wystepuje i jakie kroki podejmowales..."
                />
              </div>
              <Button
                onClick={createTicket}
                disabled={!newTicket.subject || !newTicket.message || creating}
                className="w-full"
              >
                {creating ? 'Wysylanie...' : 'Wyslij zgloszenie'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick contact info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Headset className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{tickets.length}</p>
              <p className="text-xs text-muted-foreground">Wszystkich zgloszen</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{openCount}</p>
              <p className="text-xs text-muted-foreground">Aktywnych</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{resolvedCount}</p>
              <p className="text-xs text-muted-foreground">Rozwiazanych</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tickets list */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Twoje zgloszenia
          </CardTitle>
          <CardDescription>
            Lista Twoich zgloszen do pomocy technicznej
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Ladowanie...</p>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12">
              <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="font-medium text-foreground">Brak zgloszen</p>
              <p className="text-sm text-muted-foreground mt-1">
                Masz problem lub pytanie? Kliknij &ldquo;Nowe zgloszenie&rdquo; aby sie z nami skontaktowac.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {tickets.map((ticket) => {
                const statusCfg = statusConfig[ticket.status] || statusConfig.open
                const StatusIcon = statusCfg.icon
                const msgCount = ticket.support_messages?.[0]?.count || 0

                return (
                  <button
                    type="button"
                    key={ticket.id}
                    onClick={() => openTicket(ticket)}
                    className="w-full flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-medium text-foreground truncate">{ticket.subject}</h3>
                        <Badge className={statusCfg.color} variant="outline">
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusCfg.label}
                        </Badge>
                        <Badge className={priorityConfig[ticket.priority]?.color || ''} variant="outline">
                          {priorityConfig[ticket.priority]?.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>
                          {new Date(ticket.created_at).toLocaleDateString('pl-PL', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {msgCount} wiadomosci
                        </span>
                        <span className="text-xs">
                          {ticket.created_by === 'admin' ? 'Utworzone przez pomoc' : 'Twoje zgloszenie'}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4 text-muted-foreground">
                      <ArrowLeft className="w-4 h-4 rotate-180" />
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Help section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <HelpCircle className="w-5 h-5" />
            Potrzebujesz szybkiej pomocy?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="mailto:kontakt@zamowtu.pl"
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="p-2 bg-primary/10 rounded-lg">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Email</p>
                <p className="text-sm text-muted-foreground">kontakt@zamowtu.pl</p>
              </div>
            </a>
            <a
              href="tel:+48000000000"
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Phone className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="font-medium text-foreground">Telefon</p>
                <p className="text-sm text-muted-foreground">Pon-Pt 9:00-17:00</p>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
