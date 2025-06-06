import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Checkbox,
  ListItemText,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const PERIOD_OPTIONS = [
  { value: 7, label: '7 dias' },
  { value: 30, label: '30 dias' },
  { value: 60, label: '60 dias' },
  { value: 90, label: '90 dias' },
  { value: 120, label: '120 dias' },
  { value: 365, label: '1 ano' },
];

const BalanceChart = ({ accounts }) => {
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [balanceHistory, setBalanceHistory] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (accounts.length > 0 && selectedAccounts.length === 0) {
      setSelectedAccounts([accounts[0].id]);
    }
  }, [accounts, selectedAccounts]);

  const loadBalanceHistory = useCallback(async () => {
    if (selectedAccounts.length === 0) return;
    
    setLoading(true);
    try {
      const historyPromises = selectedAccounts.map(async (accountId) => {
        const response = await fetch(
          `http://localhost:8000/accounts/${accountId}/balance-history?days=${selectedPeriod}`
        );
        const data = await response.json();
        return { accountId, data };
      });
      
      const results = await Promise.all(historyPromises);
      const historyMap = {};
      
      results.forEach(({ accountId, data }) => {
        historyMap[accountId] = data;
      });
      
      setBalanceHistory(historyMap);
    } catch (error) {
      console.error('Erro ao carregar histórico de saldo:', error);
      setBalanceHistory({});
    } finally {
      setLoading(false);
    }
  }, [selectedAccounts, selectedPeriod]);

  useEffect(() => {
    if (selectedAccounts.length > 0) {
      loadBalanceHistory();
    }
  }, [selectedAccounts, selectedPeriod, loadBalanceHistory]);

  const getAccountName = (accountId) => {
    const account = accounts.find(acc => acc.id === parseInt(accountId));
    return account ? account.name : 'Conta';
  };

  const handleAccountChange = (event) => {
    const value = event.target.value;
    setSelectedAccounts(typeof value === 'string' ? value.split(',') : value);
  };

  const handlePeriodChange = (event, newPeriod) => {
    if (newPeriod !== null) {
      setSelectedPeriod(newPeriod);
    }
  };

  const getChartColors = (index) => {
    const colors = ['#1976d2', '#dc004e', '#00796b', '#f57c00', '#7b1fa2', '#388e3c'];
    return colors[index % colors.length];
  };

  const prepareChartData = () => {
    if (Object.keys(balanceHistory).length === 0) return [];

    // Get all unique dates and sort them
    const allDates = new Set();
    Object.values(balanceHistory).forEach(history => {
      history.forEach(item => {
        allDates.add(new Date(item.date).toISOString().split('T')[0]);
      });
    });
    
    const sortedDates = Array.from(allDates).sort();
    
    // Create data points for recharts format
    return sortedDates.map(date => {
      const dateObj = new Date(date + 'T00:00:00');
      let dateLabel;
      if (selectedPeriod <= 30) {
        dateLabel = dateObj.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' });
      } else if (selectedPeriod <= 120) {
        dateLabel = dateObj.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' });
      } else {
        dateLabel = dateObj.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      }

      const dataPoint = { 
        date: dateLabel,
        fullDate: date 
      };

      // Add balance data for each selected account with intelligent interpolation
      selectedAccounts.forEach(accountId => {
        const accountHistory = balanceHistory[accountId] || [];
        const entry = accountHistory.find(item => 
          new Date(item.date).toISOString().split('T')[0] === date
        );
        
        if (entry) {
          dataPoint[getAccountName(accountId)] = entry.balance;
        } else {
          // Find the most recent balance before this date
          const sortedHistory = accountHistory
            .filter(item => new Date(item.date).toISOString().split('T')[0] <= date)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
          
          if (sortedHistory.length > 0) {
            // Use the most recent balance (carry forward)
            dataPoint[getAccountName(accountId)] = sortedHistory[0].balance;
          } else {
            // If no previous data, try to find the next available balance
            const futureHistory = accountHistory
              .filter(item => new Date(item.date).toISOString().split('T')[0] > date)
              .sort((a, b) => new Date(a.date) - new Date(b.date));
            
            dataPoint[getAccountName(accountId)] = futureHistory.length > 0 ? futureHistory[0].balance : 0;
          }
        }
      });

      return dataPoint;
    });
  };

  const getCurrentPeriodLabel = () => {
    const option = PERIOD_OPTIONS.find(opt => opt.value === selectedPeriod);
    return option ? option.label : '30 dias';
  };

  const chartData = prepareChartData();

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">
            Evolução do Saldo - Últimos {getCurrentPeriodLabel()}
          </Typography>
          
          <FormControl size="small" sx={{ minWidth: 300 }}>
            <InputLabel>Contas</InputLabel>
            <Select
              multiple
              value={selectedAccounts}
              onChange={handleAccountChange}
              input={<OutlinedInput label="Contas" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip 
                      key={value} 
                      label={getAccountName(value)} 
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              )}
              MenuProps={MenuProps}
            >
              {accounts.map((account) => (
                <MenuItem key={account.id} value={account.id}>
                  <Checkbox checked={selectedAccounts.indexOf(account.id) > -1} />
                  <ListItemText primary={account.name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Period Selection */}
        <Box display="flex" justifyContent="center" mb={3}>
          <ToggleButtonGroup
            value={selectedPeriod}
            exclusive
            onChange={handlePeriodChange}
            aria-label="período de visualização"
            size="small"
          >
            {PERIOD_OPTIONS.map((option) => (
              <ToggleButton key={option.value} value={option.value} aria-label={option.label}>
                {option.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
            <CircularProgress />
          </Box>
        ) : Object.keys(balanceHistory).length === 0 || chartData.length === 0 ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
            <Typography color="text.secondary">
              Nenhum dado de histórico disponível
            </Typography>
          </Box>
        ) : (
          <Box height={300}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => 
                    new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(value)
                  }
                />
                <Tooltip 
                  formatter={(value, name) => [
                    new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(value),
                    name
                  ]}
                  labelFormatter={(label) => `Data: ${label}`}
                />
                <Legend />
                {selectedAccounts.map((accountId, index) => (
                  <Line
                    key={accountId}
                    type="monotone"
                    dataKey={getAccountName(accountId)}
                    stroke={getChartColors(index)}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                    connectNulls={true}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </Box>
        )}

        <Box mt={2}>
          <Typography variant="caption" color="text.secondary">
            * Gráfico mostra a evolução do saldo baseada nas transações dos últimos {getCurrentPeriodLabel()}. 
            Selecione múltiplas contas para comparar.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BalanceChart; 