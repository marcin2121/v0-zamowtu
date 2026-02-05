"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Headset,
  Plus,
  Send,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  ChevronRight,
  ArrowLeft,
} from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"

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

interface Restaurant {
  user_id: string
  restaurant_name: string
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  open: { label: "Otwarty", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300", icon: AlertCircle },
  in_progress: { label: "W trakcie", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300", icon: Clock },
  resolved: { label: "Rozwiazany", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300", icon: CheckCircle },
  closed: { label: "Zamkniety", color: "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300", icon: XCircle },
}

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: "Niski", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
  normal: { label: "Normalny", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  high: { label: "Wysoki", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300" },
  urgent: { label: "Pilny", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" },
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [sendingMessage, setSendingMessage] = useState(false)
  const [showNewTicket, setShowNewTicket] = useState(false)
  const [newTicket, setNewTicket] = useState({
    restaurant_user_id: "",
    subject: "",
    message: "",
    priority: "normal",
  })

  const fetchTickets = useCallback(async () => {
    const params = new URLSearchParams()
    if (filterStatus !== "all") params.set("status", filterStatus)
    const res = await fetch(`/api/admin/support?${params}`)
    const data = await res.json()
    setTickets(data.tickets || [])
    setLoading(false)
  }, [filterStatus])

  const fetchRestaurants = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data } = await supabase
      .from("restaurant_settings")
      .select("user_id, restaurant_name")
      .order("restaurant_name")
    setRestaurants(data || [])
  }

  useEffect(() => {
    fetchTickets()
    fetchRestaurants()
  }, [fetchTickets])

  const fetchMessages = async (ticketId: string) => {
    const res = await fetch("/api/admin/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "get_messages", ticket_id: ticketId }),
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
    await fetch("/api/admin/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "send_message",
        ticket_id: selectedTicket.id,
        message: newMessage,
      }),
    })
    setNewMessage("")
    setSendingMessage(false)
    fetchMessages(selectedTicket.id)
    fetchTickets()
  }

  const updateStatus = async (ticketId: string, status: string) => {
    await fetch("/api/admin/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_status", ticket_id: ticketId, status }),
    })
    fetchTickets()
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, status })
    }
  }

  const createTicket = async () => {
    if (!newTicket.restaurant_user_id || !newTicket.subject) return
    const restaurant = restaurants.find((r) => r.user_id === newTicket.restaurant_user_id)
    await fetch("/api/admin/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create_ticket",
        ...newTicket,
        restaurant_name: restaurant?.restaurant_name || "Nieznana",
      }),
    })
    setShowNewTicket(false)
    setNewTicket({ restaurant_user_id: "", subject: "", message: "", priority: "normal" })
    fetchTickets()
  }

  const openCount = tickets.filter((t) => t.status === "open").length
  const inProgressCount = tickets.filter((t) => t.status === "in_progress").length

  // Ticket detail view
  if (selectedTicket) {
    const statusCfg = statusConfig[selectedTicket.status] || statusConfig.open
    const StatusIcon = statusCfg.icon

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => setSelectedTicket(null)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Powrot
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">{selectedTicket.subject}</h1>
            <p className="text-sm text-muted-foreground">
              {selectedTicket.restaurant_name || "Nieznana restauracja"} &bull;{" "}
              {new Date(selectedTicket.created_at).toLocaleDateString("pl-PL", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={statusCfg.color}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusCfg.label}
            </Badge>
            <Badge className={priorityConfig[selectedTicket.priority]?.color || ""}>
              {priorityConfig[selectedTicket.priority]?.label || selectedTicket.priority}
            </Badge>
          </div>
        </div>

        {/* Status actions */}
        <div className="flex gap-2 flex-wrap">
          {selectedTicket.status !== "in_progress" && (
            <Button size="sm" variant="outline" onClick={() => updateStatus(selectedTicket.id, "in_progress")}>
              <Clock className="w-4 h-4 mr-1" /> Oznacz jako w trakcie
            </Button>
          )}
          {selectedTicket.status !== "resolved" && (
            <Button size="sm" variant="outline" className="text-green-700 bg-transparent" onClick={() => updateStatus(selectedTicket.id, "resolved")}>
              <CheckCircle className="w-4 h-4 mr-1" /> Rozwiazany
            </Button>
          )}
          {selectedTicket.status !== "closed" && (
            <Button size="sm" variant="outline" className="text-slate-500 bg-transparent" onClick={() => updateStatus(selectedTicket.id, "closed")}>
              <XCircle className="w-4 h-4 mr-1" /> Zamknij
            </Button>
          )}
          {selectedTicket.status === "closed" && (
            <Button size="sm" variant="outline" onClick={() => updateStatus(selectedTicket.id, "open")}>
              <AlertCircle className="w-4 h-4 mr-1" /> Otworz ponownie
            </Button>
          )}
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
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {messages.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Brak wiadomosci</p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-lg ${
                      msg.sender === "admin"
                        ? "bg-primary/10 border border-primary/20 ml-8"
                        : "bg-muted mr-8"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-foreground">
                        {msg.sender === "admin" ? "Admin" : "Restauracja"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(msg.created_at).toLocaleString("pl-PL")}
                      </span>
                    </div>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{msg.message}</p>
                  </div>
                ))
              )}
            </div>

            {/* Send message */}
            {selectedTicket.status !== "closed" && (
              <div className="flex gap-2 pt-4 border-t">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Napisz wiadomosc..."
                  className="flex-1 min-h-[80px]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.ctrlKey) sendMessage()
                  }}
                />
                <Button onClick={sendMessage} disabled={sendingMessage || !newMessage.trim()} className="self-end">
                  <Send className="w-4 h-4 mr-2" />
                  Wyslij
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Ticket list view
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pomoc techniczna</h1>
          <p className="text-muted-foreground mt-1">
            Zarzadzaj zgloszeniami i komunikuj sie z restauracjami
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
              <DialogTitle>Nowe zgloszenie pomocy</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Restauracja</Label>
                <Select
                  value={newTicket.restaurant_user_id}
                  onValueChange={(v) => setNewTicket({ ...newTicket, restaurant_user_id: v })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Wybierz restauracje" />
                  </SelectTrigger>
                  <SelectContent>
                    {restaurants.map((r) => (
                      <SelectItem key={r.user_id} value={r.user_id}>
                        {r.restaurant_name || "Brak nazwy"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Temat</Label>
                <Input
                  className="mt-1"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  placeholder="Np. Problem z zamowieniami"
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
                    <SelectItem value="low">Niski</SelectItem>
                    <SelectItem value="normal">Normalny</SelectItem>
                    <SelectItem value="high">Wysoki</SelectItem>
                    <SelectItem value="urgent">Pilny</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Wiadomosc poczatkowa</Label>
                <Textarea
                  className="mt-1 min-h-[100px]"
                  value={newTicket.message}
                  onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                  placeholder="Opisz problem lub powod kontaktu..."
                />
              </div>
              <Button
                onClick={createTicket}
                disabled={!newTicket.restaurant_user_id || !newTicket.subject}
                className="w-full"
              >
                Utworz zgloszenie
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setFilterStatus("all")}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Headset className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{tickets.length}</p>
                <p className="text-xs text-muted-foreground">Wszystkie</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setFilterStatus("open")}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <AlertCircle className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{openCount}</p>
                <p className="text-xs text-muted-foreground">Otwarte</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setFilterStatus("in_progress")}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{inProgressCount}</p>
                <p className="text-xs text-muted-foreground">W trakcie</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setFilterStatus("resolved")}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {tickets.filter((t) => t.status === "resolved").length}
                </p>
                <p className="text-xs text-muted-foreground">Rozwiazane</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Filtr:</span>
        {["all", "open", "in_progress", "resolved", "closed"].map((status) => (
          <Button
            key={status}
            variant={filterStatus === status ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus(status)}
          >
            {status === "all" ? "Wszystkie" : statusConfig[status]?.label || status}
          </Button>
        ))}
      </div>

      {/* Tickets list */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Zgloszenia
          </CardTitle>
          <CardDescription>
            {filterStatus === "all" ? "Wszystkie zgloszenia" : `Filtr: ${statusConfig[filterStatus]?.label || filterStatus}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Ladowanie...</p>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12">
              <Headset className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Brak zgloszen</p>
              <p className="text-sm text-muted-foreground mt-1">
                Kliknij &ldquo;Nowe zgloszenie&rdquo; aby rozpoczac kontakt z restauracja
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
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-foreground truncate">{ticket.subject}</h3>
                        <Badge className={statusCfg.color} variant="outline">
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusCfg.label}
                        </Badge>
                        <Badge className={priorityConfig[ticket.priority]?.color || ""} variant="outline">
                          {priorityConfig[ticket.priority]?.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{ticket.restaurant_name || "Nieznana restauracja"}</span>
                        <span>{new Date(ticket.created_at).toLocaleDateString("pl-PL")}</span>
                        {msgCount > 0 && (
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {msgCount}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  </button>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
