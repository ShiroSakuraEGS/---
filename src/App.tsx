/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import Home from './pages/Home';
import Projects from './pages/Projects';
import Dashboard from './pages/Dashboard';
import { AuthProvider } from './contexts/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
          <header className="bg-white border-b sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2 text-emerald-700 font-bold text-xl">
                <img src="/logo.png" alt="北港溪沼氣發電眾包平台" className="h-8 w-auto object-contain" />
                <span>北港溪沼氣發電眾包平台</span>
              </Link>
              <nav className="flex items-center gap-6">
                <Link to="/" className="text-slate-600 hover:text-emerald-600 font-medium">首頁</Link>
                <Link to="/projects" className="text-slate-600 hover:text-emerald-600 font-medium">投資專案</Link>
                <Link to="/dashboard" className="text-slate-600 hover:text-emerald-600 font-medium">會員中心</Link>
              </nav>
            </div>
          </header>
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </main>
          <footer className="bg-slate-900 text-slate-400 py-12 mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <p>© 2026 北港溪沼氣發電眾包平台. 數位綠色能源公眾投資.</p>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}
