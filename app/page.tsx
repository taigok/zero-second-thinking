"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Play, Pause, SkipForward, CalendarIcon, FileText, Settings, CheckCircle, Clock } from "lucide-react"

interface Memo {
  id: string
  title: string
  bullets: string[]
  date: string
  timestamp: number
}

interface DayRecord {
  date: string
  memoCount: number
  completed: boolean
}

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  return isMobile
}

export default function ZeroSecondThinking() {
  // 状態管理
  const [currentView, setCurrentView] = useState<"writing" | "calendar" | "history" | "settings">("writing")
  const [currentMemo, setCurrentMemo] = useState({ title: "", bullets: [""] })
  const [timeLeft, setTimeLeft] = useState(30)
  const [isActive, setIsActive] = useState(false)
  const [sessionCount, setSessionCount] = useState(0)
  const [minMemos, setMinMemos] = useState(10)
  const [sessionCompleted, setSessionCompleted] = useState(false)
  const [isTyping, setIsTyping] = useState(false)

  // データ保存用
  const [memos, setMemos] = useState<Memo[]>([])
  const [dayRecords, setDayRecords] = useState<DayRecord[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  // ローカルストレージからデータ読み込み
  useEffect(() => {
    const savedMemos = localStorage.getItem("zero-thinking-memos")
    const savedRecords = localStorage.getItem("zero-thinking-records")
    const savedSettings = localStorage.getItem("zero-thinking-settings")

    if (savedMemos) setMemos(JSON.parse(savedMemos))
    if (savedRecords) setDayRecords(JSON.parse(savedRecords))
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      setMinMemos(settings.minMemos || 10)
    }
  }, [])

  // タイマー機能
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && timeLeft > 0 && !isTyping) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
    } else if (isActive && timeLeft === 0 && !isTyping) {
      handleNextMemo()
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timeLeft, isTyping])

  const isMobile = useIsMobile()

  // メモ保存
  const saveMemo = () => {
    if (currentMemo.title.trim() || currentMemo.bullets.some((b) => b.trim())) {
      const newMemo: Memo = {
        id: Date.now().toString(),
        title: currentMemo.title,
        bullets: currentMemo.bullets.filter((b) => b.trim()),
        date: new Date().toISOString().split("T")[0],
        timestamp: Date.now(),
      }

      const updatedMemos = [...memos, newMemo]
      setMemos(updatedMemos)
      localStorage.setItem("zero-thinking-memos", JSON.stringify(updatedMemos))

      updateDayRecord()
    }
  }

  // 日次記録更新
  const updateDayRecord = () => {
    const today = new Date().toISOString().split("T")[0]
    const newCount = sessionCount + 1
    setSessionCount(newCount)

    const existingRecord = dayRecords.find((r) => r.date === today)
    const updatedRecords = existingRecord
      ? dayRecords.map((r) => (r.date === today ? { ...r, memoCount: newCount, completed: newCount >= minMemos } : r))
      : [...dayRecords, { date: today, memoCount: newCount, completed: newCount >= minMemos }]

    setDayRecords(updatedRecords)
    localStorage.setItem("zero-thinking-records", JSON.stringify(updatedRecords))

    if (newCount >= minMemos) {
      setSessionCompleted(true)
    }
  }

  // 次のメモへ
  const handleNextMemo = () => {
    saveMemo()
    setCurrentMemo({ title: "", bullets: [""] })
    setTimeLeft(30)
    setIsActive(false)
    setIsTyping(false)

    // 次のメモに移動した後、少し待ってから最初の入力フィールドにフォーカス
    setTimeout(() => {
      const firstInput = document.querySelector("input") as HTMLInputElement
      if (firstInput) {
        firstInput.focus()
      }
    }, 200)
  }

  // タイマー開始/停止
  const toggleTimer = () => {
    setIsActive(!isActive)
  }

  // 箇条書き更新をuseCallbackでメモ化
  const updateBullet = useCallback((index: number, value: string) => {
    setCurrentMemo((prev) => {
      const newBullets = [...prev.bullets]
      newBullets[index] = value
      return { ...prev, bullets: newBullets }
    })
  }, [])

  // タイトル更新もuseCallbackでメモ化
  const updateTitle = useCallback((value: string) => {
    setCurrentMemo((prev) => ({ ...prev, title: value }))
  }, [])

  const addBullet = useCallback(() => {
    setCurrentMemo((prev) => ({
      ...prev,
      bullets: [...prev.bullets, ""],
    }))
  }, [])

  // 設定保存
  const saveSettings = () => {
    localStorage.setItem("zero-thinking-settings", JSON.stringify({ minMemos }))
  }

  // 日付が目標達成日かどうかを判定
  const isCompletedDate = (date: Date) => {
    const dateString = date.toISOString().split("T")[0]
    const record = dayRecords.find((r) => r.date === dateString)
    return record ? record.completed : false
  }

  // 選択された日付のメモを取得
  const getMemosForDate = (date: Date) => {
    const dateString = date.toISOString().split("T")[0]
    return memos.filter((memo) => memo.date === dateString)
  }

  // メイン画面（メモ作成）
  const WritingView = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">０秒思考</h1>
        <div className="flex items-center justify-center gap-4 mb-4">
          <Badge variant={sessionCompleted ? "default" : "secondary"}>
            {sessionCount}/{minMemos} 完了
          </Badge>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="text-2xl font-mono">{timeLeft}秒</span>
          </div>
        </div>
        <Progress value={(sessionCount / minMemos) * 100} className="w-full max-w-md mx-auto" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>メモ #{sessionCount + 1}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            key="title-input"
            placeholder="タイトルを入力..."
            value={currentMemo.title}
            onChange={(e) => updateTitle(e.target.value)}
            onFocus={() => setIsTyping(true)}
            onBlur={() => setIsTyping(false)}
          />

          <div className="space-y-2">
            {currentMemo.bullets.map((bullet, index) => (
              <div key={`bullet-${index}`} className="flex items-center gap-2">
                <span>•</span>
                <Input
                  key={`bullet-input-${index}`}
                  placeholder="箇条書きを入力..."
                  value={bullet}
                  onChange={(e) => updateBullet(index, e.target.value)}
                  onFocus={() => setIsTyping(true)}
                  onBlur={() => setIsTyping(false)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addBullet()
                      setTimeout(() => {
                        const inputs = document.querySelectorAll("input")
                        const nextInput = inputs[inputs.length - 1] as HTMLInputElement
                        if (nextInput) {
                          nextInput.focus()
                        }
                      }, 50)
                    }
                  }}
                />
              </div>
            ))}
            <Button variant="outline" onClick={addBullet} className="w-full">
              + 箇条書きを追加
            </Button>
          </div>

          <div className="flex gap-2">
            <Button onClick={toggleTimer} className="flex-1">
              {isActive ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isActive ? "ポーズ" : "スタート"}
            </Button>
            <Button variant="outline" onClick={handleNextMemo}>
              <SkipForward className="w-4 h-4 mr-2" />
              次へ
            </Button>
          </div>
        </CardContent>
      </Card>

      {sessionCompleted && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-green-800">今日の目標達成！</h3>
              <p className="text-green-600">最低{minMemos}枚のメモを完了しました</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  // カレンダー画面
  const CalendarView = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center">継続カレンダー</h2>
      <Card>
        <CardContent className="pt-6">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md border mx-auto"
            modifiers={{
              completed: (date) => isCompletedDate(date),
            }}
            modifiersStyles={{
              completed: { backgroundColor: "#22c55e", color: "white" },
            }}
          />
          <div className="mt-4 text-center">
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm">目標達成日</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // 履歴画面
  const HistoryView = () => {
    const selectedMemos = getMemosForDate(selectedDate)

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center">過去のメモ</h2>
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDate.toLocaleDateString("ja-JP")} のメモ ({selectedMemos.length}件)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              {selectedMemos.length === 0 ? (
                <p className="text-center text-gray-500 py-8">この日のメモはありません</p>
              ) : (
                <div className="space-y-4">
                  {selectedMemos.map((memo, index) => (
                    <div key={memo.id}>
                      <div className="space-y-2">
                        <h4 className="font-semibold">{memo.title || `メモ #${index + 1}`}</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                          {memo.bullets.map((bullet, bulletIndex) => (
                            <li key={bulletIndex}>{bullet}</li>
                          ))}
                        </ul>
                        <p className="text-xs text-gray-400">{new Date(memo.timestamp).toLocaleTimeString("ja-JP")}</p>
                      </div>
                      {index < selectedMemos.length - 1 && <Separator className="my-4" />}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 設定画面
  const SettingsView = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center">設定</h2>
      <Card>
        <CardHeader>
          <CardTitle>目標設定</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">1日の最低メモ枚数</label>
            <Input
              type="number"
              value={minMemos}
              onChange={(e) => setMinMemos(Number.parseInt(e.target.value) || 10)}
              min="1"
              max="50"
            />
          </div>
          <Button onClick={saveSettings} className="w-full">
            設定を保存
          </Button>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* ナビゲーション */}
        <div className="flex justify-center mb-6">
          <div className="flex bg-white rounded-lg p-1 shadow-sm">
            <Button
              variant={currentView === "writing" ? "default" : "ghost"}
              size="sm"
              onClick={() => setCurrentView("writing")}
            >
              <FileText className="w-4 h-4 mr-2" />
              メモ
            </Button>
            <Button
              variant={currentView === "calendar" ? "default" : "ghost"}
              size="sm"
              onClick={() => setCurrentView("calendar")}
            >
              <CalendarIcon className="w-4 h-4 mr-2" />
              カレンダー
            </Button>
            <Button
              variant={currentView === "history" ? "default" : "ghost"}
              size="sm"
              onClick={() => setCurrentView("history")}
            >
              <FileText className="w-4 h-4 mr-2" />
              履歴
            </Button>
            <Button
              variant={currentView === "settings" ? "default" : "ghost"}
              size="sm"
              onClick={() => setCurrentView("settings")}
            >
              <Settings className="w-4 h-4 mr-2" />
              設定
            </Button>
          </div>
        </div>

        {/* メインコンテンツ */}
        {currentView === "writing" && <WritingView />}
        {currentView === "calendar" && <CalendarView />}
        {currentView === "history" && <HistoryView />}
        {currentView === "settings" && <SettingsView />}
      </div>
    </div>
  )
}
