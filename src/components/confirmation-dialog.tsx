"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

interface ConfirmationDialogProps {
  open: boolean
  onClose: () => void
  applicationId: string
}

export default function ConfirmationDialog({ open, onClose, applicationId }: ConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Application Submitted Successfully!</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-6 space-y-4">
          <CheckCircle className="h-16 w-16 text-green-500" />
          <p className="text-center">Thank you for your application. We have received it and will review it shortly.</p>
          <p className="text-sm text-gray-500">
            Your application ID: <span className="font-mono font-medium">{applicationId}</span>
          </p>
          <p className="text-sm text-blue-600">You will be redirected to the home page in a few seconds...</p>
        </div>
        <DialogFooter className="sm:justify-center">
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
