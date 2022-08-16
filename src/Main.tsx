import './index.css';

import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { render } from 'preact';

render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById('app') as HTMLElement,
);
