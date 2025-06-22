"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  const [timeLeft, setTimeLeft] = useState(60)
  const [isRunning, setIsRunning] = useState(false)
  const [savedMemos, setSavedMemos] = useState<SavedMemo[]>([])
  const [currentMemoStartTime, setCurrentMemoStartTime] = useState<Date | null>(null)
  const [viewingMemo, setViewingMemo] = useState<SavedMemo | null>(null)
  const [activeTab, setActiveTab] = useState<"memo" | "history">("memo")

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
      // 1分経過時にメモを保存してリセット
      const currentTitle = title
      const currentBullets = bullets
      const currentHasContent = currentTitle.trim() || currentBullets.some(bullet => bullet.text.trim())
      
      if (currentHasContent && currentMemoStartTime) {
        const memo: SavedMemo = {
          id: Date.now().toString(),
          title: currentTitle,
          bullets: currentBullets.filter(bullet => bullet.text.trim()),
          createdAt: currentMemoStartTime,
          completedAt: new Date()
        }
        saveMemoToStorage(memo)
      }
      // 新しいメモページを開く
      setTitle("")
      setBullets([{ id: Date.now().toString(), text: "" }])
      setTimeLeft(60)
      setCurrentMemoStartTime(null)
    }
  }, [isRunning, timeLeft])

  const startTimer = useCallback(() => {
    setIsRunning(true)
    if (timeLeft === 0) {
      setTimeLeft(60)
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
    setTimeLeft(60)
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
    if (!isRunning && timeLeft === 60) {
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
    setActiveTab("memo")
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

  // メモを日付で分類する関数
  const categorizeMemos = useCallback(() => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    const isToday = (date: Date) => {
      return date.toDateString() === today.toDateString()
    }
    
    const isYesterday = (date: Date) => {
      return date.toDateString() === yesterday.toDateString()
    }
    
    return {
      today: savedMemos.filter(memo => isToday(memo.createdAt)),
      yesterday: savedMemos.filter(memo => isYesterday(memo.createdAt)),
      older: savedMemos.filter(memo => !isToday(memo.createdAt) && !isYesterday(memo.createdAt))
    }
  }, [savedMemos])

  return (
    <div className="min-h-screen bg-gray-100 p-2">
      <div className="mx-auto" style={{width: PAPER_STYLES.width, maxWidth: PAPER_STYLES.maxWidth}}>
        {/* 紙の幅に合わせたコントロール */}
        <div className="flex items-center justify-between mb-1">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "memo" | "history")}>
            <TabsList className="h-8 bg-gray-200/50 border">
              <TabsTrigger value="memo" className="px-3 py-1 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:font-semibold hover:bg-white/70 transition-colors">メモ</TabsTrigger>
              <TabsTrigger value="history" className="px-3 py-1 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:font-semibold hover:bg-white/70 transition-colors">履歴</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {activeTab === "memo" && (
            <div className="flex items-center gap-3">
              {viewingMemo && (
                <Button 
                  onClick={startNewMemo}
                  variant="default" 
                  size="sm"
                  className="h-7 px-3 text-sm"
                >
                  新しいメモ
                </Button>
              )}
              <div className="text-2xl font-bold tabular-nums">
                {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
              </div>
              {!viewingMemo && (
                <>
                  <Button 
                    onClick={isRunning ? stopTimer : startTimer}
                    variant={isRunning ? "destructive" : "default"}
                    size="sm"
                    className="h-7 px-3 text-sm"
                  >
                    {isRunning ? "停止" : "開始"}
                  </Button>
                  <Button 
                    onClick={resetTimer} 
                    variant="outline" 
                    size="sm"
                    className="h-7 px-3 text-sm"
                  >
                    リセット
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        {/* A4紙 */}
        <div className="bg-white shadow-lg rounded-sm" style={PAPER_STYLES}>
          
          {activeTab === "memo" && (
            <div className="p-4 space-y-3 relative">
              {/* 今日の日付 */}
              <div className="absolute top-4 right-4 text-sm text-gray-500">
                {new Date().toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <Input
                placeholder="タイトルを入力..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onFocus={!viewingMemo ? handleTitleFocus : undefined}
                onKeyDown={!viewingMemo ? handleTitleKeyDown : undefined}
                readOnly={!!viewingMemo}
                className={`!text-3xl font-bold !h-auto py-3 overflow-hidden pr-32 ${title.trim() ? 'border-none shadow-none bg-transparent' : ''} ${viewingMemo ? 'cursor-default' : ''}`}
              />

              <div className="space-y-1">
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
                        className="p-0.5 h-auto"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="p-4">
              <h3 className="text-xl font-bold mb-4">メモ履歴 ({savedMemos.length})</h3>
              <Tabs defaultValue="today" className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-8">
                  <TabsTrigger value="today" className="text-sm py-1">今日</TabsTrigger>
                  <TabsTrigger value="yesterday" className="text-sm py-1">昨日</TabsTrigger>
                  <TabsTrigger value="older" className="text-sm py-1">以前</TabsTrigger>
                </TabsList>
                
                <TabsContent value="today" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categorizeMemos().today.map((memo) => (
                      <div
                        key={memo.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                        onClick={() => viewMemo(memo)}
                      >
                        <div className="font-medium text-lg truncate mb-2">
                          {memo.title || "無題"}
                        </div>
                        <div className="text-sm text-gray-500 mb-2">
                          {memo.createdAt.toLocaleString('ja-JP', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <div className="text-sm text-gray-600">
                          {memo.bullets.length}項目
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          {memo.bullets.slice(0, 2).map(bullet => bullet.text).join(', ')}
                          {memo.bullets.length > 2 && '...'}
                        </div>
                      </div>
                    ))}
                    {categorizeMemos().today.length === 0 && (
                      <div className="col-span-full text-gray-500 text-center py-8">
                        今日のメモはありません
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="yesterday" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categorizeMemos().yesterday.map((memo) => (
                      <div
                        key={memo.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                        onClick={() => viewMemo(memo)}
                      >
                        <div className="font-medium text-lg truncate mb-2">
                          {memo.title || "無題"}
                        </div>
                        <div className="text-sm text-gray-500 mb-2">
                          {memo.createdAt.toLocaleString('ja-JP', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <div className="text-sm text-gray-600">
                          {memo.bullets.length}項目
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          {memo.bullets.slice(0, 2).map(bullet => bullet.text).join(', ')}
                          {memo.bullets.length > 2 && '...'}
                        </div>
                      </div>
                    ))}
                    {categorizeMemos().yesterday.length === 0 && (
                      <div className="col-span-full text-gray-500 text-center py-8">
                        昨日のメモはありません
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="older" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categorizeMemos().older.map((memo) => (
                      <div
                        key={memo.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                        onClick={() => viewMemo(memo)}
                      >
                        <div className="font-medium text-lg truncate mb-2">
                          {memo.title || "無題"}
                        </div>
                        <div className="text-sm text-gray-500 mb-2">
                          {memo.createdAt.toLocaleString('ja-JP', {
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <div className="text-sm text-gray-600">
                          {memo.bullets.length}項目
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          {memo.bullets.slice(0, 2).map(bullet => bullet.text).join(', ')}
                          {memo.bullets.length > 2 && '...'}
                        </div>
                      </div>
                    ))}
                    {categorizeMemos().older.length === 0 && (
                      <div className="col-span-full text-gray-500 text-center py-8">
                        以前のメモはありません
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}