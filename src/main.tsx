import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { GravityPointerProvider } from './context/GravityPointerContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GravityPointerProvider>
      <App />
    </GravityPointerProvider>
  </StrictMode>,
);
