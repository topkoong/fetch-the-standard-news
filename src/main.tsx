import './index.css';

import { render } from 'preact';
import { BrowserRouter } from 'react-router-dom';

import App from './app';

render(
  <BrowserRouter basename='/fetch-the-standard-news'>
    <App />
  </BrowserRouter>,
  document.getElementById('app') as HTMLElement,
);
