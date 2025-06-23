import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Home from './components/Home.tsx';
import SignIn from "./components/SignIn.tsx";
import SignUp from "./components/SignUp.tsx";
import ForgotPass from "./components/ForgotPass.tsx";
import OTP from "./components/OTP.tsx";
import ChangePass from "./components/ChangePass.tsx";
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import NotFoundPage from './components/NotFoundPage.tsx';
import ProfilesPage from './components/ProfilesPage.tsx';
import Profile from './components/Profile.tsx';
import ChiTietThanhVien from "./components/ChiTietThanhVien.tsx";


const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
    errorElement: <NotFoundPage />,
  },

  {
    path: "/SignIn",
    element: <SignIn />,
  },

  {
    path: "/SignUp",
    element: <SignUp />,
  },

  {
    path: "/ForgotPass",
    element: <ForgotPass />,
  },

  {
    path: "/OTP",
    element: <OTP />,
  },

  {
    path: "/ChangePass",
    element: <ChangePass />,
  },

  {
    path: '/profiles',
    element: <ProfilesPage />,
    children: [
      {
        path: ':profileId',
        element: <Profile />,
      },

      {
        path: 'tra-cuu/:MaThanhVien',
        element: <ChiTietThanhVien />,
      },
    ],
  },
]);


ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <RouterProvider router={router}/>
    </React.StrictMode>
);

