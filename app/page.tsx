"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"

interface Bullet {
  id: string
  text: string
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

  // 入力があるかチェック
  const hasContent = title.trim() || bullets.some(bullet => bullet.text.trim())

  // タイマー処理
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0) {
      setIsRunning(false)
    }
  }, [isRunning, timeLeft])

  const startTimer = useCallback(() => {
    setIsRunning(true)
    if (timeLeft === 0) {
      setTimeLeft(30)
    }
  }, [timeLeft])

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

  const resetMemo = useCallback(() => {
    setTitle("")
    setBullets([{ id: Date.now().toString(), text: "" }])
    resetTimer()
  }, [resetTimer])

  // イベントハンドラー
  const handleTitleFocus = useCallback(() => {
    if (!isRunning && timeLeft === 30) {
      setIsRunning(true)
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

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow-lg rounded-sm relative" style={PAPER_STYLES}>
          <div className="absolute top-4 right-4 flex items-center gap-3">
            <div className="text-2xl font-bold">
              {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
            </div>
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
          </div>
          <div className="p-8 pt-16 space-y-4">
            <Input
              placeholder="タイトルを入力..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={handleTitleFocus}
              onKeyDown={handleTitleKeyDown}
              className={`!text-6xl font-bold !h-auto py-4 ${title.trim() ? 'border-none shadow-none bg-transparent' : ''}`}
            />

            <div className="space-y-2">
              {bullets.map((bullet, index) => (
                <div key={bullet.id} className="flex items-center gap-2">
                  <span>•</span>
                  <Input
                    className={`bullet-input ${bullet.text.trim() ? 'border-none shadow-none bg-transparent' : ''}`}
                    placeholder="箇条書きを入力..."
                    value={bullet.text}
                    onChange={(e) => updateBullet(bullet.id, e.target.value)}
                    onKeyDown={(e) => handleBulletKeyDown(e, bullet, index)}
                  />
                  {bullets.length > 1 && (
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

            <Button onClick={resetMemo} className="w-full">
              リセット
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}