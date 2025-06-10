"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"

interface Bullet {
  id: string
  text: string
}

interface SavedMemo {
  id: string
  title: string
  bullets: Bullet[]
  createdAt: Date
  completedAt?: Date
}

const PAPER_STYLES = {
  width: '297mm',
  minHeight: '210mm',
  maxWidth: '100%',
  aspectRatio: '297/210' as const,
  margin: '0 auto'
}

export default function HomePage() {
  const [title, setTitle] = useState("")
  const [bullets, setBullets] = useState<Bullet[]>([
    { id: Date.now().toString(), text: "" }
  ])
  const [timeLeft, setTimeLeft] = useState(30)
  const [isRunning, setIsRunning] = useState(false)
  const [savedMemos, setSavedMemos] = useState<SavedMemo[]>([])
  const [currentMemoStartTime, setCurrentMemoStartTime] = useState<Date | null>(null)
  const [viewingMemo, setViewingMemo] = useState<SavedMemo | null>(null)

  // 入力があるかチェック
  const hasContent = title.trim() || bullets.some(bullet => bullet.text.trim())

  // localStorage操作関数
  const saveMemoToStorage = useCallback((memo: SavedMemo) => {
    const existingMemos = JSON.parse(localStorage.getItem('savedMemos') || '[]')
    const updatedMemos = [memo, ...existingMemos]
    localStorage.setItem('savedMemos', JSON.stringify(updatedMemos))
    setSavedMemos(updatedMemos)
  }, [])

  const loadMemosFromStorage = useCallback(() => {
    const saved = localStorage.getItem('savedMemos')
    if (saved) {
      const memos = JSON.parse(saved).map((memo: any) => ({
        ...memo,
        createdAt: new Date(memo.createdAt),
        completedAt: memo.completedAt ? new Date(memo.completedAt) : undefined
      }))
      setSavedMemos(memos)
    }
  }, [])

  // 初回読み込み時にlocalStorageからメモを読み込み
  useEffect(() => {
    loadMemosFromStorage()
  }, [])

  // タイマー処理
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0) {
      setIsRunning(false)
      // 30秒経過時にメモを保存してリセット
      if (hasContent && currentMemoStartTime) {
        const memo: SavedMemo = {
          id: Date.now().toString(),
          title,
          bullets: bullets.filter(bullet => bullet.text.trim()),
          createdAt: currentMemoStartTime,
          completedAt: new Date()
        }
        saveMemoToStorage(memo)
      }
      // 新しいメモページを開く
      setTitle("")
      setBullets([{ id: Date.now().toString(), text: "" }])
      setTimeLeft(30)
      setCurrentMemoStartTime(null)
    }
  }, [isRunning, timeLeft, hasContent, currentMemoStartTime, title, bullets, saveMemoToStorage])

  const startTimer = useCallback(() => {
    setIsRunning(true)
    if (timeLeft === 0) {
      setTimeLeft(30)
    }
    if (!currentMemoStartTime) {
      setCurrentMemoStartTime(new Date())
    }
  }, [timeLeft, currentMemoStartTime])

  const stopTimer = useCallback(() => {
    setIsRunning(false)
  }, [])

  const resetTimer = useCallback(() => {
    setIsRunning(false)
    setTimeLeft(30)
  }, [])

  // フォーカス管理
  const focusInput = useCallback((selector: string) => {
    setTimeout(() => {
      const input = document.querySelector(selector) as HTMLInputElement
      input?.focus()
      input?.select()
    }, 0)
  }, [])

  const focusBulletByIndex = useCallback((index: number) => {
    setTimeout(() => {
      const bulletInputs = document.querySelectorAll('.bullet-input')
      const targetInput = bulletInputs[index] as HTMLInputElement
      targetInput?.focus()
      targetInput?.select()
    }, 0)
  }, [])

  // 状態管理
  const updateBullet = useCallback((id: string, value: string) => {
    setBullets(prev =>
      prev.map(bullet =>
        bullet.id === id ? { ...bullet, text: value } : bullet
      )
    )
  }, [])

  const addBullet = useCallback(() => {
    setBullets(prev => [...prev, { id: Date.now().toString(), text: "" }])
  }, [])

  const removeBullet = useCallback((id: string) => {
    setBullets(prev => {
      const filtered = prev.filter(bullet => bullet.id !== id)
      return filtered.length > 0 ? filtered : [{ id: Date.now().toString(), text: "" }]
    })
  }, [])


  // イベントハンドラー
  const handleTitleFocus = useCallback(() => {
    if (!isRunning && timeLeft === 30) {
      setIsRunning(true)
      setCurrentMemoStartTime(new Date())
    }
  }, [isRunning, timeLeft])

  const handleTitleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing && title.trim()) {
      e.preventDefault()
      e.stopPropagation()
      focusInput('.bullet-input')
    }
  }, [title, focusInput])

  const handleBulletKeyDown = useCallback((e: React.KeyboardEvent, bullet: Bullet, index: number) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing && bullet.text.trim()) {
      e.preventDefault()
      e.stopPropagation()

      if (index === bullets.length - 1) {
        addBullet()
        setTimeout(() => focusBulletByIndex(bullets.length), 0)
      } else {
        focusBulletByIndex(index + 1)
      }
    }
  }, [bullets.length, addBullet, focusBulletByIndex])

  // 履歴メモを表示する関数
  const viewMemo = useCallback((memo: SavedMemo) => {
    setViewingMemo(memo)
    setTitle(memo.title)
    setBullets(memo.bullets)
    setIsRunning(false)
    setTimeLeft(30)
    setCurrentMemoStartTime(null)
  }, [])

  // 新しいメモに戻る関数
  const startNewMemo = useCallback(() => {
    setViewingMemo(null)
    setTitle("")
    setBullets([{ id: Date.now().toString(), text: "" }])
    setIsRunning(false)
    setTimeLeft(30)
    setCurrentMemoStartTime(null)
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto flex gap-6">
        {/* メイン入力エリア */}
        <div className="flex-1">
          <div className="bg-white shadow-lg rounded-sm relative" style={PAPER_STYLES}>
          {viewingMemo && (
            <div className="absolute top-4 left-4">
              <Button 
                onClick={startNewMemo}
                variant="outline" 
                size="sm"
                className="text-xs"
              >
                新しいメモ
              </Button>
            </div>
          )}
          <div className="absolute top-4 right-4 flex items-center gap-3">
            <div className="text-2xl font-bold">
              {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
            </div>
            {!viewingMemo && (
              <>
                <Button 
                  onClick={isRunning ? stopTimer : startTimer}
                  variant={isRunning ? "destructive" : "default"}
                  size="sm"
                  className="text-xs px-0 py-1 h-6 w-12"
                >
                  {isRunning ? "停止" : "開始"}
                </Button>
                <Button 
                  onClick={resetTimer} 
                  variant="outline" 
                  size="sm"
                  className="text-xs px-0 py-1 h-6 w-12"
                >
                  リセット
                </Button>
              </>
            )}
          </div>
          <div className="p-8 pt-16 space-y-4">
            <Input
              placeholder="タイトルを入力..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={!viewingMemo ? handleTitleFocus : undefined}
              onKeyDown={!viewingMemo ? handleTitleKeyDown : undefined}
              readOnly={!!viewingMemo}
              className={`!text-6xl font-bold !h-auto py-4 ${title.trim() ? 'border-none shadow-none bg-transparent' : ''} ${viewingMemo ? 'cursor-default' : ''}`}
            />

            <div className="space-y-2">
              {bullets.map((bullet, index) => (
                <div key={bullet.id} className="flex items-center gap-2">
                  <span>•</span>
                  <Input
                    className={`bullet-input ${bullet.text.trim() ? 'border-none shadow-none bg-transparent' : ''} ${viewingMemo ? 'cursor-default' : ''}`}
                    placeholder="箇条書きを入力..."
                    value={bullet.text}
                    onChange={!viewingMemo ? (e) => updateBullet(bullet.id, e.target.value) : undefined}
                    onKeyDown={!viewingMemo ? (e) => handleBulletKeyDown(e, bullet, index) : undefined}
                    readOnly={!!viewingMemo}
                  />
                  {bullets.length > 1 && !viewingMemo && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeBullet(bullet.id)}
                      className="p-1 h-auto"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

          </div>
        </div>
        </div>

        {/* 履歴サイドバー */}
        <div className="w-80">
          <div className="bg-white shadow-lg rounded-sm p-4">
            <h3 className="text-lg font-bold mb-4">メモ履歴 ({savedMemos.length})</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {savedMemos.map((memo) => (
                <div
                  key={memo.id}
                  className="border rounded p-3 hover:bg-gray-50 cursor-pointer"
                  onClick={() => viewMemo(memo)}
                >
                  <div className="font-medium text-sm truncate">
                    {memo.title || "無題"}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {memo.createdAt.toLocaleString('ja-JP', {
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {memo.bullets.length}項目
                  </div>
                </div>
              ))}
              {savedMemos.length === 0 && (
                <div className="text-gray-500 text-sm text-center py-8">
                  まだメモがありません
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}