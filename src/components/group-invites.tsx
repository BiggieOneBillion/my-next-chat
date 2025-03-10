"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"

interface Invite {
  id: string
  groupId: string
  groupName: string
  invitedBy: {
    name: string
  }
  status: "pending" | "accepted" | "rejected"
}

export function GroupInvites() {
  // Mock data - replace with actual API call
  const invites: Invite[] = [
    {
      id: "1",
      groupId: "group1",
      groupName: "Design Team",
      invitedBy: {
        name: "John Doe",
      },
      status: "pending",
    },
  ]

  const handleInviteResponse = async (inviteId: string, accept: boolean) => {
    try {
      const response = await fetch(`/api/invites/${inviteId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: accept ? "accepted" : "rejected" }),
      })

      if (!response.ok) {
        throw new Error("Failed to update invite")
      }

      // Refresh invites list
    } catch (error) {
      console.error("Error updating invite:", error)
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Group Invites</h2>
      <div className="grid gap-4">
        {invites.map((invite) => (
          <Card key={invite.id}>
            <CardHeader>
              <CardTitle className="text-lg">Invitation to join {invite.groupName}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Invited by {invite.invitedBy.name}</p>
              {invite.status === "pending" && (
                <div className="flex gap-2">
                  <Button onClick={() => handleInviteResponse(invite.id, true)} size="sm" className="w-24">
                    <Check className="w-4 h-4 mr-2" />
                    Accept
                  </Button>
                  <Button
                    onClick={() => handleInviteResponse(invite.id, false)}
                    variant="outline"
                    size="sm"
                    className="w-24"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Decline
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {invites.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">No pending invites</CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

