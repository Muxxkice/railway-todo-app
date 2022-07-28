import { useCookies } from "react-cookie"
import { useSelector, useDispatch } from "react-redux/es/exports"
import { useNavigate } from "react-router-dom"
import { signOut } from "../authSlice"
import { SignOut } from "./SignOut"
import "./header.scss"

export const Header = () => {
  const navigate = useNavigate()

  return (
    <header className="header">
      <button onClick={() => navigate("/")}>
        <h1>Todoアプリ</h1>
      </button>
      <SignOut />
    </header>
  )
}
