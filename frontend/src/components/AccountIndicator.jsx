import React, { useState, memo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  Chip,
} from '@mui/material';
import {
  AccountBalance as AccountBalanceIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

const AccountIndicator = ({ account, onAccountUpdate, isSelected = false, onToggleSelection }) => {
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

  const getStatusChip = (balance) => {
    if (balance > 0) {
      return <Chip label="Positivo" color="success" size="small" />;
    } else if (balance < 0) {
      return <Chip label="Negativo" color="error" size="small" />;
    }
    return <Chip label="Zerado" color="default" size="small" />;
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        border: isSelected ? '2px solid' : '1px solid',
        borderColor: isSelected ? 'primary.main' : 'divider',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        }
      }}
    >
      <CardContent>
        {/* Header with selection checkbox */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center">
            {onToggleSelection && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isSelected}
                    onChange={(e) => onToggleSelection(account.id, e.target.checked)}
                    size="small"
                  />
                }
                label={
                  <Typography variant="h6" component="div" color="text.secondary">
                    {account.name}
                  </Typography>
                }
                sx={{ margin: 0 }}
              />
            )}
            {!onToggleSelection && (
              <Typography variant="h6" component="div" color="text.secondary">
                {account.name}
              </Typography>
            )}
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
        
        {/* Main balance */}
        <Typography
          variant="h4"
          component="div"
          color={getBalanceColor(account.balance)}
          fontWeight="bold"
          mb={2}
        >
          {formatCurrency(account.balance)}
        </Typography>

        {/* Status and additional info */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          {getStatusChip(account.balance)}
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

export default memo(AccountIndicator); 