import { useState } from "react";
import { Plus, Search, Filter, ArrowUp, ArrowDown } from "lucide-react";

const mockTransactions = [
  { id: 1, date: "2024-05-18", description: "Apple Music Subscription", category: "Entertainment", amount: -9.99, type: "EXPENSE" },
  { id: 2, date: "2024-05-17", description: "Freelance Project Payment", category: "Salary", amount: 2500.00, type: "INCOME" },
  { id: 3, date: "2024-05-16", description: "Whole Foods Market", category: "Groceries", amount: -84.50, type: "EXPENSE" },
  { id: 4, date: "2024-05-15", description: "Shell Gas Station", category: "Transportation", amount: -55.00, type: "EXPENSE" },
  { id: 5, date: "2024-05-14", description: "Monthly Rent", category: "Housing", amount: -1200.00, type: "EXPENSE" },
  { id: 6, date: "2024-05-14", description: "Stock Dividends", category: "Investments", amount: 154.20, type: "INCOME" },
];

export default function Transactions() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div>
      {/* Header */}
      <div className="page-header header-actions">
        <div>
          <h2 className="page-title">Transactions</h2>
          <p className="page-subtitle">Manage and track your all your spending.</p>
        </div>
        <button className="primary-btn">
          <Plus style={{width: 20, height: 20}} />
          Add Transaction
        </button>
      </div>

      {/* Filters Bar */}
      <div className="filters-bar">
        <div className="search-wrapper">
          <Search className="search-icon" style={{width: 20, height: 20}} />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <button className="secondary-btn">
          <Filter style={{width: 16, height: 16}} />
          More Filters
        </button>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Transaction</th>
              <th>Category</th>
              <th>Date</th>
              <th className="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {mockTransactions.map((tx) => (
              <tr key={tx.id}>
                <td>
                  <div className="tx-cell">
                    <div className={`tx-icon ${tx.type === 'INCOME' ? 'income' : 'expense'}`}>
                      {tx.type === 'INCOME' ? <ArrowDown style={{width: 16, height: 16}} /> : <ArrowUp style={{width: 16, height: 16}} />}
                    </div>
                    <span className="tx-desc">{tx.description}</span>
                  </div>
                </td>
                <td>
                  <span className="category-badge">
                    {tx.category}
                  </span>
                </td>
                <td className="tx-date">
                  {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className={`tx-amount ${tx.amount > 0 ? 'positive' : 'negative'}`}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {mockTransactions.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">
              <Search style={{width: 32, height: 32}} />
            </div>
            <p className="empty-title">No transactions found</p>
            <p className="empty-desc">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
