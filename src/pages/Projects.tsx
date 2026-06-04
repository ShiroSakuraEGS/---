import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { Input } from '@/components/ui/Input';
import { MapPin, Zap, PiggyBank, Leaf, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { db, auth } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, updateDoc, addDoc } from 'firebase/firestore';
import { handleFirestoreError } from '@/lib/errorHandlers';

// Mock Data for Seeding
const mockProjects = [
  {
    id: '1',
    title: '林養豬場 綠能升級',
    location: '雲林縣斗六市',
    heads: 2500,
    targetAmount: 500, // 萬元
    currentAmount: 320,
    roi: '8.5', // 年回收
    carbonReduction: '1,500', // 噸/年
    status: 'funding',
    image: 'https://images.unsplash.com/photo-1592424001807-162111812a5b?q=80&w=2940&auto=format&fit=crop',
    ownerId: 'farmer_demo_1'
  },
  {
    id: '2',
    title: '大清畜牧場 循環經濟',
    location: '雲林縣虎尾鎮',
    heads: 4000,
    targetAmount: 850,
    currentAmount: 850,
    roi: '9.0',
    carbonReduction: '2,400',
    status: 'completed',
    image: 'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?q=80&w=2940&auto=format&fit=crop',
    ownerId: 'farmer_demo_2'
  },
  {
    id: '3',
    title: '永捷畜牧場 沼氣共生',
    location: '雲林縣大埤鄉',
    heads: 1500,
    targetAmount: 350,
    currentAmount: 120,
    roi: '8.2',
    carbonReduction: '900',
    status: 'funding',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2832&auto=format&fit=crop',
    ownerId: 'farmer_demo_3'
  },
  {
    id: '4',
    title: '銘仁畜牧場 智慧監控',
    location: '雲林縣虎尾鎮',
    heads: 3000,
    targetAmount: 600,
    currentAmount: 450,
    roi: '8.8',
    carbonReduction: '1,800',
    status: 'funding',
    image: 'https://images.unsplash.com/photo-1551214041-944d18faaf9c?q=80&w=3000&auto=format&fit=crop',
    ownerId: 'farmer_demo_4'
  },
  {
    id: '5',
    title: '源畜牧場 生態復育',
    location: '雲林縣林內鄉',
    heads: 2000,
    targetAmount: 400,
    currentAmount: 180,
    roi: '8.0',
    carbonReduction: '1,200',
    status: 'funding',
    image: 'https://images.unsplash.com/photo-1516480579624-9eaeb72ddbb0?q=80&w=3000&auto=format&fit=crop',
    ownerId: 'farmer_demo_5'
  },
  {
    id: '6',
    title: '興牧場 綠色轉型',
    location: '雲林縣水林鄉',
    heads: 5000,
    targetAmount: 1000,
    currentAmount: 250,
    roi: '9.5',
    carbonReduction: '3,000',
    status: 'funding',
    image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=3000&auto=format&fit=crop',
    ownerId: 'farmer_demo_6'
  }
];

