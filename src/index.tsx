import ReactDOM from 'react-dom/client';
import {RouterProvider} from "react-router-dom";
import {Provider} from "react-redux";
import {router} from "./router/router";
import {store} from "./redux/slices/store/store";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import './index.css';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <Provider store={store}>
        <ErrorBoundary>
            <RouterProvider router={router}/>
        </ErrorBoundary>
    </Provider>
);