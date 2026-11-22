import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { GameProvider } from './context/GameContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CampaignPage from './pages/CampaignPage';
import MissionSelectPage from './pages/MissionSelectPage';
import GameScreenPage from './pages/GameScreenPage';
import HangarPage from './pages/HangarPage';
import ShipUpgradePage from './pages/ShipUpgradePage';
import PowerUpInventoryPage from './pages/PowerUpInventoryPage';
import WalletPage from './pages/WalletPage';
import RewardCenterPage from './pages/RewardCenterPage';
import DailyMissionsPage from './pages/DailyMissionsPage';
import AchievementsPage from './pages/AchievementsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import HelpPage from './pages/HelpPage';
import AdminEconomyPage from './pages/AdminEconomyPage';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <GameProvider>
          <div className="flex flex-col min-h-screen bg-[#030712] text-slate-100 selection:bg-cyan-500 selection:text-black">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/help" element={<HelpPage />} />

                {/* Protected Gameplay & Progression Routes */}
                <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/campaign" element={<ProtectedRoute><CampaignPage /></ProtectedRoute>} />
                <Route path="/campaign/:sectorId" element={<ProtectedRoute><MissionSelectPage /></ProtectedRoute>} />
                <Route path="/game/:missionId" element={<ProtectedRoute><GameScreenPage /></ProtectedRoute>} />
                <Route path="/hangar" element={<ProtectedRoute><HangarPage /></ProtectedRoute>} />
                <Route path="/hangar/upgrade/:shipId" element={<ProtectedRoute><ShipUpgradePage /></ProtectedRoute>} />
                <Route path="/powerups" element={<ProtectedRoute><PowerUpInventoryPage /></ProtectedRoute>} />
                <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
                <Route path="/rewards" element={<ProtectedRoute><RewardCenterPage /></ProtectedRoute>} />
                <Route path="/daily" element={<ProtectedRoute><DailyMissionsPage /></ProtectedRoute>} />
                <Route path="/achievements" element={<ProtectedRoute><AchievementsPage /></ProtectedRoute>} />
                <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute><AdminEconomyPage /></ProtectedRoute>} />

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </GameProvider>
      </AuthProvider>
    </Router>
  );
}
