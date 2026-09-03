import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/common/Sidebar'
import { Header } from '../components/common/Header'
import { useARMORStore } from '../store/armorStore'

export function AppLayout() {
  const sidebarCollapsed = useARMORStore((s) => s.sidebarCollapsed)

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-armor-bg">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Area */}
      <div
        className="flex flex-col flex-1 min-w-0 overflow-hidden transition-all duration-200"
        style={{ marginLeft: 0 }}
      >
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
