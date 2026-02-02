import { createClient } from '@/lib/supabase/server'
import { ComprehensiveSuggestions } from '@/components/dashboard/comprehensive-suggestions'

export default async function SuggestionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Sugestie i rekomendacje</h1>
        <p className="text-muted-foreground">
          Inteligentne podpowiedzi oparte na analizie Twojej restauracji
        </p>
      </div>
      <ComprehensiveSuggestions userId={user.id} />
    </div>
  )
}
