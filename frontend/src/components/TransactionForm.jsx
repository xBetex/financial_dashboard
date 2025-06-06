import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  InputAdornment,
} from '@mui/material';
import { format } from 'date-fns';

const TransactionForm = ({ accounts, onTransactionCreated, onClose }) => {
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    transaction_type: '',
    category: '',
    amount: '',
    account_id: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'Alimentação',
    'Transporte',
    'Moradia',
    'Saúde',
    'Educação',
    'Entretenimento',
    'Vestuário',
    'Salário',
    'Emprestimo',
    'Transferencia bancária',
    'Contas Obrigatórias',
    'Investimentos',
    'Outros'
  ];

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
    setError('');
  };



  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!formData.description.trim()) {
      setError('Descrição é obrigatória');
      setLoading(false);
      return;
    }
    if (!formData.transaction_type) {
      setError('Tipo de transação é obrigatório');
      setLoading(false);
      return;
    }
    if (!formData.category) {
      setError('Categoria é obrigatória');
      setLoading(false);
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Valor deve ser maior que zero');
      setLoading(false);
      return;
    }
    if (!formData.account_id) {
      setError('Conta é obrigatória');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/transactions/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          date: formData.date + 'T00:00:00.000Z',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao criar transação');
      }

      // Reset form and close
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        description: '',
        transaction_type: '',
        category: '',
        amount: '',
        account_id: '',
      });
      
      onTransactionCreated();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Data"
            type="date"
            value={formData.date}
            onChange={handleChange('date')}
            InputLabelProps={{
              shrink: true,
            }}
            required
          />
        </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Tipo</InputLabel>
              <Select
                value={formData.transaction_type}
                label="Tipo"
                onChange={handleChange('transaction_type')}
              >
                <MenuItem value="entrada">Entrada</MenuItem>
                <MenuItem value="saida">Saída</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Descrição"
              value={formData.description}
              onChange={handleChange('description')}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Categoria</InputLabel>
              <Select
                value={formData.category}
                label="Categoria"
                onChange={handleChange('category')}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Conta</InputLabel>
              <Select
                value={formData.account_id}
                label="Conta"
                onChange={handleChange('account_id')}
              >
                {accounts.map((account) => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Valor"
              type="number"
              value={formData.amount}
              onChange={handleChange('amount')}
              InputProps={{
                startAdornment: <InputAdornment position="start">R$</InputAdornment>,
              }}
              inputProps={{
                step: "0.01",
                min: "0.01"
              }}
              required
            />
          </Grid>

          {error && (
            <Grid item xs={12}>
              <Alert severity="error">{error}</Alert>
            </Grid>
          )}

          <Grid item xs={12}>
            <Box display="flex" gap={2} justifyContent="flex-end">
              <Button onClick={onClose} disabled={loading}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                disabled={loading}
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    );
  };

export default TransactionForm; 