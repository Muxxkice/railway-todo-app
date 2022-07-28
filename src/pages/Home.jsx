import { useState, useEffect, useCallback } from "react"
import { Link } from "react-router-dom"
import { useCookies } from "react-cookie"
import axios from "axios"
import { Header } from "../components/Header"
import { url } from "../const"
import { SignOut } from "../components/SignOut"
import "./home.scss"
import dayjs from "dayjs"

export const Home = () => {
  const [isDoneDisplay, setIsDoneDisplay] = useState("todo") // todo->未完了 done->完了
  const [lists, setLists] = useState([])
  const [selectListId, setSelectListId] = useState()
  const [tasks, setTasks] = useState([])
  const [errorMessage, setErrorMessage] = useState("")
  const [cookies] = useCookies()

  const handleIsDoneDisplayChange = (e) => setIsDoneDisplay(e.target.value)
  useEffect(() => {
    axios
      .get(`${url}/lists`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        setLists(res.data)
      })
      .catch((err) => {
        setErrorMessage(`リストの取得に失敗しました。${err}`)
      })
  }, [])

  useEffect(() => {
    const listId = lists[0]?.id
    if (typeof listId !== "undefined") {
      setSelectListId(listId)
      axios
        .get(`${url}/lists/${listId}/tasks`, {
          headers: {
            authorization: `Bearer ${cookies.token}`,
          },
        })
        .then((res) => {
          setTasks(res.data.tasks)
        })
        .catch((err) => {
          setErrorMessage(`タスクの取得に失敗しました。${err}`)
        })
    }
  }, [lists])

  const handleSelectList = (id) => {
    setSelectListId(id)
    axios
      .get(`${url}/lists/${id}/tasks`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        console.log(res)
        setTasks(res.data.tasks)
      })
      .catch((err) => {
        setErrorMessage(`タスクの取得に失敗しました。${err}`)
      })
  }

  return (
    <>
      <Header />
      <main className="taskList">
        <p className="error-message">{errorMessage}</p>
        <div classNmame="main-container">
          <div className="list-menu">
            <div className="list-header">
              <h2>リスト一覧</h2>
            </div>
            <button type="button" className="nav-btn">
              <span className="btn-line"></span>
            </button>
            <p>
              <Link to="/list/new">リスト新規作成</Link>
            </p>
            <p>
              <Link to={`/lists/${selectListId}/edit`}>
                選択中のリストを編集
              </Link>
            </p>
          </div>

          <ul className="list-tab" role="tablist">
            {lists.map((list, key) => {
              const isActive = list.id === selectListId
              return (
                <li
                  key={key}
                  role="presentation"
                  className={`list-tab-item ${isActive ? "active" : ""}`}
                  onClick={() => {
                    handleSelectList(list.id)
                  }}
                >
                  <button
                    role="tab"
                    aria-label={list.title}
                    aria-controls={`panel-${key}`}
                    // disabled={isActive}
                  >
                    {list.title}
                  </button>
                </li>
              )
            })}
          </ul>
          <div className="tasks">
            <div className="display-select-wrapper">
              <div className="tasks-header">
                <h2>タスク一覧</h2>
              </div>
              <Link to="/task/new">タスク新規作成</Link>
              <br />
              <select
                onChange={handleIsDoneDisplayChange}
                className="display-select"
              >
                <option value="todo">未完了</option>
                <option value="done">完了</option>
              </select>
            </div>
            <div className="task-item-wrapper">
              <Tasks
                tasks={tasks}
                selectListId={selectListId}
                isDoneDisplay={isDoneDisplay}
              />
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

const RemainingTime = ({ to }) => {
  const limit = dayjs(to)
  const today = dayjs()
  const diff = limit.diff(today, "day")
  // console.log(diff)
  if (diff === 0) {
    if (limit.diff(today, "hour") !== 0) {
      return (
        <p className="limit_diff">
          残り<span>{limit.diff(today, "hour")}</span>時間
        </p>
      )
    } else {
      return (
        <p className="limit_diff">
          残り<span>{limit.diff(today, "minute")}</span>分
        </p>
      )
    }
  } else if (diff >= 0) {
    return (
      <p className="limit_diff">
        残り<span>{diff}</span>日
      </p>
    )
  } else {
    return (
      <p className="limit_diff">
        <span> 期限を過ぎています</span>
      </p>
    )
  }
}

// 表示するタスク
const Tasks = (props) => {
  const { tasks, selectListId, isDoneDisplay } = props
  if (tasks === null) return <></>

  if (isDoneDisplay == "done") {
    return (
      <ul>
        {tasks
          .filter((task) => {
            return task.done === true
          })
          .map((task, key) => (
            <div key={key} className="tasks-container">
              <li className="task-item">
                <p className="task-item-title">{task.title}</p>
                <Link
                  to={`/lists/${selectListId}/tasks/${task.id}`}
                  className="task-item-link"
                >
                  <p>{task.done ? "完了" : "未完了"}</p>
                </Link>
              </li>
            </div>
          ))}
      </ul>
    )
  }

  return (
    <ul>
      {tasks
        .filter((task) => {
          return task.done === false
        })
        .map((task, key) => (
          <div key={key} className="task-item">
            <Link
              to={`/lists/${selectListId}/tasks/${task.id}`}
              className="task-item-link"
            >
              <p className="task-item-title">{task.title}</p>
              <lavel>期限</lavel>
              <p>{dayjs(task.limit).format("YYYY年M月D日")}</p>
              <RemainingTime to={task.limit} />
              <p>{task.done ? "完了" : "未完了"}</p>
            </Link>
          </div>
        ))}
    </ul>
  )
}
