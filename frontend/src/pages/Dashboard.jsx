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
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import DownloadIcon from '@mui/icons-material/Download';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BarChartIcon from '@mui/icons-material/BarChart';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

import { useThemeMode } from '../App';
import apiCache from '../utils/apiCache';
import TransactionList from '../components/TransactionList';
import TransactionForm from '../components/TransactionForm';
import AccountIndicator from '../components/AccountIndicator';
import AccountSummary from '../components/AccountSummary';
import BalanceChart from '../components/BalanceChart';
import Filters from '../components/Filters';
import AdvancedStats from '../components/AdvancedStats';
import FinancialGoals from '../components/FinancialGoals';
import MonthlyExpensesSummary from '../components/MonthlyExpensesSummary';

// Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ mt: 3 }}>{children}</Box>}
    </div>
  );
}

const Dashboard = () => {
  const theme = useTheme();
  const { darkMode, toggleDarkMode } = useThemeMode();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [currentTab, setCurrentTab] = useState(0);
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
      const data = await apiCache.fetchWithCache('http://localhost:8000/accounts/');
      setAccounts(data);
    } catch (error) {
      console.error('Erro ao carregar contas:', error);
    }
  }, []);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.month) params.month = filters.month;
      if (filters.year) params.year = filters.year;
      if (filters.transactionType) params.transaction_type = filters.transactionType;
      if (filters.category) params.category = filters.category;
      if (filters.accountId) params.account_id = filters.accountId;
      if (filters.description) params.description = filters.description;

      let data = await apiCache.fetchWithCache('http://localhost:8000/transactions/', params);
      
      // Apply client-side value filters if API doesn't support them yet
      if (filters.minAmount !== '') {
        const minAmount = parseFloat(filters.minAmount);
        data = data.filter(t => t.amount >= minAmount);
      }
      
      if (filters.maxAmount !== '') {
        const maxAmount = parseFloat(filters.maxAmount);
        data = data.filter(t => t.amount <= maxAmount);
      }
      
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
    // Limpar cache para forçar reload dos dados
    apiCache.clear('transactions');
    apiCache.clear('accounts');
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

      // Limpar cache para forçar reload dos dados
      apiCache.clear('transactions');
      apiCache.clear('accounts');
      loadTransactions();
      loadAccounts();
      showSnackbar('Transação atualizada com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      showSnackbar('Erro ao atualizar transação', 'error');
    }
  };

  const handleTransactionDelete = async (transactionId) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      try {
        const response = await fetch(`http://localhost:8000/transactions/${transactionId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Erro ao excluir transação');
        }

        // Limpar cache para forçar reload dos dados
        apiCache.clear('transactions');
        apiCache.clear('accounts');
        loadTransactions();
        loadAccounts();
        showSnackbar('Transação excluída com sucesso!', 'success');
      } catch (error) {
        console.error('Erro ao excluir transação:', error);
        showSnackbar('Erro ao excluir transação', 'error');
      }
    }
  };

  const handleAccountUpdate = (updatedAccount) => {
    setAccounts(prevAccounts =>
      prevAccounts.map(account =>
        account.id === updatedAccount.id ? updatedAccount : account
      )
    );
    // Limpar cache das contas
    apiCache.clear('accounts');
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

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <>
      {/* App Bar */}
      <AppBar position="static" elevation={0} sx={{ 
        background: darkMode 
          ? 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <Toolbar>
          <AccountBalanceIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            💰 Dashboard Financeiro
          </Typography>
          
          {/* Dark Mode Toggle */}
          <Tooltip title={darkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}>
            <IconButton color="inherit" onClick={toggleDarkMode} sx={{ mr: 1 }}>
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
          
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

      {/* Navigation Tabs */}
      <Paper elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Container maxWidth="xl">
          <Tabs 
            value={currentTab} 
            onChange={handleTabChange}
            variant={isMobile ? "scrollable" : "standard"}
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem',
              }
            }}
          >
            <Tab 
              icon={<DashboardIcon />} 
              label="Dashboard Principal" 
              iconPosition="start"
            />
            <Tab 
              icon={<BarChartIcon />} 
              label="Estatísticas Avançadas" 
              iconPosition="start"
            />
            <Tab 
              icon={<TrackChangesIcon />} 
              label="Metas Financeiras" 
              iconPosition="start"
            />
          </Tabs>
        </Container>
      </Paper>

      <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
        {/* Dashboard Principal */}
        <TabPanel value={currentTab} index={0}>
          <Grid container spacing={3}>
            {/* Account Indicators */}
            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  💳 Saldo das Contas
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

            {/* Monthly Expenses Summary */}
            <Grid item xs={12}>
              <MonthlyExpensesSummary 
                selectedAccountIds={selectedAccountIds}
                accounts={accounts}
              />
            </Grid>

            {/* Balance Chart - Expandido */}
            <Grid item xs={12}>
              <BalanceChart accounts={accounts} />
            </Grid>

            {/* Transações e Filtros lado a lado */}
            <Grid item xs={12}>
              <Typography variant="h5" gutterBottom sx={{ mt: 2 }} fontWeight="bold">
                📋 Transações Recentes
              </Typography>
              <Grid container spacing={3}>
                {/* Transaction List */}
                <Grid item xs={12} lg={8}>
                  <TransactionList 
                    transactions={transactions} 
                    accounts={accounts}
                    loading={loading}
                    onTransactionUpdate={handleTransactionUpdate}
                    onTransactionDelete={handleTransactionDelete}
                  />
                </Grid>

                {/* Filters */}
                <Grid item xs={12} lg={4}>
                  <Filters 
                    filters={filters} 
                    onFiltersChange={handleFiltersChange}
                    accounts={accounts}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Estatísticas Avançadas */}
        <TabPanel value={currentTab} index={1}>
          <AdvancedStats 
            accounts={accounts}
            selectedAccountIds={selectedAccountIds}
          />
        </TabPanel>

        {/* Metas Financeiras */}
        <TabPanel value={currentTab} index={2}>
          <FinancialGoals />
        </TabPanel>
      </Container>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          '&:hover': {
            transform: 'scale(1.1)',
            transition: 'transform 0.2s ease-in-out',
          }
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
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontWeight: 'bold'
        }}>
          ➕ Nova Transação
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
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ 
            borderRadius: 2,
            fontWeight: 'bold'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Dashboard; 