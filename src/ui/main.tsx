import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Provider } from 'react-redux'
import { store } from './redux/store.ts'
import { HashRouter } from 'react-router'
import 'bootstrap/dist/css/bootstrap.min.css';
import { ConfirmProvider } from './context/confirmContext.tsx'
import { SessionProvider } from './context/sessionContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <Provider store={store}>
        <ConfirmProvider>
          <SessionProvider>
            <App />
          </SessionProvider>
        </ConfirmProvider>
      </Provider>
    </HashRouter>
  </StrictMode>,
)
