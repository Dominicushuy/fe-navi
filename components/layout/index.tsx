import { Sidebar } from './sidebar'
import { Navbar } from './navbar'

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex min-h-screen'>
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className='flex-1 flex flex-col'>
        <Navbar />
        <main className='flex-1 p-6'>{children}</main>
      </div>
    </div>
  )
}
