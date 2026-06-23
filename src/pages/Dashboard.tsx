import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Slider } from '@/components/ui/Slider';
import { Input } from '@/components/ui/Input';
import IoTChart from '@/components/IoTChart';
import Calculator from '@/components/Calculator';
import { User, Building2, Tractor, Wallet, Leaf, Activity, MessageSquare, Zap, LogOut, Loader2 } from 'lucide-react';
import { useAuth, Role } from '@/contexts/AuthContext';
import { signInWithPopup, GoogleAuthProvider, signInAnonymously } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { handleFirestoreError } from '@/lib/errorHandlers';

export default function Dashboard() {
  const { isLoggedIn, role, login, logout, loading, user } = useAuth();
  const [investments, setInvestments] = useState<any[]>([]);
  const [fetchingData, setFetchingData] = useState(false);

  useEffect(() => {
    if (isLoggedIn && user) {
      fetchUserInvestments();
    }
  }, [isLoggedIn, user]);

  const fetchUserInvestments = async () => {
    if (!user) return;
    setFetchingData(true);
    try {
      const q = query(collection(db, 'investments'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const invs = [];
      
      for (const d of querySnapshot.docs) {
        const invData = d.data();
        // Fetch project title for each investment
        const projectDoc = await getDoc(doc(db, 'projects', invData.projectId));
        invs.push({
          id: d.id,
          ...invData,
          projectTitle: projectDoc.exists() ? projectDoc.data().title : '未知專案',
          projectRoi: projectDoc.exists() ? projectDoc.data().roi : '0',
          projectCarbon: projectDoc.exists() ? projectDoc.data().carbonReduction : '0'
        });
      }
      setInvestments(invs);
    } catch (error) {
      console.error("Error fetching investments:", error);
    } finally {
      setFetchingData(false);
    }
  };

  if (loading || (isLoggedIn && fetchingData && investments.length === 0)) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold overflow-hidden">
               {auth.currentUser?.photoURL ? (
                 <img src={auth.currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
               ) : (
                 auth.currentUser?.displayName?.charAt(0) || 'U'
               )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{auth.currentUser?.displayName || '會員中心'}</h1>
              <p className="text-slate-500 mt-1">
                歡迎回來，您目前以 <strong className="text-emerald-600">{role === 'individual' ? '個人投資者' : role === 'corporate' ? '企業代表' : '畜牧業者'}</strong> 身分登入
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="outline" onClick={logout} className="text-slate-500 gap-2">
              <LogOut className="w-4 h-4" />
              登出
            </Button>
          </div>
        </div>

        {/* Dashboard Content */}
        {role === 'individual' && <IndividualDashboard investments={investments} />}
        {role === 'corporate' && <CorporateDashboard investments={investments} />}
        {role === 'farmer' && <FarmerDashboard />}

      </div>
    </div>
  );
}

function LoginScreen() {
  const [selectedRole, setSelectedRole] = useState<Role>('individual');
  const [signingIn, setSigningIn] = useState(false);
  const { login } = useAuth();

  const handleGoogleLogin = async () => {
    setSigningIn(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // login here just updates the role in Firestore
      await login(selectedRole);
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setSigningIn(false);
    }
  };

  const handleDemoLogin = async () => {
    setSigningIn(true);
    try {
      await signInAnonymously(auth);
      await login(selectedRole);
    } catch (error) {
      console.error("Demo login failed:", error);
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-slate-100 animate-in fade-in zoom-in-95 duration-500">
        {/* Left Side - Branding/Visual */}
        <div className="md:w-1/2 bg-emerald-700 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <img src="/logo.png" alt="Logo" className="h-12 w-auto mb-8 brightness-0 invert" />
            <h2 className="text-3xl font-bold mb-4 leading-tight">歡迎來到<br/>北港溪沼氣發電眾包平台</h2>
            <p className="text-emerald-100 text-lg leading-relaxed">
              使用 Google 帳號快速登入，參與綠能投資或管理您的沼氣發電資產。
            </p>
          </div>
          <div className="relative z-10 mt-12">
            <div className="flex items-center gap-4 text-emerald-200 text-sm font-medium">
              <span className="flex items-center gap-1"><Zap className="w-4 h-4"/> 綠能科技</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Leaf className="w-4 h-4"/> 永續減碳</span>
            </div>
          </div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-emerald-500 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-400 rounded-full blur-3xl opacity-30"></div>
        </div>

        {/* Right Side - Login Form */}
        <div className="md:w-1/2 p-10 lg:p-12 flex flex-col justify-center">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-slate-900">選擇身分並登入</h3>
            <p className="text-slate-500 mt-2">請選擇您要使用的會員類型</p>
          </div>

          <div className="space-y-6">
            {/* Role Selection */}
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setSelectedRole('individual')}
                className={`py-2.5 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${selectedRole === 'individual' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <User className="w-4 h-4 hidden sm:block" /> 個人
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('corporate')}
                className={`py-2.5 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${selectedRole === 'corporate' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Building2 className="w-4 h-4 hidden sm:block" /> 企業
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('farmer')}
                className={`py-2.5 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${selectedRole === 'farmer' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Tractor className="w-4 h-4 hidden sm:block" /> 畜牧業
              </button>
            </div>

            <div className="space-y-3 pt-4">
              <Button 
                onClick={handleGoogleLogin} 
                disabled={signingIn}
                className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm h-12 text-base rounded-xl flex items-center justify-center gap-3"
              >
                {signingIn ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                    使用 Google 帳號登入
                  </>
                )}
              </Button>

              <div className="relative flex py-2 items-center text-slate-400">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-4 text-xs font-semibold uppercase tracking-wider text-slate-400">或</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <Button 
                onClick={handleDemoLogin} 
                disabled={signingIn}
                variant="outline"
                className="w-full border-emerald-200 bg-emerald-50/30 hover:bg-emerald-50 text-emerald-800 shadow-sm h-12 text-base rounded-xl flex items-center justify-center gap-2 font-semibold"
              >
                {signingIn ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-emerald-600 animate-pulse" />
                    以選定身分免密碼快速體驗
                  </>
                )}
              </Button>
            </div>

            <p className="text-center text-xs text-slate-400 mt-8 leading-relaxed">
              登入即表示您同意我們的服務條款與隱私權政策。<br/>
              系統將會根據您選擇的身分建立對應的權限。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


function IndividualDashboard({ investments }: { investments: any[] }) {
  const totalInvested = investments.reduce((acc, inv) => acc + inv.amount, 0);
  const totalReturn = investments.reduce((acc, inv) => acc + (inv.amount * 0.08), 0); // Simplified 8% return mock for now

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-emerald-600 text-white border-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-emerald-100 text-sm font-medium">累積預估收益 (年)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">NT$ {totalReturn.toLocaleString()}</div>
            <p className="text-emerald-200 text-sm mt-2">+ NT$ {(totalReturn / 12).toFixed(0)} (預估每月)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-500 text-sm font-medium">總投資金額</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">NT$ {totalInvested.toLocaleString()}</div>
            <p className="text-slate-500 text-sm mt-2">分佈於 {investments.length} 個專案</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-500 text-sm font-medium">預估年化報酬率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">8.7%</div>
            <p className="text-slate-500 text-sm mt-2">穩定來自台電躉購</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>已投資專案</CardTitle>
          <CardDescription>您參與的綠能建設進度與收益狀況</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {investments.length > 0 ? (
              investments.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{inv.projectTitle}</h4>
                      <p className="text-sm text-slate-500">投資金額: NT$ {inv.amount.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-emerald-600">+ NT$ {(inv.amount * 0.08).toFixed(0)}</div>
                    <div className="text-xs text-slate-500">預估年收益</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-400">
                尚未有投資專案，前往專案頁面開始您的第一筆投資！
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CorporateDashboard({ investments }: { investments: any[] }) {
  const [carbonRatio, setCarbonRatio] = useState(50);
  const totalInvested = investments.reduce((acc, inv) => acc + inv.amount, 0);
  const totalCarbon = investments.reduce((acc, inv) => {
    const carbonVal = parseFloat(String(inv.projectCarbon || '0').replace(/,/g, ''));
    // Simplified: share carbon based on investment proportion (just a mock logic)
    return acc + (carbonVal * 0.01); 
  }, 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-blue-600 text-white border-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-blue-100 text-sm font-medium">預估年度碳權額度</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{totalCarbon.toFixed(1)} <span className="text-xl font-normal">噸</span></div>
            <p className="text-blue-200 text-sm mt-2">符合 ESG 減碳目標</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-500 text-sm font-medium">累積金錢收益 (年)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">NT$ {(totalInvested * 0.08).toLocaleString()}</div>
            <p className="text-slate-500 text-sm mt-2">依比例分配</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-500 text-sm font-medium">總投資金額</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">NT$ {totalInvested.toLocaleString()}</div>
            <p className="text-slate-500 text-sm mt-2">分佈於 {investments.length} 個專案</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>收益比例調整</CardTitle>
            <CardDescription>動態調整您希望獲得的碳權與金錢回報比例</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between text-sm font-medium text-slate-700">
                <span>碳權憑證 ({carbonRatio}%)</span>
                <span>金錢收益 ({100 - carbonRatio}%)</span>
              </div>
              <div className="py-4">
                <Slider 
                  value={carbonRatio} 
                  onChange={setCarbonRatio} 
                  min={0} 
                  max={100} 
                  className="w-full"
                />
              </div>
              <p className="text-sm text-slate-500 mt-4 leading-relaxed">
                調整此比例將影響下一季度的收益分配。提高碳權比例有助於加速達成企業淨零排放目標。
              </p>
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">儲存設定</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>已投資專案</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {investments.length > 0 ? (
                investments.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{inv.projectTitle}</h4>
                        <p className="text-xs text-slate-500">投資: NT$ {inv.amount.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-blue-600">+ {(parseFloat(String(inv.projectCarbon || '0').replace(/,/g, '')) * 0.01).toFixed(1)} 噸</div>
                      <div className="text-xs text-slate-500">預估碳權</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-400">尚未有投資專案</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function FarmerDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-amber-600 text-white border-none md:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-amber-100 text-sm font-medium">今日發電量 (即時)</CardTitle>
              <div className="flex items-center gap-1 text-xs bg-amber-500/50 px-2 py-1 rounded-full">
                <Activity className="w-3 h-3" /> 連線正常
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-4">1,452 <span className="text-xl font-normal">kWh</span></div>
            <div className="h-[200px] w-full bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <IoTChart />
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-500 text-sm font-medium">設備健康度</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">98%</div>
              <p className="text-slate-500 text-sm mt-2">發電機組運轉良好</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-500 text-sm font-medium">本期預估收益</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">NT$ 14,500</div>
              <p className="text-slate-500 text-sm mt-2">台電下月結算</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-8">
          <h3 className="text-2xl font-bold text-slate-900">擴建評估</h3>
          <Calculator />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>聯絡專案總管</CardTitle>
            <CardDescription>有任何設備維護或帳務問題，請隨時與我們聯繫。</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">主旨</label>
                <Input placeholder="例如：設備保養預約" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">訊息內容</label>
                <textarea 
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[150px]"
                  placeholder="請描述您的問題..."
                />
              </div>
              <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700">
                <MessageSquare className="w-4 h-4 mr-2" />
                送出訊息
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
