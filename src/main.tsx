import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom';
import { AccessibilityProvider } from './contexts/AccessibilityContext.tsx';

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AccessibilityProvider>
      <App />
    </AccessibilityProvider>
  </BrowserRouter>
);
