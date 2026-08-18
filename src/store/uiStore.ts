import { create } from 'zustand'
import type { BillingInterval, UpgradeTrigger } from '@/types/subscription'
import type { Transaction, TransactionType } from '@/types/transaction'

interface UiState {
  isTransactionFormOpen: boolean
  transactionFormType: TransactionType
  editingTransaction: Transaction | null
  openTransactionForm: (type?: TransactionType, editing?: Transaction | null) => void
  closeTransactionForm: () => void

  isUpgradeModalOpen: boolean
  upgradeTrigger: UpgradeTrigger
  openUpgradeModal: (trigger: UpgradeTrigger) => void
  closeUpgradeModal: () => void

  isCheckoutModalOpen: boolean
  checkoutInterval: BillingInterval
  openCheckoutModal: (interval: BillingInterval) => void
  closeCheckoutModal: () => void

  isSidebarCollapsed: boolean
  toggleSidebar: () => void
}

export const useUiStore = create<UiState>((set) => ({
  isTransactionFormOpen: false,
  transactionFormType: 'expense',
  editingTransaction: null,
  openTransactionForm: (type = 'expense', editing = null) =>
    set({
      isTransactionFormOpen: true,
      transactionFormType: editing?.type ?? type,
      editingTransaction: editing,
    }),
  closeTransactionForm: () =>
    set({ isTransactionFormOpen: false, editingTransaction: null }),

  isUpgradeModalOpen: false,
  upgradeTrigger: 'generic',
  openUpgradeModal: (trigger) => set({ isUpgradeModalOpen: true, upgradeTrigger: trigger }),
  closeUpgradeModal: () => set({ isUpgradeModalOpen: false }),

  isCheckoutModalOpen: false,
  checkoutInterval: 'yearly',
  openCheckoutModal: (interval) =>
    set({ isCheckoutModalOpen: true, isUpgradeModalOpen: false, checkoutInterval: interval }),
  closeCheckoutModal: () => set({ isCheckoutModalOpen: false }),

  isSidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
}))
