"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"

interface Bullet {
  id: string
  text: string
}

export default function HomePage() {
  const [title, setTitle] = useState("")
  const [bullets, setBullets] = useState<Bullet[]>([
    { id: Date.now().toString(), text: "" }
  ])

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
      // 最低1つは残す
      return filtered.length > 0 ? filtered : [{ id: Date.now().toString(), text: "" }]
    })
  }, [])

  const resetMemo = useCallback(() => {
    setTitle("")
    setBullets([{ id: Date.now().toString(), text: "" }])
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="space-y-4 pt-6">
            <Input
              placeholder="タイトルを入力..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  e.stopPropagation()
                  if (title.trim()) {
                    setTimeout(() => {
                      const firstBulletInput = document.querySelector('.bullet-input') as HTMLInputElement
                      if (firstBulletInput) {
                        firstBulletInput.focus()
                        firstBulletInput.select() // 既存の文字があれば選択状態にする
                      }
                    }, 0)
                  }
                }
              }}
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
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        e.stopPropagation()
                        // 現在の入力欄が空でない場合のみ次へ進む
                        if (bullet.text.trim()) {
                          if (index === bullets.length - 1) {
                            // 最後の箇条書きの場合、新しい箇条書きを追加
                            addBullet()
                            setTimeout(() => {
                              const bulletInputs = document.querySelectorAll('.bullet-input')
                              const lastInput = bulletInputs[bulletInputs.length - 1] as HTMLInputElement
                              if (lastInput) {
                                lastInput.focus()
                                lastInput.select()
                              }
                            }, 0)
                          } else {
                            // 次の箇条書きにフォーカス
                            setTimeout(() => {
                              const bulletInputs = document.querySelectorAll('.bullet-input')
                              const nextInput = bulletInputs[index + 1] as HTMLInputElement
                              if (nextInput) {
                                nextInput.focus()
                                nextInput.select()
                              }
                            }, 0)
                          }
                        }
                      }
                    }}
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}