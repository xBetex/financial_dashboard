// Script para verificar se os serviços estão rodando
const checkBackend = async () => {
  try {
    const response = await fetch('http://localhost:8000/health');
    if (response.ok) {
      console.log('✅ Backend está rodando em http://localhost:8000');
      return true;
    }
  } catch (error) {
    console.log('❌ Backend não está rodando');
    console.log('Execute: cd backend && python main.py');
    return false;
  }
};

const checkFrontend = async () => {
  try {
    const response = await fetch('http://localhost:3000');
    if (response.ok) {
      console.log('✅ Frontend está rodando em http://localhost:3000');
      return true;
    }
  } catch (error) {
    console.log('❌ Frontend não está rodando');
    console.log('Execute: cd frontend && npm start');
    return false;
  }
};

// Para usar no browser console:
// checkBackend(); checkFrontend(); 