import React from 'react';
import ReactDOM from 'react-dom';
import { injectGlobal } from 'styled-components';

import App from './App';


// eslint-disable-next-line
injectGlobal`
  body {
    font-family: 'Roboto','Helvetica','Arial',sans-serif!important;
    background-color: #FAFAFA;
  }
`;

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
