import { useState, useEffect } from "react"
import { useCookies } from "react-cookie"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import dayjs from "dayjs"

import { url } from "../const"
import { Header } from "../components/Header"
import "./newTask.scss"

export const NewTask = () => {
  const [selectListId, setSelectListId] = useState()
  const [lists, setLists] = useState([])
  const [title, setTitle] = useState("")
  const [detail, setDetail] = useState("")
  const [limit, setLimit] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [cookies] = useCookies()
  const navigate = useNavigate()
  const handleTitleChange = (e) => setTitle(e.target.value)
  const handleDetailChange = (e) => setDetail(e.target.value)
  const handleSelectList = (id) => setSelectListId(id)

  const handleLimitChange = (e) => {
    const date = dayjs(e.target.value)
    console.log(date.format("YYYY-MM-DDThh:mmZ[Z]"))
    console.log(date.toISOString())
    setLimit(date.toISOString())
  }

  const onCreateTask = () => {
    const data = {
      title: title,
      detail: detail,
      limit: limit,
      done: false,
    }

    axios
      .post(`${url}/lists/${selectListId}/tasks`, data, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        console.log(res)
        navigate("/")
      })
      .catch((err) => {
        setErrorMessage(`タスクの作成に失敗しました。${err}`)
      })
  }

  useEffect(() => {
    axios
      .get(`${url}/lists`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        setLists(res.data)
        setSelectListId(res.data[0]?.id)
      })
      .catch((err) => {
        setErrorMessage(`リストの取得に失敗しました。${err}`)
      })
  }, [])

  return (
    <div>
      <Header />
      <main className="new-task">
        <h2>タスク新規作成</h2>
        <p className="error-message">{errorMessage}</p>
        <form className="new-task-form">
          <label>リスト</label>
          <br />
          <select
            onChange={(e) => handleSelectList(e.target.value)}
            className="new-task-select-list"
          >
            {lists.map((list, key) => (
              <option key={key} className="list-item" value={list.id}>
                {list.title}
              </option>
            ))}
          </select>
          <br />
          <label>タイトル</label>
          <br />
          <input
            type="text"
            onChange={handleTitleChange}
            className="new-task-title"
          />
          <br />
          <label>詳細</label>
          <br />
          <textarea
            type="text"
            onChange={handleDetailChange}
            className="new-task-detail"
          />
          <br />
          <label>タスクの期限</label>
          <br />
          <input
            type="datetime-local"
            onChange={handleLimitChange}
            className="new-task-limit"
          />
          <br />
          <button
            type="button"
            className="new-task-button"
            onClick={onCreateTask}
          >
            作成
          </button>
        </form>
      </main>
    </div>
  )
}
