import { createRoot } from 'react-dom/client'

import App from './components/app'

const container = document.getElementById('root')

const root = createRoot(container)

// eslint-disable-next-line react/react-in-jsx-scope
root.render(<App />)
