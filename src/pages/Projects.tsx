import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { Input } from '@/components/ui/Input';
import { MapPin, Zap, PiggyBank, Leaf, Loader2, Users, Check, Phone, ExternalLink, Award, ShieldCheck, Search, Filter } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { db, auth } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, updateDoc, addDoc } from 'firebase/firestore';
import { handleFirestoreError } from '@/lib/errorHandlers';
import { vendorsList, Vendor } from '@/data/vendors';

// Helper to look up vendor in the real 沼氣發電設備商名錄.csv
const findVendorByKeyword = (keyword: string): Vendor => {
  const found = vendorsList.find(v => v.name.includes(keyword));
  if (!found) {
    // Fallback if missing
    return {
      name: keyword,
      address: "聯絡中",
      contact: "服務中心",
      phone: "0800-000-000",
      products: []
    };
  }
  return found;
};

// Map of projects to biogas power generation vendors/collaborators from 沼氣發電設備商名錄.csv
const projectPartnersMap: Record<string, Array<Vendor & { link: string; indicators: string[] }>> = {
  '1': [
    {
      ...findVendorByKeyword('畜旺工程行'),
      link: 'https://www.biogas.com.tw/directory/directory_more?id=ec90816d70ea44a8ba727178e7894efa',
      indicators: ['脫硫設備', '廢水系統', '沼氣發電機', '併網申請', '發電機維修', '儲氣設備']
    },
    {
      ...findVendorByKeyword('飛瑞工程行'),
      link: 'https://www.biogas.com.tw/directory/directory_more?id=bfcd0fa10186453a8af9e87b5eb1e142',
      indicators: ['沼氣發電機', '廢水系統', '脫硫設備', '儲氣設備', '併網申請', '發電機維修']
    }
  ],
  '2': [
    {
      ...findVendorByKeyword('環揚環保工程'),
      link: 'https://www.biogas.com.tw/directory/directory_more?id=5670e58b33d246869d08550c60ffaeb9',
      indicators: ['廢水系統', '脫硫設備', '儲氣設備', '沼氣發電機', '併網申請', '發電機維修']
    },
    {
      ...findVendorByKeyword('台灣綠能工程'),
      link: 'https://www.biogas.com.tw/directory/directory_more?id=5a73bc84b91341ee856ecaa801c4a490',
      indicators: ['併網申請', '廢水系統', '脫硫設備', '儲氣設備', '沼氣發電機', '發電機維修']
    }
  ],
  '3': [
    {
      ...findVendorByKeyword('龍鐵機械'),
      link: 'https://www.biogas.com.tw/directory/directory_more?id=a9dfbec2065447b6ad489cba95f5702d',
      indicators: ['脫硫設備', '廢水系統', '儲氣設備', '沼氣發電機', '併網申請', '發電機維修']
    },
    {
      ...findVendorByKeyword('晉緯工程'),
      link: 'https://www.biogas.com.tw/directory/directory_more?id=45b2ebbc673741348e69eeb3e8c2ecf1',
      indicators: ['廢水系統', '脫硫設備', '儲氣設備', '沼氣發電機', '併網申請', '發電機維修']
    }
  ],
  '4': [
    {
      ...findVendorByKeyword('桓達科技'),
      link: 'https://www.biogas.com.tw/directory/directory_more?id=cdbcd57298244d6dbbead35f4acfca1f',
      indicators: ['脫硫設備', '廢水系統', '併網申請', '儲氣設備', '沼氣發電機', '發電機維修']
    },
    {
      ...findVendorByKeyword('牧陽能控'),
      link: 'https://www.biogas.com.tw/directory/directory_more?id=90f47b89a5ce4a9393371c72c2002bba',
      indicators: ['併網申請', '廢水系統', '脫硫設備', '儲氣設備', '沼氣發電機', '發電機維修']
    }
  ],
  '5': [
    {
      ...findVendorByKeyword('晶昌環境機械'),
      link: 'https://www.biogas.com.tw/directory/directory_more?id=91c54fb6265d48bea69c088dba996aa9',
      indicators: ['廢水系統', '脫硫設備', '儲氣設備', '併網申請', '發電機維修', '沼氣發電機']
    },
    {
      ...findVendorByKeyword('安葆國際'),
      link: 'https://www.biogas.com.tw/directory/directory_more?id=d948a293964a429ab4111dd852e82f9d',
      indicators: ['沼氣發電機', '廢水系統', '脫硫設備', '儲氣設備', '併網申請', '發電機維修']
    }
  ],
  '6': [
    {
      ...findVendorByKeyword('漢翔航空'),
      link: 'https://www.biogas.com.tw/directory/directory_more?id=846f7efaf5d74aca8057e07396197d96',
      indicators: ['沼氣發電機', '廢水系統', '脫硫設備', '儲氣設備', '併網申請', '發電機維修']
    },
    {
      ...findVendorByKeyword('萬年清環境'),
      link: 'https://www.biogas.com.tw/directory/directory_more?id=fa38d23183b24f398daa973de14ff782',
      indicators: ['廢水系統', '脫硫設備', '儲氣設備', '沼氣發電機', '併網申請', '發電機維修']
    }
  ]
};

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
  const [selectedProjectVendors, setSelectedProjectVendors] = useState<any[] | null>(null);
  const [selectedProjectTitle, setSelectedProjectTitle] = useState<string>('');
  const [vendorSearch, setVendorSearch] = useState<string>('');
  const [selectedProductFilter, setSelectedProductFilter] = useState<string>('全部');
  const [regionFilter, setRegionFilter] = useState<string>('全部');

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

  const matchedVendors = vendorsList.filter(vendor => {
    const matchSearch = vendor.name.toLowerCase().includes(vendorSearch.toLowerCase()) || 
                        vendor.address.toLowerCase().includes(vendorSearch.toLowerCase()) ||
                        vendor.contact.toLowerCase().includes(vendorSearch.toLowerCase());
                        
    const matchProduct = selectedProductFilter === '全部' || vendor.products.includes(selectedProductFilter);
    
    let matchRegion = true;
    if (regionFilter === '北部') {
      matchRegion = vendor.address.includes('台北') || vendor.address.includes('臺北') || vendor.address.includes('新北') || vendor.address.includes('桃園') || vendor.address.includes('新竹') || vendor.address.includes('基隆');
    } else if (regionFilter === '中部') {
      matchRegion = vendor.address.includes('台中') || vendor.address.includes('臺中') || vendor.address.includes('苗栗') || vendor.address.includes('彰化') || vendor.address.includes('南投') || vendor.address.includes('雲林');
    } else if (regionFilter === '南部') {
      matchRegion = vendor.address.includes('嘉義') || vendor.address.includes('台南') || vendor.address.includes('臺南') || vendor.address.includes('高雄') || vendor.address.includes('屏東');
    }
    
    return matchSearch && matchProduct && matchRegion;
  });

  const getCooperatingProjectsForVendor = (vendorName: string) => {
    const projectsFound: Array<{ id: string; title: string }> = [];
    Object.entries(projectPartnersMap).forEach(([projectId, vendors]) => {
      if (vendors.some(v => v.name === vendorName)) {
        const foundProj = mockProjects.find(mp => mp.id === projectId);
        if (foundProj) {
          projectsFound.push({ id: projectId, title: foundProj.title });
        }
      }
    });
    return projectsFound;
  };

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
              <Card id={`project-${project.id}`} key={project.id} className="overflow-hidden flex flex-col hover:shadow-xl transition-shadow duration-300 scroll-mt-20">
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

                    {/* 合作夥伴與設備廠商指標 */}
                    <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                        <Users className="w-3.5 h-3.5 text-emerald-600" />
                        <span>綠能設備合作廠商 (經農業部推薦)</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {projectPartnersMap[project.id]?.map((p, idx) => (
                          <div key={idx} className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-medium">
                            {p.name}
                          </div>
                        ))}
                      </div>
                      <Button
                        type="button"
                        variant="link"
                        className="text-xs text-left justify-start p-0 h-auto text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 mt-1"
                        onClick={() => {
                          setSelectedProjectVendors(projectPartnersMap[project.id] || null);
                          setSelectedProjectTitle(project.title);
                        }}
                      >
                        <span>ℹ️ 檢視系統與工程技術指標</span>
                      </Button>
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

        {/* 農業部推薦沼氣發電設備商名錄檢索中心 */}
        <div className="mt-20 pt-12 border-t border-slate-200">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 font-semibold px-3 py-1 rounded-full text-xs mb-3 border border-emerald-100/60">
                <Award className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                <span>中華民國農業部沼氣發電推薦名單</span>
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                生質綠能設備廠商與技術規章檢索
              </h2>
              <p className="text-slate-500 text-sm mt-1 max-w-3xl leading-relaxed">
                本名錄依據農業部最新公佈之<strong>《沼氣發電設備商名錄.csv》</strong>彙整。投資人可完整查驗各綠能合約專案之專業承建商，包含厭氧廢水、脫硫儲氣、發電機併網及常態維運之推薦資格與聯絡窗口。
              </p>
            </div>
            <div className="shrink-0 bg-emerald-950 text-emerald-100 text-xs px-4 py-2.5 rounded-xl border border-emerald-800 flex items-center gap-2 shadow-sm font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>本站全數專案設備商均名列此合規名單</span>
            </div>
          </div>

          {/* Search Controls Panel */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-8 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <Input
                  type="text"
                  placeholder="搜尋公司名稱、聯絡窗口、服務據點..."
                  className="pl-9 bg-slate-50/50 hover:bg-white focus:bg-white transition-all text-sm h-10 border-slate-200 rounded-lg text-slate-800"
                  value={vendorSearch}
                  onChange={(e) => setVendorSearch(e.target.value)}
                />
              </div>

              {/* Product Category Filter */}
              <div className="relative">
                <select
                  value={selectedProductFilter}
                  onChange={(e) => setSelectedProductFilter(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50/50 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 outline-none focus:border-emerald-500 hover:bg-white transition-all cursor-pointer"
                >
                  <option value="全部">所有技術模組分類 ({vendorsList.length} 家)</option>
                  {['廢水系統', '脫硫設備', '儲氣設備', '沼氣發電機', '併網申請', '發電機維修', '沼氣發電系統商', '其他'].map(cat => {
                    const count = vendorsList.filter(v => v.products.includes(cat)).length;
                    return (
                      <option key={cat} value={cat}>{cat} ({count} 家)</option>
                    );
                  })}
                </select>
              </div>

              {/* Region filter */}
              <div className="relative">
                <select
                  value={regionFilter}
                  onChange={(e) => setRegionFilter(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50/50 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 outline-none focus:border-emerald-500 hover:bg-white transition-all cursor-pointer"
                >
                  <option value="全部">所有服務據點 (北部/中部/南部)</option>
                  <option value="北部">北部地區 (雙北/桃園/新竹/基隆)</option>
                  <option value="中部">中部地區 (台中/彰化/南投/雲林/苗栗)</option>
                  <option value="南部">南部地區 (嘉義/台南/高雄/屏東)</option>
                </select>
              </div>
            </div>

            {/* Quick Pills for Categories */}
            <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100 items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">熱門產品領域：</span>
              {['全部', '廢水系統', '脫硫設備', '儲氣設備', '沼氣發電機', '併網申請', '發電機維修', '沼氣發電系統商'].map((cat) => {
                const count = cat === '全部' 
                  ? vendorsList.length 
                  : vendorsList.filter(v => v.products.includes(cat)).length;
                const isSelected = selectedProductFilter === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedProductFilter(cat)}
                    className={`text-xs px-3.5 py-1.5 rounded-full font-semibold transition-all ${
                      isSelected
                        ? 'bg-emerald-700 text-white shadow-sm ring-1 ring-emerald-800'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {cat} <span className={`text-[10px] ml-0.5 ${isSelected ? 'text-emerald-200' : 'text-slate-400 font-normal'}`}>({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matchedVendors.map((vendor) => {
              const pairedProjects = getCooperatingProjectsForVendor(vendor.name);
              const isCollab = pairedProjects.length > 0;
              return (
                <div
                  key={vendor.name}
                  className={`bg-white rounded-xl border p-5 transition-all flex flex-col justify-between ${
                    isCollab
                      ? 'border-emerald-500 ring-2 ring-emerald-500/10 shadow-emerald-50/50 shadow-md bg-emerald-50/10'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-900 text-base leading-snug hover:text-emerald-700 transition-colors">
                          {vendor.name}
                        </h4>
                        <div className="flex items-center gap-1 text-slate-500 text-xs mt-1">
                          <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                          <span className="truncate" title={vendor.address}>{vendor.address}</span>
                        </div>
                      </div>
                      <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        isCollab 
                          ? 'bg-emerald-600 text-white shadow-sm' 
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {isCollab ? '本站合建承建商' : '推薦商'}
                      </span>
                    </div>

                    {/* Window contact card */}
                    <div className="bg-slate-50/80 rounded-lg p-3 space-y-1.5 text-xs text-slate-600 border border-slate-100">
                      <div className="flex justify-between">
                        <span className="text-slate-400">代表窗口：</span>
                        <span className="font-semibold text-slate-800">{vendor.contact}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">專線電話：</span>
                        <span className="font-semibold text-slate-800 flex items-center gap-1 select-all font-mono">
                          <Phone className="w-3 h-3 text-slate-400 inline" />
                          {vendor.phone}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
                    {/* Products Tags with elegant pills */}
                    <div className="flex flex-wrap gap-1">
                      {vendor.products.map(p => (
                        <span key={p} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200/50 font-medium">
                          {p}
                        </span>
                      ))}
                    </div>

                    {/* Connection Link */}
                    {isCollab ? (
                      <div className="bg-emerald-100/50 border border-emerald-200/60 rounded-lg p-2.5 flex items-center justify-between text-xs text-emerald-950">
                        <span className="font-semibold text-emerald-950 flex items-center gap-1">
                          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping shrink-0" />
                          承建：{pairedProjects[0].title}
                        </span>
                        <button
                          onClick={() => {
                            const elt = document.getElementById(`project-${pairedProjects[0].id}`);
                            if (elt) {
                              elt.scrollIntoView({ behavior: 'smooth' });
                              // Flash style
                              elt.classList.add('ring-4', 'ring-emerald-500/20');
                              setTimeout(() => elt.classList.remove('ring-4', 'ring-emerald-500/20'), 3000);
                            }
                          }}
                          className="hover:underline text-[11px] font-extrabold text-emerald-800 hover:text-emerald-950 shrink-0 select-none cursor-pointer flex items-center gap-0.5"
                        >
                          投標視窗 <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-slate-300" />
                        <span>綠能設備計畫辦公室合規複查通過</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {matchedVendors.length === 0 && (
            <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-2xl">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">查無符合此條件的沼氣發電設備廠商</p>
              <Button
                variant="link"
                className="text-emerald-700 mt-2 font-bold flex items-center gap-1 mx-auto"
                onClick={() => {
                  setVendorSearch('');
                  setSelectedProductFilter('全部');
                  setRegionFilter('全部');
                }}
              >
                重設所有進階搜尋篩選條件
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 合作廠商技術/設備指標詳情 Modal */}
      {selectedProjectVendors && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-6 relative">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-5 h-5 text-emerald-300" />
                <span className="text-emerald-200 text-xs font-semibold tracking-wider">農業部核可沼氣發電推薦廠商名錄</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight">{selectedProjectTitle}</h2>
              <p className="text-emerald-200/90 text-sm mt-1">本專案委任之專業第三方各項設備及系統整合商，數據均與政府辦公室連結</p>
              <button
                onClick={() => setSelectedProjectVendors(null)}
                className="absolute top-6 right-6 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors focus:outline-none"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              <div className="bg-emerald-50/50 border border-emerald-100 text-emerald-800 p-4 rounded-xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-emerald-900">綠能眾包安全保障與核備機制</p>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">
                    本平台的各裝置設備商經由「農業部沼氣發電推動計劃辦公室」專業推薦與實地勘察，合規承建各項厭氧消化、脫硫與併網系統，保障投資大眾的合約權益與設備維護。
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {selectedProjectVendors.map((vendor, idx) => (
                  <div key={idx} className="p-5 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100/50 transition-colors">
                    <div className="flex justify-between items-start gap-4 flex-wrap mb-3">
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg flex items-center gap-1.5 flex-wrap">
                          {vendor.name}
                          <span className="inline-flex items-center text-[11px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                            特許推薦商
                          </span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                          {vendor.address}
                        </p>
                      </div>
                      <a
                        href={vendor.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 bg-white border border-slate-200 hover:border-emerald-300 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                      >
                        <span>廠商官方專頁</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    {/* Vendor Contact details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 mb-4 bg-white p-3 rounded-xl border border-slate-200/60">
                      <div>
                        <span className="font-medium text-slate-500">代表窗口：</span>
                        <span className="text-slate-900 font-medium">{vendor.contact}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium text-slate-500">服務電話：</span>
                        <span className="text-slate-900 font-medium">{vendor.phone}</span>
                      </div>
                    </div>

                    {/* Indicators/Roles checklist */}
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase block mb-2.5">承建系統規章與技術指標</span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {['廢水系統', '脫硫設備', '儲氣設備', '沼氣發電機', '併網申請', '發電機維修'].map((indicator) => {
                          const isSupported = vendor.indicators.includes(indicator);
                          return (
                            <div
                              key={indicator}
                              className={`flex items-center gap-1.5 text-xs py-2 px-2.5 rounded-lg border transition-all ${
                                isSupported
                                  ? 'bg-emerald-50/60 border-emerald-100/80 text-emerald-950 font-medium'
                                  : 'bg-slate-100/40 border-slate-100 text-slate-400 line-through'
                              }`}
                            >
                              <div className={`w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 ${isSupported ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                <Check className="w-3 h-3 stroke-[3.5]" />
                              </div>
                              <span className="truncate">{indicator}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end gap-3 rounded-b-2xl">
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => setSelectedProjectVendors(null)}
              >
                關閉視窗
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
