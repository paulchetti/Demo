import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { KycModal } from './components/KycModal';
import { LoginModal } from './components/LoginModal';
import { LandingPage } from './pages/LandingPage';
import { UserDashboard } from './pages/UserDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { SupportChat } from './components/SupportChat';

function MainApp() {
  const { user, activeView, impersonatedUser } = useAuth();
  const [kycModalOpen, setKycModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // Show floating support chat widget for all user and guest views
  const showSupportChat = !(activeView === 'ADMIN_DASHBOARD' && user?.role === 'ADMIN' && !impersonatedUser);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        onOpenKyc={() => setKycModalOpen(true)}
        onOpenLogin={() => setLoginModalOpen(true)}
      />

      <main style={{ flex: 1 }}>
        {impersonatedUser ? (
          <UserDashboard />
        ) : activeView === 'ADMIN_DASHBOARD' && user?.role === 'ADMIN' ? (
          <AdminDashboard />
        ) : activeView === 'USER_DASHBOARD' && user ? (
          <UserDashboard />
        ) : (
          <LandingPage
            onOpenKyc={() => setKycModalOpen(true)}
            onOpenLogin={() => setLoginModalOpen(true)}
          />
        )}
      </main>

      {showSupportChat && <SupportChat />}

      <KycModal
        isOpen={kycModalOpen}
        onClose={() => setKycModalOpen(false)}
      />

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onOpenKyc={() => setKycModalOpen(true)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
