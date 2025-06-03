import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import {
  AccountBalance as AccountBalanceIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

const AccountIndicator = ({ account, onAccountUpdate }) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newName, setNewName] = useState(account.name);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEditClick = () => {
    setNewName(account.name);
    setEditDialogOpen(true);
  };

  const handleClose = () => {
    setEditDialogOpen(false);
    setError('');
  };

  const handleSave = async () => {
    if (!newName.trim()) {
      setError('O nome da conta não pode estar vazio');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/accounts/${account.id}/name`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName.trim() }),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar o nome da conta');
      }

      const updatedAccount = await response.json();
      onAccountUpdate(updatedAccount);
      setEditDialogOpen(false);
    } catch (err) {
      setError('Erro ao atualizar o nome da conta');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  const getBalanceColor = (balance) => {
    if (balance > 1000) return 'success.main';
    if (balance > 0) return 'warning.main';
    return 'error.main';
  };

  const getBalanceIcon = (balance) => {
    if (balance > 0) {
      return <TrendingUpIcon color="success" />;
    } else if (balance < 0) {
      return <TrendingDownIcon color="error" />;
    }
    return <AccountBalanceIcon color="action" />;
  };

  const getProgressValue = (balance) => {
    // Normalize balance to a 0-100 scale for visual purposes
    const maxValue = 5000; // Arbitrary max for visualization
    const normalizedValue = Math.max(0, Math.min(100, (balance / maxValue) * 100));
    return normalizedValue;
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        }
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center">
            <Typography variant="h6" component="div" color="text.secondary">
              {account.name}
            </Typography>
            <IconButton 
              size="small" 
              onClick={handleEditClick}
              sx={{ ml: 1 }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Box>
          {getBalanceIcon(account.balance)}
        </Box>
        
        <Typography
          variant="h4"
          component="div"
          color={getBalanceColor(account.balance)}
          fontWeight="bold"
          mb={2}
        >
          {formatCurrency(account.balance)}
        </Typography>

        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="caption" color="text.secondary">
              Status da Conta
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {account.balance > 0 ? 'Positivo' : account.balance < 0 ? 'Negativo' : 'Zerado'}
            </Typography>
          </Box>
          
          <LinearProgress
            variant="determinate"
            value={getProgressValue(account.balance)}
            color={account.balance > 1000 ? 'success' : account.balance > 0 ? 'warning' : 'error'}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'grey.200',
            }}
          />
        </Box>

        <Box mt={2}>
          <Typography variant="caption" color="text.secondary" display="block">
            ID da Conta: {account.id}
          </Typography>
        </Box>
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={handleClose}>
        <DialogTitle>Editar Nome da Conta</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nome da Conta"
            type="text"
            fullWidth
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            error={!!error}
            helperText={error}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default AccountIndicator; 