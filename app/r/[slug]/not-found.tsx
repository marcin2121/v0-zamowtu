import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Utensils, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center px-4">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
          <Utensils className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Restauracja nie znaleziona
        </h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          Przepraszamy, nie znaleźliśmy restauracji o podanej nazwie. 
          Sprawdź czy adres jest poprawny lub wyszukaj restauracje na naszej stronie.
        </p>
        <Link href="/">
          <Button>
            <Home className="w-4 h-4 mr-2" />
            Wróć na stronę główną
          </Button>
        </Link>
      </div>
    </div>
  )
}
