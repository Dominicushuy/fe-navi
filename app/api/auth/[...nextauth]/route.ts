// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'

// Create and export the auth handler
const handler = NextAuth(authConfig)
export { handler as GET, handler as POST }
