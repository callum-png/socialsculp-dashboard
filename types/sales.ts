export type Section = {
  title: string
  body: string
}

export type MeetingNote = {
  title: string
  body: string
  date: string
}

export type CallPrepRow = {
  id: string
  prospect: string
  company: string | null
  callType: string
  scheduledAt: string | null
  sections: Section[]
  research: Section[] | null
  meetingNotes: MeetingNote[]
  createdAt: string
}

export type PlaybookRow = {
  id: string
  name: string
  description: string | null
  sections: Section[]
  createdAt: string
}
