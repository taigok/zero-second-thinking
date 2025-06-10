"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

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

  const resetMemo = useCallback(() => {
    setTitle("")
    setBullets([{ id: Date.now().toString(), text: "" }])
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>シンプルメモ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="タイトルを入力..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <div className="space-y-2">
              {bullets.map((bullet) => (
                <div key={bullet.id} className="flex items-center gap-2">
                  <span>•</span>
                  <Input
                    placeholder="箇条書きを入力..."
                    value={bullet.text}
                    onChange={(e) => updateBullet(bullet.id, e.target.value)}
                  />
                </div>
              ))}
              <Button variant="outline" onClick={addBullet} className="w-full">
                + 箇条書きを追加
              </Button>
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