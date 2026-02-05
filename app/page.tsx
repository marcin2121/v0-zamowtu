import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { ContactForm } from '@/components/contact-form'
import { 
  Utensils, 
  ShoppingBag, 
  BarChart3, 
  Settings, 
  Smartphone,
  CheckCircle2,
  ArrowRight,
  Star,
  Tag,
  Crown,
  MessageSquare,
  CreditCard,
  TrendingUp,
  Palette
} from 'lucide-react'

const features = [
  {
    icon: ShoppingBag,
    title: 'Zamówienia online',
    description: 'Przyjmuj zamówienia 24/7. Klienci zamawiają na teraz lub planują na później.',
    pro: false
  },
  {
    icon: Utensils,
    title: 'Zarządzanie menu',
    description: 'Łatwe dodawanie dań, kategorii, cen i dostępności produktów w czasie rzeczywistym.',
    pro: false
  },
  {
    icon: Settings,
    title: 'Pełna konfiguracja',
    description: 'Harmonogram, minimalna wartość zamówienia, zasięg dostawy, koszty i więcej.',
    pro: false
  },
  {
    icon: Smartphone,
    title: 'Responsywny design',
    description: 'Doskonały wygląd na każdym urządzeniu - komputer, tablet, telefon.',
    pro: false
  },
  {
    icon: CreditCard,
    title: 'Płatności online',
    description: 'Integracja Przelewy24. Każda restauracja konfiguruje własne konto.',
    pro: false
  },
  {
    icon: Tag,
    title: 'Kody rabatowe',
    description: 'Twórz promocje z limitami użyć, datami ważności i harmonogramem (dni i godziny aktywacji).',
    pro: true
  },
  {
    icon: Crown,
    title: 'Program lojalności',
    description: 'Nagradzaj regularnych klientów. Ustawiaj poziomy zniżek bazujące na wydatkach.',
    pro: true
  },
  {
    icon: MessageSquare,
    title: 'Opinie i oceny',
    description: 'Zbieraj opinie klientów po dostarczeniu zamówienia. Odpowiadaj na recenzje.',
    pro: true
  },
  {
    icon: Palette,
    title: 'Personalizacja menu',
    description: 'Dostosuj kolory, logo, baner i wygląd strony menu do wizerunku restauracji.',
    pro: true
  },
  {
    icon: BarChart3,
    title: 'Zaawansowane statystyki',
    description: 'Praktyczne wskazówki na temat zarobków, trendów i optymalizacji operacji.',
    pro: true
  }
]

