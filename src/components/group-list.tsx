"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { CreateGroupDialog } from "./create-group-dialog"
import { useState } from "react"

interface Group {
  id: string
  name: string
  description: string
  memberCount: number
}

export function GroupList() {
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  // Mock data - replace with actual API call
  const groups: Group[] = [
    {
      id: "1",
      name: "General",
      description: "General discussion",
      memberCount: 12,
    },
    {
      id: "2",
      name: "Development",
      description: "Dev team discussions",
      memberCount: 8,
    },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Your Groups</h2>
        <Button onClick={() => setShowCreateDialog(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New Group
        </Button>
      </div>

      <div className="grid gap-4">
        {groups.map((group) => (
          <Link key={group.id} href={`/chat/${group.id}`}>
            <Card className="hover:bg-muted/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-lg">{group.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{group.description}</p>
                <p className="text-sm mt-2">{group.memberCount} members</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <CreateGroupDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
    </div>
  )
}

