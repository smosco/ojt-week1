import { Outlet } from 'react-router-dom';

export default function RootLayout() {
  return (
    <main className='max-w-3xl mx-auto p-4'>
      <Outlet />
    </main>
  );
}
