import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
} from '@mui/icons-material';

const AccountSummary = ({ accounts, selectedAccountIds }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  const getSelectedAccounts = () => {
    if (selectedAccountIds.length === 0) {
      return accounts;
    }
    return accounts.filter(account => selectedAccountIds.includes(account.id));
  };

  const calculateTotals = () => {
    const selectedAccounts = getSelectedAccounts();
    
    let totalPositive = 0;
    let totalNegative = 0;
    let totalBalance = 0;
    let accountCount = selectedAccounts.length;
    
    selectedAccounts.forEach(account => {
      if (account.balance > 0) {
        totalPositive += account.balance;
      } else {
        totalNegative += Math.abs(account.balance);
      }
      totalBalance += account.balance;
    });
    
    return {
      totalPositive,
      totalNegative,
      totalBalance,
      accountCount,
    };
  };

  const { totalPositive, totalNegative, totalBalance, accountCount } = calculateTotals();

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Resumo das Contas {selectedAccountIds.length > 0 ? 'Selecionadas' : '(Todas)'}
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ 
              textAlign: 'center', 
              p: 2, 
              backgroundColor: '#e8f5e8', 
              borderRadius: 2,
              border: '1px solid #4caf50'
            }}>
              <TrendingUpIcon sx={{ fontSize: 40, color: 'success.dark', mb: 1 }} />
              <Typography variant="h6" color="success.dark" fontWeight="bold">
                {formatCurrency(totalPositive)}
              </Typography>
              <Typography variant="caption" color="success.dark" fontWeight="500">
                Total Positivo
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ 
              textAlign: 'center', 
              p: 2, 
              backgroundColor: '#ffebee', 
              borderRadius: 2,
              border: '1px solid #f44336'
            }}>
              <TrendingDownIcon sx={{ fontSize: 40, color: 'error.dark', mb: 1 }} />
              <Typography variant="h6" color="error.dark" fontWeight="bold">
                {formatCurrency(totalNegative)}
              </Typography>
              <Typography variant="caption" color="error.dark" fontWeight="500">
                Total Negativo
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ 
              textAlign: 'center', 
              p: 2, 
              backgroundColor: '#e3f2fd', 
              borderRadius: 2,
              border: '1px solid #2196f3'
            }}>
              <AccountBalanceIcon sx={{ fontSize: 40, color: 'info.dark', mb: 1 }} />
              <Typography variant="h6" color="info.dark" fontWeight="bold">
                {accountCount} {accountCount === 1 ? 'Conta' : 'Contas'}
              </Typography>
              <Typography variant="caption" color="info.dark" fontWeight="500">
                Média: {formatCurrency(accountCount > 0 ? totalBalance / accountCount : 0)}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ 
              textAlign: 'center', 
              p: 2, 
              backgroundColor: totalBalance >= 0 ? '#e8f5e8' : '#ffebee', 
              borderRadius: 2,
              border: totalBalance >= 0 ? '1px solid #4caf50' : '1px solid #f44336'
            }}>
              <AccountBalanceWalletIcon sx={{ 
                fontSize: 40, 
                color: totalBalance >= 0 ? 'success.dark' : 'error.dark', 
                mb: 1 
              }} />
              <Typography 
                variant="h6" 
                color={totalBalance >= 0 ? 'success.dark' : 'error.dark'} 
                fontWeight="bold"
              >
                {formatCurrency(totalBalance)}
              </Typography>
              <Typography 
                variant="caption" 
                color={totalBalance >= 0 ? 'success.dark' : 'error.dark'} 
                fontWeight="500"
              >
                Saldo Total
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default AccountSummary; 