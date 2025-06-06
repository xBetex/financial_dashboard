import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Divider,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon,
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
      return accounts; // Se nenhuma conta estiver selecionada, mostra todas
    }
    return accounts.filter(account => selectedAccountIds.includes(account.id));
  };

  const calculateTotals = () => {
    const selectedAccounts = getSelectedAccounts();
    
    let totalPositive = 0;
    let totalBalance = 0;
    let accountCount = selectedAccounts.length;
    
    const accountBreakdown = selectedAccounts.map(account => {
      const positive = account.balance > 0 ? account.balance : 0;
      
      totalPositive += positive;
      totalBalance += account.balance;
      
      return {
        ...account,
        positive,
      };
    });
    
    return {
      totalPositive,
      totalBalance,
      accountCount,
      accountBreakdown,
    };
  };

  const { totalPositive, totalBalance, accountCount, accountBreakdown } = calculateTotals();

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Resumo das Contas {selectedAccountIds.length > 0 ? 'Selecionadas' : '(Todas)'}
        </Typography>
        
        {/* Totais Gerais */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
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
          
          <Grid item xs={12} md={4}>
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
          
          <Grid item xs={12} md={4}>
            <Box sx={{ 
              textAlign: 'center', 
              p: 2, 
              backgroundColor: totalBalance >= 0 ? '#e8f5e8' : '#fff3e0', 
              borderRadius: 2,
              border: totalBalance >= 0 ? '1px solid #4caf50' : '1px solid #ff9800'
            }}>
              <AccountBalanceIcon sx={{ 
                fontSize: 40, 
                color: totalBalance >= 0 ? 'success.dark' : 'warning.dark', 
                mb: 1 
              }} />
              <Typography variant="h6" color={totalBalance >= 0 ? 'success.dark' : 'warning.dark'} fontWeight="bold">
                {formatCurrency(totalBalance)}
              </Typography>
              <Typography variant="caption" color={totalBalance >= 0 ? 'success.dark' : 'warning.dark'} fontWeight="500">
                Saldo Total
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Detalhamento por Conta */}
        <Typography variant="subtitle1" gutterBottom>
          Detalhamento por Conta:
        </Typography>
        
        {accountBreakdown.map((account) => (
          <Box key={account.id} sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {account.name}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ 
                  textAlign: 'center', 
                  p: 2, 
                  backgroundColor: '#f5f5f5', 
                  borderRadius: 2,
                  border: '1px solid #e0e0e0'
                }}>
                  <Typography variant="h6" color="text.primary" fontWeight="bold">
                    {formatCurrency(account.balance)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight="500">
                    Saldo Atual
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ 
                  textAlign: 'center', 
                  p: 2, 
                  backgroundColor: '#f5f5f5', 
                  borderRadius: 2,
                  border: '1px solid #e0e0e0'
                }}>
                  <Typography variant="h6" color="text.primary" fontWeight="bold">
                    {account.balance > 0 ? '✅' : account.balance === 0 ? '⚪' : '🔴'} {account.balance >= 1000 ? 'Excelente' : account.balance > 0 ? 'Positivo' : 'Zerado'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight="500">
                    Status
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        ))}
      </CardContent>
    </Card>
  );
};

export default AccountSummary; 