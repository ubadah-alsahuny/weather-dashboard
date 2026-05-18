import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import "@fontsource/montserrat/800.css";
import "@fontsource/montserrat/600.css";
import "@fontsource/montserrat/400.css";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
