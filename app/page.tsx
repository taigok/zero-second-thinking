"use client"

import { useState, useCallback } from "react"
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
  }, [])

  // イベントハンドラー
  const handleTitleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && title.trim()) {
      e.preventDefault()
      e.stopPropagation()
      focusInput('.bullet-input')
    }
  }, [title, focusInput])

  const handleBulletKeyDown = useCallback((e: React.KeyboardEvent, bullet: Bullet, index: number) => {
    if (e.key === "Enter" && bullet.text.trim()) {
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
        <div className="bg-white shadow-lg rounded-sm" style={PAPER_STYLES}>
          <div className="p-8 space-y-4">
            <Input
              placeholder="タイトルを入力..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleTitleKeyDown}
              className="!text-6xl font-bold !h-auto py-4"
            />

            <div className="space-y-2">
              {bullets.map((bullet, index) => (
                <div key={bullet.id} className="flex items-center gap-2">
                  <span>•</span>
                  <Input
                    className="bullet-input"
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