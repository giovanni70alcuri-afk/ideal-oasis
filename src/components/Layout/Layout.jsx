import { Outlet } from 'react-router-dom'
import { Navbar } from '../Navbar/Navbar'
import { LeftSidebar } from '../Sidebar/LeftSidebar'
import { RightSidebar } from '../Sidebar/RightSidebar'
import './Layout.css'

export function Layout() {
  return (
    <div className="layout">
      <Navbar />
      <div className="layout-body">
        <aside className="layout-left">
          <LeftSidebar />
        </aside>
        <main className="layout-main">
          <Outlet />
        </main>
        <aside className="layout-right">
          <RightSidebar />
        </aside>
      </div>
    </div>
  )
}
