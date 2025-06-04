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
    let totalNegative = 0;
    let totalBalance = 0;
    
    const accountBreakdown = selectedAccounts.map(account => {
      const positive = account.balance > 0 ? account.balance : 0;
      const negative = account.balance < 0 ? account.balance : 0;
      
      totalPositive += positive;
      totalNegative += negative;
      totalBalance += account.balance;
      
      return {
        ...account,
        positive,
        negative,
      };
    });
    
    return {
      totalPositive,
      totalNegative,
      totalBalance,
      accountBreakdown,
    };
  };

  const { totalPositive, totalNegative, totalBalance, accountBreakdown } = calculateTotals();

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Resumo das Contas {selectedAccountIds.length > 0 ? 'Selecionadas' : '(Todas)'}
        </Typography>
        
        {/* Totais Gerais */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'success.light', borderRadius: 1 }}>
              <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h6" color="success.main">
                {formatCurrency(totalPositive)}
              </Typography>
              <Typography variant="caption" color="success.main">
                Total Positivo
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'error.light', borderRadius: 1 }}>
              <TrendingDownIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
              <Typography variant="h6" color="error.main">
                {formatCurrency(totalNegative)}
              </Typography>
              <Typography variant="caption" color="error.main">
                Total Negativo
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ 
              textAlign: 'center', 
              p: 2, 
              backgroundColor: totalBalance >= 0 ? 'primary.light' : 'warning.light', 
              borderRadius: 1 
            }}>
              <AccountBalanceIcon sx={{ 
                fontSize: 40, 
                color: totalBalance >= 0 ? 'primary.main' : 'warning.main', 
                mb: 1 
              }} />
              <Typography variant="h6" color={totalBalance >= 0 ? 'primary.main' : 'warning.main'}>
                {formatCurrency(totalBalance)}
              </Typography>
              <Typography variant="caption" color={totalBalance >= 0 ? 'primary.main' : 'warning.main'}>
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
            <Grid container spacing={1}>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center', p: 1, backgroundColor: 'grey.100', borderRadius: 1 }}>
                  <Typography variant="body2" color="success.main">
                    {formatCurrency(account.positive)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Positivo
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center', p: 1, backgroundColor: 'grey.100', borderRadius: 1 }}>
                  <Typography variant="body2" color="error.main">
                    {formatCurrency(account.negative)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Negativo
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center', p: 1, backgroundColor: 'grey.100', borderRadius: 1 }}>
                  <Typography variant="body2" color="primary.main">
                    {formatCurrency(account.balance)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Saldo
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