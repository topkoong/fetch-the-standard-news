import './index.css';

import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { render } from 'preact';

render(
  <BrowserRouter basename="/fetch-the-standard-news">
    <App />
  </BrowserRouter>,
  document.getElementById('app') as HTMLElement,
);
