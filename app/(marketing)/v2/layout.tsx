export default function V2Layout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#040810', minHeight: '100vh' }}>
      {children}
    </div>
  )
}
