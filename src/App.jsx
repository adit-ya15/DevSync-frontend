import { BrowserRouter, Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import Body from "./Body"
import Login from "./pages/Login"
import Profile from "./pages/Profile"
import { Provider } from "react-redux"
import appStore from "./redux/appStore"
import Feed from "./pages/Feed"
import Connections from "./pages/connections"
import UserProfile from "./pages/UserProfile"
import Requests from "./pages/Requests"
import { Toaster } from 'react-hot-toast'

function App() {

  return (
    <>
      <Provider store={appStore}>
        <BrowserRouter basename="/">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Body />}>
              <Route path="/" element={<Feed />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/connections" element={<Connections />} />
              <Route path="/user/:userId" element={<UserProfile />} />
              <Route path="/requests" element={<Requests />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1e1e1e',
              color: '#f5f5f5',
              border: '1px solid #2a2a2a',
              borderRadius: '12px',
              fontSize: '0.88rem',
              padding: '12px 18px',
            },
            success: {
              iconTheme: { primary: '#34d399', secondary: '#111' },
            },
            error: {
              iconTheme: { primary: '#f87171', secondary: '#111' },
            },
          }}
        />
      </Provider>
    </>
  )
}

export default App
