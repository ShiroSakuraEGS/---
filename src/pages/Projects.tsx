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
    title: '雲林崙背鄉 A 農場沼氣發電計畫',
    location: '雲林縣崙背鄉',
    heads: 2000,
    targetAmount: 456.4, // 萬元
    currentAmount: 320,
    roi: '8.9', // 年回收
    carbonReduction: '1,200', // 噸/年
    status: 'funding',
    image: 'https://images.unsplash.com/photo-1592424001807-162111812a5b?q=80&w=2940&auto=format&fit=crop',
    ownerId: 'farmer_demo_1'
  },
  {
    id: '2',
    title: '嘉義六腳鄉 B 牧場永續升級案',
    location: '嘉義縣六腳鄉',
    heads: 5000,
    targetAmount: 1141,
    currentAmount: 1141,
    roi: '8.5',
    carbonReduction: '3,000',
    status: 'completed',
    image: 'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?q=80&w=2940&auto=format&fit=crop',
    ownerId: 'farmer_demo_2'
  },
  {
    id: '3',
    title: '雲林麥寮鄉 C 畜牧場綠能專案',
    location: '雲林縣麥寮鄉',
    heads: 1500,
    targetAmount: 342.3,
    currentAmount: 85,
    roi: '9.2',
    carbonReduction: '900',
    status: 'funding',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2832&auto=format&fit=crop',
    ownerId: 'farmer_demo_3'
  }
];

export default function Projects() {
  const { isLoggedIn, role } = useAuth();
  const navigate = useNavigate();
  
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [investingIn, setInvestingIn] = useState<string | null>(null);
  const [investAmount, setInvestAmount] = useState<number | ''>(5000);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'projects'));
      if (querySnapshot.empty) {
        if (auth.currentUser) {
           await seedProjects();
           await fetchProjects();
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
        await setDoc(docRef, data);
      }
    } catch(err) {
      console.error('Seed error:', err);
    }
  };

  const handleInvest = async (projectId: string, currentProjectAmount: number) => {
    if (!auth.currentUser) return;
    
    const amountNum = Number(investAmount);
    if (!amountNum || amountNum < 1000 || amountNum > 10000) {
      alert('請輸入 NT$1,000 ~ NT$10,000 之間的投資金額');
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
                  <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
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
                          <span className="text-xs text-slate-400">1千 ~ 1萬</span>
                        </div>
                        <Input 
                          type="number" 
                          min={1000} 
                          max={10000} 
                          value={investAmount} 
                          onChange={(e) => setInvestAmount(e.target.value === '' ? '' : Number(e.target.value))}
                          placeholder="例如: 5000"
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
                          setInvestAmount(5000);
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
