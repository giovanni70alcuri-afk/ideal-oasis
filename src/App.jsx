import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout/Layout'
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute'
import { HomePage } from './pages/Home/Home'
import { LoginPage } from './pages/Auth/Login'
import { SignupPage } from './pages/Auth/Signup'
import { ProfilePage } from './pages/Profile/Profile'
import { CreatePostPage } from './pages/CreatePost/CreatePost'
import { PostDetailPage } from './pages/PostDetail/PostDetail'
import { NotificationsPage } from './pages/Notifications/Notifications'

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="profile/:userId" element={<ProfilePage />} />
        <Route path="post/:postId" element={<PostDetailPage />} />
        
        {/* Protected routes */}
        <Route
          path="create"
          element={
            <ProtectedRoute>
              <CreatePostPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
