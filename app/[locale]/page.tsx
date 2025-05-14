// app/[locale]/page.tsx
import { redirect } from 'next/navigation'
import { DEFAULT_PAGE } from '@/constants/router'

export default function HomePage() {
  redirect(`/${DEFAULT_PAGE}`)
}
