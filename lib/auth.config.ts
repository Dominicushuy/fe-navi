// lib/auth.config.ts
import type { JWT } from 'next-auth/jwt'
import type { Session, User } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authConfig = {
  debug: process.env.NODE_ENV !== 'production',
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Sign in',
      credentials: {
        username: {
          label: 'UserName',
          type: 'text',
        },
        password: { label: 'Password', type: 'password' },
        type: { label: 'Type', type: 'hidden' },
      },
      async authorize(credentials) {
        const isProduction = process.env.NODE_ENV === 'production'

        // Define request key
        let body = {}
        let url = ''

        switch (credentials?.type) {
          case 'loginCasso': {
            url = process.env.NEXT_PRIVATE_API_LOGIN_URL as string

            body = {
              'employee-id': credentials?.username,
              'casso-token': credentials?.password,
            }
            break
          }
          default:
            url = isProduction
              ? `${process.env.NEXT_PRIVATE_API_URL}/navi/login/`
              : `${process.env.NEXT_PUBLIC_API_URL}/navi/login/`

            body = {
              username: credentials?.username,
              password: credentials?.password,
            }
            break
        }

        try {
          const response = await fetch(url, {
            headers: {
              'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify(body),
          })

          const data = await response.json()

          if (data?.access) {
            return {
              ...data,
              name: data?.username || undefined, // Ensure name is string or undefined, not null
            }
          }
          return null
        } catch (error) {
          console.error('Authentication error:', error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    // Add proper type annotations for callback parameters
    async jwt({
      token,
      user,
    }: {
      token: JWT
      user: User | undefined
    }): Promise<JWT> {
      // If user exists (after signin), merge user data with token
      if (user) {
        return {
          ...token,
          // Handle potential null values from user object
          access: user.access,
          username: user.username,
          role: user.role,
          // Ensure name is string or undefined, not null
          name: user.name || token.name || undefined,
          // Add any other fields from user that need special handling
        }
      }
      return token
    },
    async session({
      session,
      token,
    }: {
      session: Session
      token: JWT
    }): Promise<Session> {
      // Add token data to the session.user
      session.user = {
        ...session.user,
        access: token.access,
        username: token.username,
        role: token.role,
        name: token.name,
        // Add other token fields as needed
      }
      return session
    },
  },
  trustHost: true,
}
