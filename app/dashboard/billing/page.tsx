import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: settings } = await supabase
    .from('restaurant_settings')
    .select('*')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  const currentPlan = settings?.subscription_plan || 'starter'
  const planPrice = currentPlan === 'starter' ? 99 : 199

  const starterFeatures = [
    'Menu i zamówienia',
    'Zarządzanie dostawami',
    'Płatności online',
    'Harmonogram otwarcia',
  ]

  const professionalFeatures = [
    'Wszystko z planu Starter',
    'Kody rabatowe',
    'Program lojalnościowy',
    'Opinie i oceny',
    'Zaawansowane statystyki',
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Rozliczenia i subskrypcja</h1>
        <p className="text-muted-foreground">Zarządzaj swoją subskrypcją i planem</p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Twój aktualny plan</CardTitle>
          <CardDescription>
            Opłaca się co miesiąc, możesz zmienić plan w każdej chwili
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground capitalize">
                {currentPlan === 'starter' ? 'Starter' : 'Pro'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {currentPlan === 'starter'
                  ? 'Plan podstawowy dla małych restauracji'
                  : 'Pełny plan z zaawansowanymi funkcjami'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-foreground">{planPrice} zł</p>
              <p className="text-sm text-muted-foreground">/miesiąc</p>
            </div>
          </div>

          {currentPlan === 'starter' && (
            <Link href="/dashboard/billing?upgrade=pro">
              <Button className="w-full">
                <ArrowUpRight className="w-4 h-4 mr-2" />
                Upgrade do Pro
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>

      {/* Plans Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Starter Plan */}
        <Card
          className={currentPlan === 'starter' ? 'border-primary' : 'border-input'}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Starter</CardTitle>
              {currentPlan === 'starter' && (
                <Badge>Aktywny</Badge>
              )}
            </div>
            <CardDescription className="text-2xl font-bold text-primary mt-2">
              99 zł/mies.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {starterFeatures.map((feature, idx) => (
                <li key={idx} className="flex gap-2 items-start">
                  <Check className="w-4 h-4 text-(--confirm) flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Pro Plan */}
        <Card
          className={currentPlan === 'professional' ? 'border-accent' : 'border-input'}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Pro</CardTitle>
              {currentPlan === 'professional' && (
                <Badge className="bg-accent">Aktywny</Badge>
              )}
            </div>
            <CardDescription className="text-2xl font-bold text-accent mt-2">
              199 zł/mies.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {professionalFeatures.map((feature, idx) => (
                <li key={idx} className="flex gap-2 items-start">
                  <Check className="w-4 h-4 text-(--confirm) flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Billing Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informacje o rozliczeniach</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Email rozliczeniowy</p>
            <p className="font-medium text-foreground">{user.email}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Następny rachunek</p>
            <p className="font-medium text-foreground">
              Za 30 dni (automatycznie)
            </p>
          </div>
          <hr className="my-4" />
          <p className="text-xs text-muted-foreground">
            * Subskrypcja jest naliczana co miesiąc. Możesz anulować subskrypcję w
            dowolnym momencie bez dodatkowych opłat.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