const pricingPlans = [
  {
    name: 'Starter',
    price: '99',
    description: 'Plan podstawowy',
    features: [
      'Płatności online (Przelewy24)',
      'Menu i zamówienia',
      'Harmonogram otwarcia',
      'Ustawienia dostawy',
      'Historia zamówień',
      'Wsparcie techniczne'
    ],
    cta: 'Zacznij za 99 zł',
    highlight: false,
    price_period: 'zł/mies.',
    link: '/auth/sign-up?plan=starter'
  },
  {
    name: 'Pro',
    price: '199',
    description: 'Plan premium',
    features: [
      'Wszystko w Starter +',
      'Zaawansowane statystyki',
      'Kody rabatowe i promocje',
      'Program lojalności',
      'Opinie i oceny',
      'Personalizacja menu (kolory, logo)',
      'Priorytetowe wsparcie'
    ],
    cta: 'Wybierz Pro',
    highlight: true,
    price_period: 'zł/mies.',
    link: '/auth/sign-up?plan=pro'
  },
  {
    name: 'Enterprise',
    price: 'Indywidualnie',
    description: 'Dla sieci restauracji',
    features: [
      'Wszystko z planu Pro',
      'Wiele lokalizacji',
      'Dostęp do API',
      'Dedykowany opiekun',
      'Gwarancja SLA',
      'Customizacja integracji'
    ],
    cta: 'Skontaktuj się',
    highlight: false,
    link: '/auth/sign-up?contact=true'
  }
]


 const testimonials = [
  {
    name: 'Anna Kowalska',
    restaurant: 'Pizzeria Roma',
    content: 'Od kiedy korzystamy z ZamówTu, liczba zamówień online wzrosła o 40%. Program lojalności bardzo zachęca klientów do powrotu.',
    rating: 5
  },
  {
    name: 'Marek Nowak',
    restaurant: 'Sushi Master',
    content: 'Statystyki pokazują nam dokładnie, które dania sprzedają się najlepiej. Robimy lepsze decyzje biznesowe.',
    rating: 5
  },
  {
    name: 'Katarzyna Wiszniewski',
    restaurant: 'Bistro Pod Lipami',
    content: 'System płatności online zwiększył nam konwersje. Klienci preferują płacić kartą. Polecam każdej restauracji!',
    rating: 5
  }
]
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:bg-slate-950/95">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Utensils className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-foreground">ZamówTu</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#funkcje" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Funkcje
            </a>
            <a href="#cennik" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Cennik
            </a>
            <a href="#opinie" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Opinie
            </a>
            <a href="#kontakt" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Kontakt
            </a>
            <Link href="/demo" className="text-sm text-primary font-medium hover:text-primary/80 transition-colors">
              Demo
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">Zaloguj się</Button>
            </Link>
            <Link href="/auth/sign-up?plan=starter">
              <Button size="sm" variant="cta">Załóż konto</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <TrendingUp className="w-4 h-4" />
              Zwiększ z nami swoją sprzedaż
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6 text-balance">
              System zamówień online, który pomaga Ci zdobywać klientów
            </h1>
            <p className="text-xl text-muted-foreground mb-8 text-balance leading-relaxed">
              Od 99 zł/mies. otrzymujesz płatności online, menu, zamówienia i harmonogram. Za 199 zł/mies. dodajemy kody rabatowe, program lojalności i zaawansowane statystyki.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/sign-up?plan=starter">
                <Button size="lg" variant="cta" className="w-full sm:w-auto">
                  Zacznij za 99 zł
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                  Zobacz demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="funkcje" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Wszystko czego potrzebujesz do wzrostu
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              9 potężnych funkcji wspierających sprzedaż i automatyzujących operacje
            </p>
          </div>
          
          {/* Free Features */}
          <div className="mb-16">
            <h3 className="text-lg font-semibold text-foreground mb-8 text-center">Dostępne w obu planach</h3>
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {features.filter(f => !f.pro).map((feature) => (
                <div key={feature.title} className="flex gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-foreground">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pro Features */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-8 text-center">Tylko w planie Pro</h3>
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {features.filter(f => f.pro).map((feature) => (
                <div key={feature.title} className="flex gap-4 p-4 rounded-lg border border-primary/20 bg-primary/5 hover:border-primary/50 transition-colors">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground">{feature.title}</h4>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary/20 text-primary">Pro</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="cennik" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Prosty cennik dla każdej restauracji
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Zacznij z bazowym planem za 99 zł. Przejdź na Pro kiedy chcesz.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <Card 
                key={plan.name} 
                className={`relative flex flex-col ${plan.highlight ? 'border-accent/30 bg-accent/[0.02] shadow-[0_8px_24px_rgba(220,38,38,0.12)] md:scale-105' : ''}`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-accent text-accent-foreground text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                      Najpopularniejszy
                    </span>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-center flex-1 flex flex-col">
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    {plan.price_period && (
                      <span className="text-muted-foreground"> {plan.price_period}</span>
                    )}
                  </div>
                  <ul className="space-y-3 mb-6 text-left flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-(--confirm) flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href={plan.link} className="w-full">
                    <Button className="w-full" variant={plan.highlight ? 'cta' : 'outline'}>
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="opinie" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Czemu restauratorzy nas kochają
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Zobacz jak ZamówTu zmienił ich biznes
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {'"'}{testimonial.content}{'"'}
                  </p>
                  <div>
                    <p className="font-medium text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.restaurant}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="kontakt" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Masz pytania?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Skontaktuj się z nami. Odpowiemy jak najszybciej.
            </p>
          </div>
          <div className="flex justify-center">
            <Card className="w-full max-w-md">
              <CardContent className="pt-6">
                <ContactForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center p-12 rounded-4xl border-none border-0 border-background shadow-xl bg-sidebar-primary">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Gotowy na wzrost?
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-8">
              Załóż konto w kilka minut. Plan Starter dostępny za 99 zł/mies.
            </p>
            <Link href="/auth/sign-up?plan=starter">
              <Button size="lg" variant="cta">
                Zacznij za 99 zł
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Utensils className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground">ZamówTu</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 ZamówTu. Wszystkie prawa zastrzezone.
            </p>
            <div className="flex gap-6">
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Regulamin
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Prywatność
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Kontakt
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
