import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Layout } from './components/Layout/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { HomePage }          from './pages/Home/Home'
import { LoginPage }         from './pages/Auth/Login'
import { SignupPage }        from './pages/Auth/Signup'
import { ProfilePage }       from './pages/Profile/Profile'
import { PostDetailPage }    from './pages/Post/PostDetail'
import { CreatePostPage }    from './pages/CreatePost/CreatePost'
import { NotificationsPage } from './pages/Notifications/Notifications'
import { FriendsPage }       from './pages/Friends/Friends'
import { ReelsPage }         from './pages/Reels/Reels'
import { MarketplacePage }   from './pages/Marketplace/Marketplace'
import { CollectionsPage }   from './pages/Collections/Collections'
import { LocalPage }         from './pages/Local/Local'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Public */}
          <Route index element={<HomePage />} />
          <Route path="login"   element={<LoginPage />} />
          <Route path="signup"  element={<SignupPage />} />
          <Route path="profile/:userId" element={<ProfilePage />} />
          <Route path="post/:postId"    element={<PostDetailPage />} />
          <Route path="reels"           element={<ReelsPage />} />
          <Route path="marketplace"     element={<MarketplacePage />} />
          <Route path="local"           element={<LocalPage />} />

          {/* Protected */}
          <Route path="create"      element={<ProtectedRoute><CreatePostPage /></ProtectedRoute>} />
          <Route path="notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="friends"     element={<ProtectedRoute><FriendsPage /></ProtectedRoute>} />
          <Route path="collections" element={<ProtectedRoute><CollectionsPage /></ProtectedRoute>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background:'#0d1120', color:'#f0f2ff',
            border:'1px solid rgba(255,255,255,0.12)',
            borderRadius:'14px', padding:'0.875rem 1rem',
            fontFamily:"'DM Sans', sans-serif",
          },
          success: { iconTheme:{ primary:'#4dffb4', secondary:'#080b14' } },
          error:   { iconTheme:{ primary:'#ff4d6a', secondary:'#080b14' } },
        }}
      />
    </>
  )
}

export default App
