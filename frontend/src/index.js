import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import App from './App';
import './index.css';

// Import reducers
import dashboardReducer from './redux/dashboardSlice';
import strategyReducer from './redux/strategySlice';
import performanceReducer from './redux/performanceSlice';

// Configure Redux store
const store = configureStore({
reducer: {
    dashboard: dashboardReducer,
    strategies: strategyReducer,
    performance: performanceReducer
},
});

// Create root element
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the app with required providers
root.render(
<React.StrictMode>
    <Provider store={store}>
    <BrowserRouter>
        <App />
    </BrowserRouter>
    </Provider>
</React.StrictMode>
);

// Register any service workers if needed
if ('serviceWorker' in navigator) {
window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then(registration => {
    console.log('SW registered: ', registration);
    }).catch(registrationError => {
    console.log('SW registration failed: ', registrationError);
    });
});
}

