// actions/auth.ts
'use server'

import { signIn, signOut } from 'next-auth/react'
import { DEFAULT_PAGE } from '@/constants/router'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// Login with username/password
export async function loginWithCredentials(formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string
  const callbackUrl =
    (formData.get('callbackUrl') as string) || `/${DEFAULT_PAGE}`

  try {
    const result = await signIn('credentials', {
      username,
      password,
      redirect: false,
    })

    if (result?.error) {
      return {
        success: false,
        error: 'ユーザー名またはパスワードが正確ではありません',
      }
    }

    // Set the authentication cookie - with SIMPLER settings
    const cookieStore = await cookies()
    cookieStore.set('logged-in', 'true', {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return { success: true, redirectUrl: callbackUrl }
  } catch (error) {
    console.error('Login error:', error)
    return {
      success: false,
      error: 'エラーが発生しました。もう一度試してください',
    }
  }
}

// Login with Casso
export async function loginWithCasso(employeeId: string, cassoToken: string) {
  try {
    const result = await signIn('credentials', {
      username: employeeId,
      password: cassoToken,
      type: 'loginCasso',
      redirect: false,
    })

    if (result?.error) {
      return {
        success: false,
        error: 'Casso認証に失敗しました',
      }
    }

    // Set the authentication cookie
    const cookieStore = await cookies()
    cookieStore.set('logged-in', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return { success: true, redirectUrl: `/${DEFAULT_PAGE}` }
  } catch (error) {
    console.error('Casso login error:', error)
    return {
      success: false,
      error: 'エラーが発生しました。もう一度試してください',
    }
  }
}

// Logout
export async function logout() {
  // Clear the authentication cookie
  const cookieStore = await cookies()
  cookieStore.set('logged-in', '', {
    path: '/',
    expires: new Date(0),
    maxAge: 0,
  })

  // Sign out via auth.js
  await signOut({ redirect: false })

  // Redirect to login
  redirect('/login')
}
