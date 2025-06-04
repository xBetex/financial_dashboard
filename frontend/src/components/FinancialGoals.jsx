import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  LinearProgress,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingUpIcon,
  Savings as SavingsIcon,
  Home as HomeIcon,
  DirectionsCar as CarIcon,
  School as SchoolIcon,
  Flight as FlightIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const GOAL_CATEGORIES = [
  { value: 'savings', label: 'Poupança', icon: <SavingsIcon />, color: '#4CAF50' },
  { value: 'house', label: 'Casa', icon: <HomeIcon />, color: '#FF9800' },
  { value: 'car', label: 'Carro', icon: <CarIcon />, color: '#2196F3' },
  { value: 'education', label: 'Educação', icon: <SchoolIcon />, color: '#9C27B0' },
  { value: 'travel', label: 'Viagem', icon: <FlightIcon />, color: '#FF5722' },
  { value: 'emergency', label: 'Emergência', icon: <CheckCircleIcon />, color: '#607D8B' },
];

const FinancialGoals = () => {
  const [goals, setGoals] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAmount: '',
    currentAmount: '',
    targetDate: '',
    category: 'savings',
    accountId: '',
  });

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    // Simular carregamento de metas (você pode implementar uma API para isso)
    const savedGoals = localStorage.getItem('financialGoals');
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }
  };

  const saveGoal = () => {
    if (!formData.title || !formData.targetAmount || !formData.targetDate) {
      return;
    }

    const goalData = {
      id: editingGoal ? editingGoal.id : Date.now(),
      ...formData,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: parseFloat(formData.currentAmount) || 0,
      createdAt: editingGoal ? editingGoal.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let updatedGoals;
    if (editingGoal) {
      updatedGoals = goals.map(goal => goal.id === editingGoal.id ? goalData : goal);
    } else {
      updatedGoals = [...goals, goalData];
    }

    setGoals(updatedGoals);
    localStorage.setItem('financialGoals', JSON.stringify(updatedGoals));
    resetForm();
  };

  const deleteGoal = (goalId) => {
    const updatedGoals = goals.filter(goal => goal.id !== goalId);
    setGoals(updatedGoals);
    localStorage.setItem('financialGoals', JSON.stringify(updatedGoals));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      targetAmount: '',
      currentAmount: '',
      targetDate: '',
      category: 'savings',
      accountId: '',
    });
    setEditingGoal(null);
    setOpenDialog(false);
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description || '',
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      targetDate: goal.targetDate,
      category: goal.category,
      accountId: goal.accountId || '',
    });
    setOpenDialog(true);
  };

  const updateGoalProgress = async (goalId, newAmount) => {
    const updatedGoals = goals.map(goal => 
      goal.id === goalId 
        ? { ...goal, currentAmount: newAmount, updatedAt: new Date().toISOString() }
        : goal
    );
    setGoals(updatedGoals);
    localStorage.setItem('financialGoals', JSON.stringify(updatedGoals));
  };

  const getProgressPercentage = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  const getDaysRemaining = (targetDate) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getCategoryInfo = (category) => {
    return GOAL_CATEGORIES.find(cat => cat.value === category) || GOAL_CATEGORIES[0];
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (progress) => {
    if (progress >= 100) return '#4CAF50';
    if (progress >= 75) return '#8BC34A';
    if (progress >= 50) return '#FF9800';
    if (progress >= 25) return '#FF5722';
    return '#F44336';
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          🎯 Metas Financeiras
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{ borderRadius: 3 }}
        >
          Nova Meta
        </Button>
      </Box>

      {goals.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <TrendingUpIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Nenhuma meta definida ainda
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Defina suas metas financeiras e acompanhe seu progresso
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => setOpenDialog(true)}
              startIcon={<AddIcon />}
            >
              Criar Primeira Meta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {goals.map((goal) => {
            const categoryInfo = getCategoryInfo(goal.category);
            const progress = getProgressPercentage(goal.currentAmount, goal.targetAmount);
            const daysRemaining = getDaysRemaining(goal.targetDate);
            const isCompleted = progress >= 100;
            const isOverdue = daysRemaining < 0 && !isCompleted;

            return (
              <Grid item xs={12} md={6} lg={4} key={goal.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    position: 'relative',
                    border: isCompleted ? '2px solid #4CAF50' : 'none',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      transition: 'transform 0.2s ease-in-out',
                    }
                  }}
                >
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Box display="flex" alignItems="center">
                        <Box 
                          sx={{ 
                            p: 1, 
                            borderRadius: 2, 
                            backgroundColor: `${categoryInfo.color}20`,
                            color: categoryInfo.color,
                            mr: 2 
                          }}
                        >
                          {categoryInfo.icon}
                        </Box>
                        <Box>
                          <Typography variant="h6" fontWeight="bold">
                            {goal.title}
                          </Typography>
                          <Chip 
                            label={categoryInfo.label} 
                            size="small" 
                            sx={{ 
                              backgroundColor: categoryInfo.color,
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                          />
                        </Box>
                      </Box>
                      <Box display="flex">
                        <IconButton size="small" onClick={() => handleEdit(goal)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => deleteGoal(goal.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>

                    {goal.description && (
                      <Typography variant="body2" color="text.secondary" mb={2}>
                        {goal.description}
                      </Typography>
                    )}

                    <Box mb={2}>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" fontWeight="bold">
                          Progresso: {progress.toFixed(1)}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={progress} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          backgroundColor: 'rgba(0,0,0,0.1)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: getStatusColor(progress),
                            borderRadius: 4,
                          }
                        }}
                      />
                    </Box>

                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Prazo: {format(new Date(goal.targetDate), 'dd/MM/yyyy', { locale: ptBR })}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          display="block"
                          color={
                            isOverdue ? 'error.main' : 
                            daysRemaining <= 30 ? 'warning.main' : 
                            'text.secondary'
                          }
                        >
                          {isOverdue ? `${Math.abs(daysRemaining)} dias em atraso` :
                           daysRemaining === 0 ? 'Prazo hoje!' :
                           `${daysRemaining} dias restantes`}
                        </Typography>
                      </Box>
                      
                      {isCompleted && (
                        <CheckCircleIcon sx={{ color: '#4CAF50', fontSize: 32 }} />
                      )}
                    </Box>

                    <Box mt={2}>
                      <TextField
                        label="Atualizar valor atual"
                        type="number"
                        size="small"
                        fullWidth
                        defaultValue={goal.currentAmount}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                        }}
                        onBlur={(e) => {
                          const newAmount = parseFloat(e.target.value) || 0;
                          if (newAmount !== goal.currentAmount) {
                            updateGoalProgress(goal.id, newAmount);
                          }
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const newAmount = parseFloat(e.target.value) || 0;
                            updateGoalProgress(goal.id, newAmount);
                          }
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Dialog for creating/editing goals */}
      <Dialog open={openDialog} onClose={resetForm} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingGoal ? 'Editar Meta' : 'Nova Meta Financeira'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Título da Meta"
                fullWidth
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Descrição (opcional)"
                fullWidth
                multiline
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Categoria</InputLabel>
                <Select
                  value={formData.category}
                  label="Categoria"
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {GOAL_CATEGORIES.map((cat) => (
                    <MenuItem key={cat.value} value={cat.value}>
                      <Box display="flex" alignItems="center">
                        {cat.icon}
                        <Typography sx={{ ml: 1 }}>{cat.label}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Data Prazo"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={formData.targetDate}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Valor Meta"
                type="number"
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                }}
                value={formData.targetAmount}
                onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Valor Atual"
                type="number"
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                }}
                value={formData.currentAmount}
                onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={resetForm}>Cancelar</Button>
          <Button onClick={saveGoal} variant="contained">
            {editingGoal ? 'Atualizar' : 'Criar Meta'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FinancialGoals; 