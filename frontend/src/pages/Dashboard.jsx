import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Grid,
  Typography,
  AppBar,
  Toolbar,
  Box,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  useMediaQuery,
  useTheme,
  Snackbar,
  Alert,
  Button,
  FormControlLabel,
  Switch,
  IconButton,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import DownloadIcon from '@mui/icons-material/Download';

import TransactionList from '../components/TransactionList';
import TransactionForm from '../components/TransactionForm';
import AccountIndicator from '../components/AccountIndicator';
import AccountSummary from '../components/AccountSummary';
import BalanceChart from '../components/BalanceChart';
import Filters from '../components/Filters';

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountIds, setSelectedAccountIds] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [filters, setFilters] = useState({
    month: '',
    year: '',
    transactionType: '',
    category: '',
    accountId: '',
    description: '',
    minAmount: '',
    maxAmount: ''
  });
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const loadAccounts = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8000/accounts/');
      const data = await response.json();
      setAccounts(data);
    } catch (error) {
      console.error('Erro ao carregar contas:', error);
    }
  }, []);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.month) params.append('month', filters.month);
      if (filters.year) params.append('year', filters.year);
      if (filters.transactionType) params.append('transaction_type', filters.transactionType);
      if (filters.category) params.append('category', filters.category);
      if (filters.accountId) params.append('account_id', filters.accountId);
      if (filters.description) params.append('description', filters.description);
      if (filters.minAmount) params.append('min_amount', filters.minAmount);
      if (filters.maxAmount) params.append('max_amount', filters.maxAmount);

      const response = await fetch(`http://localhost:8000/transactions/?${params}`);
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
      showSnackbar('Erro ao carregar transações', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Load initial data
  useEffect(() => {
    loadAccounts();
    loadTransactions();
  }, [loadAccounts, loadTransactions]);

  const handleExportDatabase = async () => {
    setExportLoading(true);
    try {
      const response = await fetch('http://localhost:8000/export');
      
      if (!response.ok) {
        throw new Error('Erro ao exportar dados');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      
      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'financial_dashboard_export.json';
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) {
          filename = match[1];
        }
      }
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      showSnackbar('Dados exportados com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      showSnackbar('Erro ao exportar dados', 'error');
    } finally {
      setExportLoading(false);
    }
  };

  const handleTransactionCreated = () => {
    setOpenForm(false);
    loadTransactions();
    loadAccounts(); // Reload accounts to update balances
    showSnackbar('Transação criada com sucesso!', 'success');
  };

  const handleTransactionUpdate = async (transactionId, updateData) => {
    try {
      const response = await fetch(`http://localhost:8000/transactions/${transactionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar transação');
      }

      loadTransactions();
      loadAccounts();
      showSnackbar('Transação atualizada com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      showSnackbar('Erro ao atualizar transação', 'error');
      throw error;
    }
  };

  const handleTransactionDelete = async (transactionId) => {
    try {
      const response = await fetch(`http://localhost:8000/transactions/${transactionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir transação');
      }

      loadTransactions();
      loadAccounts();
      showSnackbar('Transação excluída com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
      showSnackbar('Erro ao excluir transação', 'error');
      throw error;
    }
  };

  const handleAccountUpdate = (updatedAccount) => {
    setAccounts(accounts.map(account => 
      account.id === updatedAccount.id ? updatedAccount : account
    ));
    showSnackbar('Conta atualizada com sucesso!', 'success');
  };

  const handleFiltersChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  const handleToggleSelection = (accountId, isSelected) => {
    if (isSelected) {
      setSelectedAccountIds([...selectedAccountIds, accountId]);
    } else {
      setSelectedAccountIds(selectedAccountIds.filter(id => id !== accountId));
    }
  };

  const handleSelectAll = () => {
    if (selectedAccountIds.length === accounts.length) {
      setSelectedAccountIds([]);
    } else {
      setSelectedAccountIds(accounts.map(account => account.id));
    }
  };

  const handleToggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    if (!selectionMode) {
      setSelectedAccountIds([]);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      {/* App Bar */}
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <AccountBalanceIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Dashboard Financeiro
          </Typography>
          
          {/* Export Button */}
          <Tooltip title="Exportar banco de dados completo">
            <IconButton
              color="inherit"
              onClick={handleExportDatabase}
              disabled={exportLoading}
              sx={{ mr: 1 }}
            >
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Account Indicators */}
          <Grid item xs={12}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h5" gutterBottom>
                Saldo das Contas
              </Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={selectionMode}
                      onChange={handleToggleSelectionMode}
                    />
                  }
                  label="Modo Seleção"
                />
                {selectionMode && (
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={handleSelectAll}
                  >
                    {selectedAccountIds.length === accounts.length ? 'Desmarcar Todas' : 'Selecionar Todas'}
                  </Button>
                )}
              </Box>
            </Box>
            <Grid container spacing={2}>
              {accounts.map((account) => (
                <Grid item xs={12} sm={6} md={3} key={account.id}>
                  <AccountIndicator 
                    account={account} 
                    onAccountUpdate={handleAccountUpdate}
                    isSelected={selectedAccountIds.includes(account.id)}
                    onToggleSelection={selectionMode ? handleToggleSelection : null}
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Account Summary */}
          {(selectionMode || selectedAccountIds.length > 0) && (
            <Grid item xs={12}>
              <AccountSummary 
                accounts={accounts}
                selectedAccountIds={selectedAccountIds}
              />
            </Grid>
          )}

          {/* Balance Chart */}
          <Grid item xs={12} lg={8}>
            <BalanceChart accounts={accounts} />
          </Grid>

          {/* Filters */}
          <Grid item xs={12} lg={4}>
            <Filters 
              filters={filters} 
              onFiltersChange={handleFiltersChange}
              accounts={accounts}
            />
          </Grid>

          {/* Transaction List */}
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
              Transações
            </Typography>
            <TransactionList 
              transactions={transactions} 
              accounts={accounts}
              loading={loading}
              onTransactionUpdate={handleTransactionUpdate}
              onTransactionDelete={handleTransactionDelete}
            />
          </Grid>
        </Grid>
      </Container>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
        onClick={() => setOpenForm(true)}
      >
        <AddIcon />
      </Fab>

      {/* Transaction Form Dialog */}
      <Dialog 
        open={openForm} 
        onClose={() => setOpenForm(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          Nova Transação
        </DialogTitle>
        <DialogContent>
          <TransactionForm 
            accounts={accounts}
            onTransactionCreated={handleTransactionCreated}
            onClose={() => setOpenForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Dashboard; 