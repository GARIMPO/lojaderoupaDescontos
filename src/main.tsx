import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Iniciar a aplicação diretamente sem qualquer verificação externa
createRoot(document.getElementById("root")!).render(<App />);
