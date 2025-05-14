// types/auth.d.ts
import { JWT } from 'next-auth/jwt'
import { Session, User } from 'next-auth'

declare module 'next-auth' {
  /**
   * Extend the built-in session types
   */
  interface Session {
    user: {
      id?: string
      name?: string // No null, only string or undefined
      access?: string
      username?: string
      role?: string
      // Add any other fields returned by your auth API
      [key: string]: any
    }
  }

  /**
   * Extend the built-in user types
   */
  interface User {
    id: string
    name?: string | null // Can be null in the User type
    access?: string
    username?: string
    role?: string
    // Add any other user properties from your API
    [key: string]: any
  }
}

declare module 'next-auth/jwt' {
  /**
   * Extend the built-in JWT types
   */
  interface JWT {
    id?: string
    name?: string // No null in JWT, only string or undefined
    access?: string
    username?: string
    role?: string
    // Add any other token fields
    [key: string]: any
  }
}
