"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type Props = {
  num: string
  name: string
  description: string
}

export function ServiceModal({ num, name, description }: Props) {
  return (
    <Dialog>
      <DialogTrigger className="svc-arr">
        Learn More &#8594;
      </DialogTrigger>
      <DialogContent className="svc-modal-content">
        <DialogHeader>
          <p className="svc-num" style={{ marginBottom: 8 }}>{num}</p>
          <DialogTitle className="svc-modal-title">{name}</DialogTitle>
          <DialogDescription className="svc-modal-desc">{description}</DialogDescription>
        </DialogHeader>
        <a
          href="https://calendar.app.google/4wcPnasps28aBHTJ9"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
          style={{ marginTop: 8, display: 'inline-block', textAlign: 'center' }}
        >
          Book a Call
        </a>
      </DialogContent>
    </Dialog>
  )
}
