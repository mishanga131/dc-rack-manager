import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import RacksList from './pages/RacksList.jsx';
import RackDetails from './pages/RackDetails.jsx';
import RackForm from './pages/RackForm.jsx';
import NotFound from './pages/NotFound.jsx';

// createBrowserRouter (data router) потрібен, щоб працював useBlocker
export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Navigate to="/racks" replace /> },
      { path: '/racks', element: <RacksList /> },
      { path: '/racks/new', element: <RackForm /> },
      { path: '/racks/:id', element: <RackDetails /> },
      { path: '/racks/:id/edit', element: <RackForm /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
