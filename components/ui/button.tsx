import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md',
        cta: 'bg-(--cta) text-(--cta-foreground) hover:bg-(--cta)/90 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]',
        confirm: 'bg-(--confirm) text-(--confirm-foreground) hover:bg-(--confirm)/90 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md hover:shadow-lg',
        outline:
          'border-2 border-border bg-transparent hover:bg-secondary hover:border-secondary-foreground/20 shadow-sm',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm',
        ghost:
          'hover:bg-secondary hover:text-secondary-foreground',
        link: 'text-accent underline-offset-4 hover:underline hover:text-accent/80',
      },
      size: {
        default: 'h-10 px-5 py-2.5 has-[>svg]:px-4',
        sm: 'h-9 rounded-lg gap-1.5 px-4 text-xs has-[>svg]:px-3',
        lg: 'h-12 rounded-xl px-8 text-base has-[>svg]:px-6',
        icon: 'size-10',
        'icon-sm': 'size-9',
        'icon-lg': 'size-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
