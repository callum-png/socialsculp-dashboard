'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePlaidLink } from 'react-plaid-link'

type Account = {
  id: string
  plaidAccountId: string
  name: string
  officialName: string | null
  type: string
  subtype: string | null
  mask: string | null
  currentBalance: number | null
  availableBalance: number | null
  isoCurrencyCode: string | null
}

type Connection = {
  id: string
  institutionName: string | null
  createdAt: string
  accounts: Account[]
}

type Transaction = {
  id: string
  amount: number
  date: string
  name: string
  merchantName: string | null
  category: string[]
  pending: boolean
  account: {
    name: string
    mask: string | null
    type: string
    connection: { institutionName: string | null }
  }
}

function formatCurrency(amount: number, code?: string | null) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: code || 'USD',
  }).format(amount)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function categoryLabel(cats: string[]) {
  if (!cats.length) return 'Uncategorized'
  return cats[0].replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

// ─── Plaid Link Button ──────────────────────────────────────────────────────
function ConnectBankButton({ onSuccess }: { onSuccess: () => void }) {
  const [linkToken, setLinkToken] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/plaid/create-link-token', { method: 'POST' })
      .then(r => r.json())
      .then(d => setLinkToken(d.link_token))
      .catch(console.error)
  }, [])

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (public_token, metadata) => {
      await fetch('/api/plaid/exchange-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_token, metadata }),
      })
      // Auto-sync after connecting
      await fetch('/api/plaid/sync', { method: 'POST' })
      onSuccess()
    },
  })

  return (
    <button
      onClick={() => open()}
      disabled={!ready}
      className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#008cff] hover:bg-[#0070d6] text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
    >
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
      Connect Bank Account
    </button>
  )
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function FinancePage() {
  const [tab, setTab] = useState<'dashboard' | 'transactions' | 'accounts' | 'settings'>('dashboard')
  const [connections, setConnections] = useState<Connection[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [txTotal, setTxTotal] = useState(0)
  const [txPage, setTxPage] = useState(1)
  const [txPages, setTxPages] = useState(0)
  const [search, setSearch] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [lastSynced, setLastSynced] = useState<Date | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchAccounts = useCallback(async () => {
    const res = await fetch('/api/plaid/accounts')
    const data = await res.json()
    setConnections(data.connections || [])
  }, [])

  const fetchTransactions = useCallback(async (page = 1, q = '') => {
    const params = new URLSearchParams({ page: String(page), limit: '50', search: q })
    const res = await fetch(`/api/plaid/transactions?${params}`)
    const data = await res.json()
    setTransactions(data.transactions || [])
    setTxTotal(data.total || 0)
    setTxPage(data.page || 1)
    setTxPages(data.pages || 0)
  }, [])

  const handleSync = useCallback(async () => {
    setSyncing(true)
    try {
      await fetch('/api/plaid/sync', { method: 'POST' })
      await Promise.all([fetchAccounts(), fetchTransactions(1, search)])
      setLastSynced(new Date())
    } finally {
      setSyncing(false)
    }
  }, [fetchAccounts, fetchTransactions, search])

  const handleDisconnect = useCallback(async (connectionId: string) => {
    if (!confirm('Disconnect this bank? All synced transactions from this bank will be removed.')) return
    await fetch('/api/plaid/accounts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ connectionId }),
    })
    await fetchAccounts()
    await fetchTransactions(1, search)
  }, [fetchAccounts, fetchTransactions, search])

  useEffect(() => {
    Promise.all([fetchAccounts(), fetchTransactions()]).finally(() => setLoading(false))
  }, [fetchAccounts, fetchTransactions])

  const allAccounts = connections.flatMap(c => c.accounts)
  const totalBalance = allAccounts.reduce((s, a) => s + (a.currentBalance || 0), 0)

  // Compute monthly stats from transactions
  const now = new Date()
  const thisMonth = transactions.filter(t => {
    const d = new Date(t.date)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  // Plaid: positive amounts = money out, negative = money in
  const monthlyExpenses = thisMonth.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0)
  const monthlyIncome = thisMonth.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0)

  // Category breakdown
  const categoryMap: Record<string, number> = {}
  transactions.filter(t => t.amount > 0).forEach(t => {
    const cat = categoryLabel(t.category)
    categoryMap[cat] = (categoryMap[cat] || 0) + t.amount
  })
  const categories = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)

  const TABS = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'transactions', label: 'Transactions' },
    { key: 'accounts', label: 'Accounts' },
    { key: 'settings', label: 'Settings' },
  ] as const

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#008cff] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Finance Tracker</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {allAccounts.length} account{allAccounts.length !== 1 ? 's' : ''} connected
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSync}
            disabled={syncing || connections.length === 0}
            className="inline-flex items-center gap-2 px-3 py-2 bg-muted hover:bg-muted/80 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            <svg
              className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {syncing ? 'Syncing...' : 'Sync'}
          </button>
          <ConnectBankButton onSuccess={() => { fetchAccounts(); fetchTransactions(1, search) }} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-lg w-fit">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              tab === t.key ? 'bg-card text-[#008cff] shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Dashboard ──────────────────────────────────────────────────── */}
      {tab === 'dashboard' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Balance', value: formatCurrency(totalBalance), color: 'text-foreground' },
              { label: 'Income (This Month)', value: formatCurrency(monthlyIncome), color: 'text-emerald-400' },
              { label: 'Expenses (This Month)', value: formatCurrency(monthlyExpenses), color: 'text-red-400' },
              { label: 'Net (This Month)', value: formatCurrency(monthlyIncome - monthlyExpenses), color: monthlyIncome - monthlyExpenses >= 0 ? 'text-emerald-400' : 'text-red-400' },
            ].map(card => (
              <div key={card.label} className="bg-card rounded-lg border border-border p-5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{card.label}</p>
                <p className={`text-2xl font-bold mt-2 ${card.color}`}>{card.value}</p>
              </div>
            ))}
          </div>

          {connections.length === 0 && (
            <div className="bg-card rounded-lg border border-border p-12 text-center">
              <div className="text-4xl mb-4">🏦</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No banks connected</h3>
              <p className="text-sm text-muted-foreground mb-6">Connect your bank account to automatically import transactions and track your finances.</p>
              <ConnectBankButton onSuccess={() => { fetchAccounts(); fetchTransactions(1, search) }} />
            </div>
          )}

          {/* Spending by Category */}
          {categories.length > 0 && (
            <div className="bg-card rounded-lg border border-border p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Spending by Category</h3>
              <div className="space-y-3">
                {categories.map(([cat, amount]) => {
                  const pct = (amount / (categories[0][1] || 1)) * 100
                  return (
                    <div key={cat} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-32 truncate">{cat}</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-[#008cff] rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs font-medium text-foreground w-20 text-right">{formatCurrency(amount)}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Recent Transactions */}
          {transactions.length > 0 && (
            <div className="bg-card rounded-lg border border-border p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Recent Transactions</h3>
              <div className="space-y-2">
                {transactions.slice(0, 10).map(tx => (
                  <div key={tx.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{tx.merchantName || tx.name}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(tx.date)} · {categoryLabel(tx.category)}</p>
                    </div>
                    <span className={`text-sm font-semibold ${tx.amount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {tx.amount > 0 ? '-' : '+'}{formatCurrency(Math.abs(tx.amount))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Transactions ───────────────────────────────────────────────── */}
      {tab === 'transactions' && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Search transactions..."
              value={search}
              onChange={e => { setSearch(e.target.value); fetchTransactions(1, e.target.value) }}
              className="flex-1 px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#008cff]/50"
            />
          </div>

          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Description</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Account</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(tx.date)}</td>
                    <td className="px-4 py-3 text-foreground">
                      <span className="font-medium">{tx.merchantName || tx.name}</span>
                      {tx.pending && <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-yellow-500/10 text-yellow-500 rounded">Pending</span>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{categoryLabel(tx.category)}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {tx.account.connection.institutionName} ••{tx.account.mask}
                    </td>
                    <td className={`px-4 py-3 text-right font-semibold ${tx.amount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {tx.amount > 0 ? '-' : '+'}{formatCurrency(Math.abs(tx.amount))}
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                      {connections.length === 0 ? 'Connect a bank account to see transactions.' : 'No transactions found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {txPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{txTotal} transactions</p>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchTransactions(txPage - 1, search)}
                  disabled={txPage <= 1}
                  className="px-3 py-1.5 text-xs font-medium bg-muted rounded-md disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1.5 text-xs text-muted-foreground">
                  Page {txPage} of {txPages}
                </span>
                <button
                  onClick={() => fetchTransactions(txPage + 1, search)}
                  disabled={txPage >= txPages}
                  className="px-3 py-1.5 text-xs font-medium bg-muted rounded-md disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Accounts ───────────────────────────────────────────────────── */}
      {tab === 'accounts' && (
        <div className="space-y-4">
          {connections.length === 0 ? (
            <div className="bg-card rounded-lg border border-border p-12 text-center">
              <div className="text-4xl mb-4">🏦</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No banks connected</h3>
              <p className="text-sm text-muted-foreground mb-6">Connect your bank account to get started.</p>
              <ConnectBankButton onSuccess={() => { fetchAccounts(); fetchTransactions(1, search) }} />
            </div>
          ) : (
            connections.map(conn => (
              <div key={conn.id} className="bg-card rounded-lg border border-border p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-semibold text-foreground">{conn.institutionName || 'Unknown Bank'}</h3>
                    <p className="text-xs text-muted-foreground">Connected {formatDate(conn.createdAt)}</p>
                  </div>
                  <button
                    onClick={() => handleDisconnect(conn.id)}
                    className="text-xs text-red-400 hover:text-red-300 font-medium"
                  >
                    Disconnect
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {conn.accounts.map(acct => (
                    <div key={acct.id} className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">{acct.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{acct.type}{acct.subtype ? ` · ${acct.subtype}` : ''} {acct.mask ? `••${acct.mask}` : ''}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-foreground">
                            {acct.currentBalance != null ? formatCurrency(acct.currentBalance, acct.isoCurrencyCode) : '—'}
                          </p>
                          {acct.availableBalance != null && acct.availableBalance !== acct.currentBalance && (
                            <p className="text-xs text-muted-foreground">{formatCurrency(acct.availableBalance, acct.isoCurrencyCode)} available</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Settings ───────────────────────────────────────────────────── */}
      {tab === 'settings' && (
        <div className="bg-card rounded-lg border border-border p-5 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Sync Transactions</h3>
            <p className="text-xs text-muted-foreground mb-3">Pull the latest transactions from your connected banks.</p>
            <div className="flex items-center gap-4">
              <button
                onClick={handleSync}
                disabled={syncing || connections.length === 0}
                className="px-4 py-2 bg-[#008cff] hover:bg-[#0070d6] text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                {syncing ? 'Syncing...' : 'Sync Now'}
              </button>
              {lastSynced && (
                <span className="text-xs text-muted-foreground">Last synced: {lastSynced.toLocaleTimeString()}</span>
              )}
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <h3 className="text-sm font-semibold text-foreground mb-1">Connected Banks</h3>
            <p className="text-xs text-muted-foreground mb-3">{connections.length} bank{connections.length !== 1 ? 's' : ''} connected, {allAccounts.length} account{allAccounts.length !== 1 ? 's' : ''} total.</p>
          </div>

          <div className="border-t border-border pt-6">
            <h3 className="text-sm font-semibold text-foreground mb-1">Data</h3>
            <p className="text-xs text-muted-foreground">{txTotal} transactions synced across all accounts.</p>
          </div>
        </div>
      )}
    </div>
  )
}
