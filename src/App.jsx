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
            </Route>
          </Routes>
        </BrowserRouter>
      </Provider>
    </>
  )
}

export default App