export default function Projects() {
  const { isLoggedIn, role } = useAuth();
  const navigate = useNavigate();
  
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [investingIn, setInvestingIn] = useState<string | null>(null);
  const [investAmount, setInvestAmount] = useState<number | ''>(3000);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'projects'));
      if (querySnapshot.empty || querySnapshot.size < mockProjects.length) {
        if (auth.currentUser) {
           await seedProjects();
           const newSnapshot = await getDocs(collection(db, 'projects'));
           const reLoaded = newSnapshot.docs.map(doc => ({
             id: doc.id,
             ...doc.data()
           }));
           setProjects(reLoaded);
        } else {
           setProjects(mockProjects); // Fallback if not logged in and no data
        }
        return;
      }
      const loaded = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProjects(loaded);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const seedProjects = async () => {
    try {
      for (const p of mockProjects) {
        const docRef = doc(db, 'projects', p.id);
        const { id, ...data } = p;
        // Inject currentUser uid so security rules pass
        await setDoc(docRef, { ...data, ownerId: auth.currentUser?.uid || data.ownerId });
      }
    } catch(err) {
      console.error('Seed error:', err);
    }
  };

  const handleInvest = async (projectId: string, currentProjectAmount: number) => {
    if (!auth.currentUser) return;
    
    const amountNum = Number(investAmount);
    if (!amountNum || amountNum < 3000 || amountNum % 1000 !== 0) {
      alert('請輸入 NT$3,000 或以上的投資金額，且必須為 1,000 的倍數');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Add investment record
      const invRef = collection(db, 'investments');
      await addDoc(invRef, {
        userId: auth.currentUser.uid,
        projectId,
        amount: amountNum,
        timestamp: new Date().toISOString(),
        roleAtInvestment: role
      });

      // Update project funding amount (convert to 萬元)
      const pRef = doc(db, 'projects', projectId);
      const newAmount = currentProjectAmount + (amountNum / 10000);
      await updateDoc(pRef, {
        currentAmount: newAmount,
        status: newAmount >= mockProjects.find(p=>p.id===projectId)?.targetAmount! ? 'completed':'funding' // Basic status auto-update
      });
      
      alert('投資成功！感謝您對綠色能源的貢獻。');
      setInvestingIn(null);
      await fetchProjects();
    } catch (error) {
      handleFirestoreError(error, 'create', 'investments');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">投資專案</h1>
            <p className="text-lg text-slate-600 max-w-2xl">
              瀏覽北港溪流域的沼氣發電專案。您的投資將直接設立獨立專案公司 (SPV)，確保資金安全與設備產權。
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => {
            const progressPercent = Math.min(100, (project.currentAmount / project.targetAmount) * 100);
            
            return (
              <Card key={project.id} className="overflow-hidden flex flex-col hover:shadow-xl transition-shadow duration-300">
                <div className="h-48 relative">
                  <img src={project.image || mockProjects.find(m => m.id === project.id)?.image || 'https://images.unsplash.com/photo-1592424001807-162111812a5b?q=80&w=2940&auto=format&fit=crop'} alt={project.title} className="w-full h-full object-cover" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-emerald-700">
                    {project.status === 'funding' ? '募資中' : '已達標'}
                  </div>
                </div>
                <CardHeader>
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                    <MapPin className="w-4 h-4" />
                    {project.location}
                  </div>
                  <CardTitle className="text-xl leading-tight mb-2">{project.title}</CardTitle>
                  <CardDescription>
                    飼養規模：{project.heads.toLocaleString()} 頭
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-slate-700">募資進度</span>
                        <span className="text-emerald-600 font-semibold">{progressPercent.toFixed(1)}%</span>
                      </div>
                      <Progress value={progressPercent} className="h-2" />
                      <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <span>已募 {project.currentAmount.toFixed(1)} 萬</span>
                        <span>目標 {project.targetAmount} 萬</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                      <div>
                        <div className="flex items-center gap-1 text-slate-500 text-sm mb-1">
                          <PiggyBank className="w-4 h-4" />
                          預估回收
                        </div>
                        <p className="font-semibold text-slate-900">{project.roi} <span className="text-sm font-normal text-slate-500">年</span></p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-slate-500 text-sm mb-1">
                          <Leaf className="w-4 h-4" />
                          年減碳量
                        </div>
                        <p className="font-semibold text-slate-900">{project.carbonReduction} <span className="text-sm font-normal text-slate-500">噸</span></p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 flex flex-col gap-3">
                  {isLoggedIn ? (
                    investingIn === project.id ? (
                      <div className="w-full space-y-3 bg-slate-50 p-4 border border-slate-200 rounded-xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center text-sm font-medium text-slate-700">
                          <span>投資金額 (NT$)</span>
                          <span className="text-xs text-slate-400">最低 3,000 起</span>
                        </div>
                        <Input 
                          type="number" 
                          min={3000} 
                          step={1000}
                          value={investAmount} 
                          onChange={(e) => setInvestAmount(e.target.value === '' ? '' : Number(e.target.value))}
                          placeholder="例如: 3000"
                        />
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            className="flex-1" 
                            onClick={() => setInvestingIn(null)}
                            disabled={isSubmitting}
                          >
                            取消
                          </Button>
                          <Button 
                            className="flex-1" 
                            onClick={() => handleInvest(project.id, project.currentAmount)}
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : '確認投資'}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button 
                        className="w-full h-12 text-lg" 
                        disabled={project.status === 'completed'}
                        onClick={() => {
                          setInvestAmount(3000);
                          setInvestingIn(project.id);
                        }}
                      >
                        {project.status === 'completed' ? '已結束' : '立刻投資'}
                      </Button>
                    )
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full h-12 text-lg" 
                      disabled={project.status === 'completed'}
                      onClick={() => navigate('/dashboard')}
                    >
                      {project.status === 'completed' ? '已結束' : '請先登入以投資'}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
