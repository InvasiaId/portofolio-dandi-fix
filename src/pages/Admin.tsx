import React, { useMemo, useState, createContext, useContext, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, Award, Settings, LogOut, Bell, Search, Menu, X, Plus, Edit2, Trash2, UploadCloud } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function adminFetch(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('adminToken');
  const isFormData = options.body instanceof FormData || (options.body && typeof options.body !== 'string');
  
  return fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
  });
}

const AdminContext = createContext<{ 
  searchQuery: string, 
  setSearchQuery: (q: string) => void,
  showToast: (msg: string) => void 
}>({
  searchQuery: '', 
  setSearchQuery: () => {},
  showToast: () => {}
});

export function useAdmin() {
  return useContext(AdminContext);
}

function Toast({ message, visible }: { message: string, visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div 
          initial={{ opacity: 0, y: 50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 50, x: '-50%' }}
          className="fixed bottom-8 left-1/2 z-[200] bg-cyber-green text-black px-6 py-3 font-mono text-sm font-bold shadow-[0_0_20px_rgba(0,255,65,0.3)] border border-cyber-green/50"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Modal({ title, isOpen, onClose, children }: { title: string, isOpen: boolean, onClose: () => void, children: React.ReactNode }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#121212] border border-cyber-blue/50 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative no-scrollbar">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20}/></button>
        <h2 className="text-xl font-bold text-white tracking-widest mb-6 uppercase">{title}</h2>
        {children}
      </div>
    </div>
  );
}

const trafficData = [
  { name: 'Mon', visits: 1200 },
  { name: 'Tue', visits: 1800 },
  { name: 'Wed', visits: 1400 },
  { name: 'Thu', visits: 2400 },
  { name: 'Fri', visits: 2900 },
  { name: 'Sat', visits: 1800 },
  { name: 'Sun', visits: 1100 },
];

function StatCard({ title, value, change, positive }: { title: string, value: string, change: string, positive: boolean }) {
  return (
    <div className="bg-[#121212] border border-cyber-blue/30 p-6 rounded-sm relative overflow-hidden group">
      <div className="absolute inset-0 bg-cyber-blue/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-cyber-blue/30" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-cyber-blue/30" />
      
      <h3 className="font-mono text-sm text-gray-500 mb-2">{title}</h3>
      <div className="flex items-end justify-between">
        <div className="text-3xl font-bold text-white tracking-wider">{value}</div>
        <div className={`font-mono text-xs ${positive ? 'text-cyber-green' : 'text-red-500'}`}>
          {change}
        </div>
      </div>
    </div>
  );
}

function FileUploadArea({ name, defaultValue, accept = "image/*", label = "Drop files here" }: { name: string, defaultValue?: string, accept?: string, label?: string }) {
  const [imageUrl, setImageUrl] = useState<string>(defaultValue || '');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await adminFetch('/api/admin/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) setImageUrl(data.url);
    } catch (e) {
      console.error(e);
      alert('Upload failed');
    }
    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const isImage = imageUrl && (imageUrl.match(/\.(jpeg|jpg|gif|png|webp|svg)/i) != null || imageUrl.includes('res.cloudinary.com') || imageUrl.startsWith('data:image/'));

  return (
    <>
      <input type="hidden" name={name} value={imageUrl} />
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={(e) => e.target.files && handleUpload(e.target.files[0])} 
        className="hidden" 
        accept={accept} 
      />
      
      <div 
        onDragOver={(e) => e.preventDefault()} 
        onDrop={handleDrop} 
        onClick={() => fileInputRef.current?.click()}
        className="w-full relative overflow-hidden border-2 border-dashed border-white/10 p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-cyber-blue/50 transition-colors bg-black/20"
      >
        {imageUrl ? (
          isImage ? (
            <img src={imageUrl} alt="Uploaded" className="max-h-48 object-cover rounded-sm mb-4" />
          ) : (
            <div className="font-mono text-cyber-blue flex items-center justify-center flex-col">
              <UploadCloud size={32} className="mb-2 text-cyber-green" />
              <div className="text-sm break-all">{imageUrl}</div>
            </div>
          )
        ) : (
          <>
            <UploadCloud size={32} className="text-cyber-blue mb-4" />
            <p className="font-mono text-sm text-white">{label}</p>
            <p className="font-mono text-xs text-gray-500 mt-2">or click to browse from your device</p>
          </>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
            <span className="font-mono text-sm text-cyber-blue animate-pulse">UPLOADING...</span>
          </div>
        )}
      </div>
      {imageUrl && (
        <button type="button" onClick={(e) => { e.stopPropagation(); setImageUrl(''); }} className="text-xs font-mono text-red-500 mt-2 hover:underline">
          REMOVE_FILE
        </button>
      )}
    </>
  );
}

function MultipleFileUploadArea({ name, defaultValues = [], accept = "image/*,video/*,.pdf,.doc,.docx", label = "Drop files here" }: { name: string, defaultValues?: string[], accept?: string, label?: string }) {
  const [mediaUrls, setMediaUrls] = useState<string[]>(Array.isArray(defaultValues) ? defaultValues : []);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleUpload = async (files: FileList | File[]) => {
    setUploading(true);
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('image', file);
        try {
          const res = await adminFetch('/api/admin/upload', { method: 'POST', body: formData });
          const data = await res.json();
          if (data.url) {
              setMediaUrls(prev => [...prev, data.url]);
          }
        } catch (e) {
          console.error(e);
          alert('Upload failed for some files');
        }
    }
    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files);
    }
  };

  const isImage = (url: string) => url && (url.match(/\.(jpeg|jpg|gif|png|webp|svg)/i) != null || url.includes('res.cloudinary.com') || url.startsWith('data:image/'));

  return (
    <>
      <input type="hidden" name={name} value={JSON.stringify(mediaUrls)} />
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={(e) => e.target.files && handleUpload(e.target.files)} 
        className="hidden" 
        accept={accept}
        multiple
      />
      
      <div 
        onDragOver={(e) => e.preventDefault()} 
        onDrop={handleDrop} 
        onClick={() => fileInputRef.current?.click()}
        className="w-full relative overflow-hidden border-2 border-dashed border-white/10 p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-cyber-blue/50 transition-colors bg-black/20"
      >
        <UploadCloud size={32} className="text-cyber-blue mb-4" />
        <p className="font-mono text-sm text-white">{label}</p>
        <p className="font-mono text-xs text-gray-500 mt-2">or click to browse from your device (Multiple files allowed)</p>
        
        {uploading && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-sm z-10">
            <span className="font-mono text-sm text-cyber-blue animate-pulse">UPLOADING...</span>
          </div>
        )}
      </div>

      {mediaUrls.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
              {mediaUrls.map((url, i) => (
                  <div key={i} className="relative group border border-white/10 rounded overflow-hidden">
                      {isImage(url) ? (
                          <img src={url} alt="Uploaded" className="w-full aspect-video object-cover" />
                      ) : (
                          <div className="w-full aspect-video flex-col bg-white/5 flex items-center justify-center p-2 break-all overflow-hidden text-[10px] text-cyber-blue font-mono">
                              <UploadCloud size={16} />
                              <span className="truncate w-full mt-1">{url}</span>
                          </div>
                      )}
                      <button type="button" onClick={(e) => {
                          e.stopPropagation();
                          setMediaUrls(urls => urls.filter((_, idx) => idx !== i));
                      }} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded font-mono text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                          X
                      </button>
                  </div>
              ))}
          </div>
      )}
    </>
  );
}

function AdminDashboard() {
  const [stats, setStats] = useState({ projects: 0, certs: 0 });

  useEffect(() => {
    Promise.all([
      adminFetch('/api/projects').then(r => r.json()),
      adminFetch('/api/certificates').then(r => r.json())
    ]).then(([projects, certs]) => {
      setStats({
        projects: Array.isArray(projects) ? projects.length : 0,
        certs: Array.isArray(certs) ? certs.length : 0
      });
    }).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-widest uppercase">Overview</h1>
          <p className="font-mono text-xs text-gray-400 mt-1">MAIN_SYSTEM_DASHBOARD // STATUS: ONLINE</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="TOTAL_VISITORS" value="12,482" change="+14.2%" positive={true} />
        <StatCard title="TOTAL_PROJECTS" value={stats.projects.toString()} change="+1" positive={true} />
        <StatCard title="TOTAL_CERTIFICATES" value={stats.certs.toString()} change="+1" positive={true} />
        <StatCard title="SYSTEM_LOAD" value="12%" change="STABLE" positive={true} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 bg-[#121212] border border-cyber-blue/30 p-6 h-96 relative flex flex-col min-h-0">
           <div className="font-mono text-xs text-cyber-blue/50 mb-6">TRAFFIC_ANALYSIS</div>
           <div className="flex-1 mt-4 min-h-0 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={trafficData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                 <defs>
                   <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#0ae2ff" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#0ae2ff" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <XAxis dataKey="name" stroke="#333" tick={{ fill: '#666', fontSize: 12, fontFamily: 'monospace' }} />
                 <YAxis stroke="#333" tick={{ fill: '#666', fontSize: 12, fontFamily: 'monospace' }} />
                 <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                 <Tooltip 
                   contentStyle={{ backgroundColor: '#0a0a0a', borderColor: 'rgba(10, 226, 255, 0.3)', fontFamily: 'monospace', fontSize: '12px' }}
                   itemStyle={{ color: '#0ae2ff' }}
                 />
                 <Area type="monotone" dataKey="visits" stroke="#0ae2ff" strokeWidth={2} fillOpacity={1} fill="url(#colorVisits)" />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>
        <div className="bg-[#121212] border border-cyber-blue/30 p-6 h-96 relative">
           <div className="absolute top-4 left-4 font-mono text-xs text-cyber-blue/50">RECENT_ACTIVITY</div>
           <div className="mt-8 space-y-4">
             {[1,2,3,4].map((i) => (
               <div key={i} className="flex gap-4 items-start pb-4 border-b border-white/5">
                 <div className="w-2 h-2 mt-1.5 rounded-full bg-cyber-blue" />
                 <div>
                   <div className="text-sm text-white">System update deployed</div>
                   <div className="font-mono text-[10px] text-gray-500">2 HOURS AGO</div>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}

function AdminPortfolio() {
  const { searchQuery } = useAdmin();
  const [projects, setProjects] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const navigate = useNavigate();

  const loadProjects = () => {
    adminFetch('/api/projects')
      .then(res => {
        if(res.status === 401 || res.status === 403) navigate('/admin/login');
        return res.json();
      })
      .then(data => setProjects(data || []))
      .catch(console.error);
  };

  useEffect(() => {
    loadProjects();
    adminFetch('/api/categories').then(r => r.json()).then(data => setCategories(data.filter((c: any) => c.type === 'portfolio'))).catch(console.error);
  }, []);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editProject, setEditProject] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const doc = {
      title: formData.get('title'),
      cat: formData.get('cat'),
      description: formData.get('description'),
      dateCreated: formData.get('dateCreated'),
      link: formData.get('link'),
      status: formData.get('status'),
      image: formData.get('image'),
      media: JSON.parse((formData.get('media') as string) || '[]')
    };
    adminFetch('/api/admin/projects', { method: 'POST', body: JSON.stringify(doc) })
      .then(() => { setIsAddOpen(false); loadProjects(); });
  };

  const handleEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const doc = {
      title: formData.get('title'),
      cat: formData.get('cat'),
      description: formData.get('description'),
      dateCreated: formData.get('dateCreated'),
      link: formData.get('link'),
      status: formData.get('status'),
      image: formData.get('image'),
      media: JSON.parse((formData.get('media') as string) || '[]')
    };
    adminFetch(`/api/admin/projects/${editProject.id}`, { method: 'PUT', body: JSON.stringify(doc) })
      .then(() => { setEditProject(null); loadProjects(); });
  };

  const handleDelete = () => {
    if (!deleteId) return;
    adminFetch(`/api/admin/projects/${deleteId}`, { method: 'DELETE' })
      .then(() => { setDeleteId(null); loadProjects(); });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-widest uppercase">Portfolio CMS</h1>
          <p className="font-mono text-xs text-gray-400 mt-1">MANAGE_PROJECTS // DATABASE_SYNCED</p>
        </div>
        <button 
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 bg-cyber-blue/10 border border-cyber-blue text-cyber-blue font-mono text-sm hover:bg-cyber-blue/20 transition-colors flex items-center gap-2 w-max"
        >
          <Plus size={16}/> ADD_NEW_PROJECT
        </button>
      </div>

      <div className="bg-[#121212] border border-cyber-blue/30 rounded-sm overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead>
            <tr className="border-b border-cyber-blue/20">
              <th className="p-4 font-mono text-xs text-gray-500 font-normal">PROJECT_ID</th>
              <th className="p-4 font-mono text-xs text-gray-500 font-normal">TITLE</th>
              <th className="p-4 font-mono text-xs text-gray-500 font-normal">CATEGORY</th>
              <th className="p-4 font-mono text-xs text-gray-500 font-normal">STATUS</th>
              <th className="p-4 font-mono text-xs text-gray-500 font-normal text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.map((p, i) => (
              <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                <td className="p-4 font-mono text-xs text-cyber-blue">{p.id}</td>
                <td className="p-4 text-sm text-white">{p.title}</td>
                <td className="p-4 text-sm text-gray-400">{p.cat}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-[10px] font-mono border ${p.status === 'ACTIVE' ? 'border-cyber-green text-cyber-green' : 'border-gray-500 text-gray-500'}`}>
                    {p.status}
                  </span>
                </td>
                <td className="p-4 text-right space-x-4">
                  <button onClick={() => setEditProject(p)} className="text-xs font-mono text-gray-400 hover:text-white inline-flex items-center gap-1"><Edit2 size={12}/> EDIT</button>
                  <button onClick={() => setDeleteId(p.id)} className="text-xs font-mono text-red-400 hover:text-red-300 inline-flex items-center gap-1"><Trash2 size={12}/> DEL</button>
                </td>
              </tr>
            ))}
            {filteredProjects.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center font-mono text-gray-500 text-sm">NO_PROJECTS_FOUND</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal title="ADD_NEW_PROJECT" isOpen={isAddOpen} onClose={() => setIsAddOpen(false)}>
        <form className="space-y-4" onSubmit={handleCreate}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-xs text-cyber-blue mb-2">TITLE</label>
              <input type="text" name="title" className="w-full bg-black/50 border border-white/10 px-4 py-2 text-white font-mono text-sm focus:border-cyber-blue focus:outline-none" required />
            </div>
            <div>
              <label className="block font-mono text-xs text-cyber-blue mb-2">CATEGORY</label>
              <select name="cat" className="w-full bg-black/50 border border-white/10 px-4 py-2 text-white font-mono text-sm focus:border-cyber-blue focus:outline-none" required>
                {categories.map((c, idx) => (
                  <option key={idx} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block font-mono text-xs text-cyber-blue mb-2">DESCRIPTION</label>
            <textarea name="description" rows={4} className="w-full bg-black/50 border border-white/10 px-4 py-2 text-white font-mono text-sm focus:border-cyber-blue focus:outline-none resize-none" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-mono text-xs text-cyber-blue mb-2">DATE CREATED</label>
              <input type="date" name="dateCreated" className="w-full bg-black/50 border border-white/10 px-4 py-2 text-white font-mono text-sm focus:border-cyber-blue focus:outline-none [color-scheme:dark]" required />
            </div>
            <div>
              <label className="block font-mono text-xs text-cyber-blue mb-2">PROJECT LINK</label>
              <input type="url" name="link" placeholder="https://" className="w-full bg-black/50 border border-white/10 px-4 py-2 text-white font-mono text-sm focus:border-cyber-blue focus:outline-none" />
            </div>
            <div>
              <label className="block font-mono text-xs text-cyber-blue mb-2">STATUS</label>
              <select name="status" className="w-full bg-black/50 border border-white/10 px-4 py-2 text-white font-mono text-sm focus:border-cyber-blue focus:outline-none">
                <option value="ACTIVE">ACTIVE</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block font-mono text-xs text-cyber-blue mb-2">COVER IMAGE (DRAG & DROP)</label>
            <FileUploadArea name="image" />
          </div>
          <div>
              <label className="block font-mono text-xs text-cyber-blue mb-2 mt-4">EXTRA MEDIA CONTENTS (OPTIONAL)</label>
              <MultipleFileUploadArea name="media" />
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 border border-gray-600 text-gray-400 hover:text-white font-mono text-sm">CANCEL</button>
            <button type="submit" className="px-4 py-2 bg-cyber-blue text-black font-bold font-mono text-sm hover:bg-white transition-colors">SAVE_PROJECT</button>
          </div>
        </form>
      </Modal>

      <Modal title="EDIT_PROJECT" isOpen={!!editProject} onClose={() => setEditProject(null)}>
        {editProject && (
          <form className="space-y-4" onSubmit={handleEdit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-xs text-cyber-blue mb-2">PROJECT_ID</label>
                <input type="text" value={editProject.id} disabled className="w-full bg-black/20 border border-white/5 text-gray-500 px-4 py-2 font-mono text-sm" />
              </div>
              <div>
                <label className="block font-mono text-xs text-cyber-blue mb-2">TITLE</label>
                <input type="text" name="title" defaultValue={editProject.title} className="w-full bg-black/50 border border-white/10 px-4 py-2 text-white font-mono text-sm focus:border-cyber-blue focus:outline-none" required />
              </div>
            </div>
            <div>
              <label className="block font-mono text-xs text-cyber-blue mb-2">CATEGORY</label>
              <select name="cat" defaultValue={editProject.cat} className="w-full bg-black/50 border border-white/10 px-4 py-2 text-white font-mono text-sm focus:border-cyber-blue focus:outline-none" required>
                {categories.map((c, idx) => (
                  <option key={idx} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-mono text-xs text-cyber-blue mb-2">DESCRIPTION</label>
              <textarea name="description" rows={4} className="w-full bg-black/50 border border-white/10 px-4 py-2 text-white font-mono text-sm focus:border-cyber-blue focus:outline-none resize-none" defaultValue={editProject.description || ("Detailed description of the " + editProject.title)} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-mono text-xs text-cyber-blue mb-2">DATE CREATED</label>
                <input type="date" name="dateCreated" defaultValue={editProject.dateCreated || "2024-01-01"} className="w-full bg-black/50 border border-white/10 px-4 py-2 text-white font-mono text-sm focus:border-cyber-blue focus:outline-none [color-scheme:dark]" required />
              </div>
              <div>
                <label className="block font-mono text-xs text-cyber-blue mb-2">PROJECT LINK</label>
                <input type="url" name="link" placeholder="https://" defaultValue={editProject.link || "https://daiken.dev"} className="w-full bg-black/50 border border-white/10 px-4 py-2 text-white font-mono text-sm focus:border-cyber-blue focus:outline-none" />
              </div>
              <div>
                <label className="block font-mono text-xs text-cyber-blue mb-2">STATUS</label>
                <select name="status" defaultValue={editProject.status} className="w-full bg-black/50 border border-white/10 px-4 py-2 text-white font-mono text-sm focus:border-cyber-blue focus:outline-none">
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block font-mono text-xs text-cyber-blue mb-2">COVER IMAGE (DRAG & DROP)</label>
              <FileUploadArea name="image" defaultValue={editProject.image} />
            </div>
            <div>
              <label className="block font-mono text-xs text-cyber-blue mb-2 mt-4">EXTRA MEDIA CONTENTS (OPTIONAL)</label>
              <MultipleFileUploadArea name="media" defaultValues={editProject.media || []} />
            </div>
            <div className="pt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setEditProject(null)} className="px-4 py-2 border border-gray-600 text-gray-400 hover:text-white font-mono text-sm">CANCEL</button>
              <button type="submit" className="px-4 py-2 bg-cyber-blue text-black font-bold font-mono text-sm hover:bg-white transition-colors">UPDATE_PROJECT</button>
            </div>
          </form>
        )}
      </Modal>

      <Modal title="CONFIRM_DELETE" isOpen={!!deleteId} onClose={() => setDeleteId(null)}>
        <p className="font-mono text-sm text-gray-300 mb-6">Are you sure you want to permanently delete project <span className="text-red-400">{deleteId}</span>?</p>
        <div className="flex justify-end gap-2">
          <button onClick={() => setDeleteId(null)} className="px-4 py-2 border border-gray-600 text-gray-400 hover:text-white font-mono text-sm">CANCEL</button>
          <button onClick={handleDelete} className="px-4 py-2 bg-red-500/20 text-red-500 border border-red-500 font-bold font-mono text-sm hover:bg-red-500 hover:text-black transition-colors">DELETE_PROJECT</button>
        </div>
      </Modal>
    </div>
  );
}

function AdminCertificates() {
  const { searchQuery } = useAdmin();
  const [certificates, setCertificates] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const navigate = useNavigate();

  const loadCerts = () => {
    adminFetch('/api/certificates')
      .then(res => {
        if(res.status === 401 || res.status === 403) navigate('/admin/login');
        return res.json();
      })
      .then(data => setCertificates(data || []))
      .catch(console.error);
  };

  useEffect(() => {
    loadCerts();
    adminFetch('/api/categories').then(r => r.json()).then(data => setCategories(data.filter((c: any) => c.type === 'certificate'))).catch(console.error);
  }, []);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editCert, setEditCert] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredCerts = certificates.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.issuer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const doc = {
      title: formData.get('title'),
      issuer: formData.get('issuer'),
      description: formData.get('description'),
      year: formData.get('year'),
      cat: formData.get('cat'),
      image: formData.get('image'),
    };
    adminFetch('/api/admin/certificates', { method: 'POST', body: JSON.stringify(doc) })
      .then(() => { setIsAddOpen(false); loadCerts(); });
  };

  const handleEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const doc = {
      title: formData.get('title'),
      issuer: formData.get('issuer'),
      description: formData.get('description'),
      year: formData.get('year'),
      cat: formData.get('cat'),
      image: formData.get('image'),
    };
    adminFetch(`/api/admin/certificates/${editCert.id}`, { method: 'PUT', body: JSON.stringify(doc) })
      .then(() => { setEditCert(null); loadCerts(); });
  };

  const handleDelete = () => {
    if (!deleteId) return;
    adminFetch(`/api/admin/certificates/${deleteId}`, { method: 'DELETE' })
      .then(() => { setDeleteId(null); loadCerts(); });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-widest uppercase">Certificates CMS</h1>
          <p className="font-mono text-xs text-gray-400 mt-1">MANAGE_CREDENTIALS</p>
        </div>
        <button 
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 bg-cyber-blue/10 border border-cyber-blue text-cyber-blue font-mono text-sm hover:bg-cyber-blue/20 transition-colors flex items-center gap-2 w-max"
        >
          <Plus size={16}/> ADD_CERTIFICATE
        </button>
      </div>

      <div className="bg-[#121212] border border-cyber-blue/30 rounded-sm overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead>
            <tr className="border-b border-cyber-blue/20">
              <th className="p-4 font-mono text-xs text-gray-500 font-normal">CERT_ID</th>
              <th className="p-4 font-mono text-xs text-gray-500 font-normal">TITLE</th>
              <th className="p-4 font-mono text-xs text-gray-500 font-normal">ISSUER</th>
              <th className="p-4 font-mono text-xs text-gray-500 font-normal">YEAR</th>
              <th className="p-4 font-mono text-xs text-gray-500 font-normal text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredCerts.map((c, i) => (
              <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                <td className="p-4 font-mono text-xs text-cyber-blue">{c.id}</td>
                <td className="p-4 text-sm text-white">{c.title}</td>
                <td className="p-4 text-sm text-gray-400">{c.issuer}</td>
                <td className="p-4 text-sm text-gray-400">{c.year}</td>
                <td className="p-4 text-right space-x-4">
                  <button onClick={() => setEditCert(c)} className="text-xs font-mono text-gray-400 hover:text-white inline-flex items-center gap-1"><Edit2 size={12}/> EDIT</button>
                  <button onClick={() => setDeleteId(c.id)} className="text-xs font-mono text-red-400 hover:text-red-300 inline-flex items-center gap-1"><Trash2 size={12}/> DEL</button>
                </td>
              </tr>
            ))}
            {filteredCerts.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center font-mono text-gray-500 text-sm">NO_CERTIFICATES_FOUND</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal title="ADD_NEW_CERTIFICATE" isOpen={isAddOpen} onClose={() => setIsAddOpen(false)}>
        <form className="space-y-4" onSubmit={handleCreate}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-xs text-cyber-blue mb-2">TITLE</label>
              <input type="text" name="title" className="w-full bg-black/50 border border-white/10 px-4 py-2 text-white font-mono text-sm focus:border-cyber-blue focus:outline-none" required />
            </div>
            <div>
              <label className="block font-mono text-xs text-cyber-blue mb-2">ISSUER</label>
              <input type="text" name="issuer" className="w-full bg-black/50 border border-white/10 px-4 py-2 text-white font-mono text-sm focus:border-cyber-blue focus:outline-none" required />
            </div>
          </div>
          <div>
            <label className="block font-mono text-xs text-cyber-blue mb-2">DESCRIPTION</label>
            <textarea name="description" rows={3} className="w-full bg-black/50 border border-white/10 px-4 py-2 text-white font-mono text-sm focus:border-cyber-blue focus:outline-none resize-none" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-xs text-cyber-blue mb-2">YEAR</label>
              <input type="number" name="year" min="1990" max="2099" className="w-full bg-black/50 border border-white/10 px-4 py-2 text-white font-mono text-sm focus:border-cyber-blue focus:outline-none" required />
            </div>
            <div>
              <label className="block font-mono text-xs text-cyber-blue mb-2">CATEGORY</label>
              <select name="cat" className="w-full bg-black/50 border border-white/10 px-4 py-2 text-white font-mono text-sm focus:border-cyber-blue focus:outline-none" required>
                {categories.map((c, idx) => (
                  <option key={idx} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block font-mono text-xs text-cyber-blue mb-2">CERTIFICATE IMAGE (DRAG & DROP)</label>
            <FileUploadArea name="image" />
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 border border-gray-600 text-gray-400 hover:text-white font-mono text-sm">CANCEL</button>
            <button type="submit" className="px-4 py-2 bg-cyber-blue text-black font-bold font-mono text-sm hover:bg-white transition-colors">SAVE_CERTIFICATE</button>
          </div>
        </form>
      </Modal>

      <Modal title="EDIT_CERTIFICATE" isOpen={!!editCert} onClose={() => setEditCert(null)}>
        {editCert && (
          <form className="space-y-4" onSubmit={handleEdit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-xs text-cyber-blue mb-2">CERT_ID</label>
                <input type="text" value={editCert.id} disabled className="w-full bg-black/20 border border-white/5 text-gray-500 px-4 py-2 font-mono text-sm" />
              </div>
              <div>
                <label className="block font-mono text-xs text-cyber-blue mb-2">TITLE</label>
                <input type="text" name="title" defaultValue={editCert.title} className="w-full bg-black/50 border border-white/10 px-4 py-2 text-white font-mono text-sm focus:border-cyber-blue focus:outline-none" required />
              </div>
            </div>
            <div>
              <label className="block font-mono text-xs text-cyber-blue mb-2">ISSUER</label>
              <input type="text" name="issuer" defaultValue={editCert.issuer} className="w-full bg-black/50 border border-white/10 px-4 py-2 text-white font-mono text-sm focus:border-cyber-blue focus:outline-none" required />
            </div>
            <div>
              <label className="block font-mono text-xs text-cyber-blue mb-2">DESCRIPTION</label>
              <textarea name="description" rows={3} className="w-full bg-black/50 border border-white/10 px-4 py-2 text-white font-mono text-sm focus:border-cyber-blue focus:outline-none resize-none" defaultValue={editCert.description || ("Details about " + editCert.title)} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-xs text-cyber-blue mb-2">YEAR</label>
                <input type="number" name="year" defaultValue={editCert.year} className="w-full bg-black/50 border border-white/10 px-4 py-2 text-white font-mono text-sm focus:border-cyber-blue focus:outline-none" required />
              </div>
              <div>
                <label className="block font-mono text-xs text-cyber-blue mb-2">CATEGORY</label>
                <select name="cat" defaultValue={editCert.cat} className="w-full bg-black/50 border border-white/10 px-4 py-2 text-white font-mono text-sm focus:border-cyber-blue focus:outline-none" required>
                  {categories.map((c, idx) => (
                    <option key={idx} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block font-mono text-xs text-cyber-blue mb-2">CERTIFICATE IMAGE (DRAG & DROP)</label>
              <FileUploadArea name="image" defaultValue={editCert.image} />
            </div>
            <div className="pt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setEditCert(null)} className="px-4 py-2 border border-gray-600 text-gray-400 hover:text-white font-mono text-sm">CANCEL</button>
              <button type="submit" className="px-4 py-2 bg-cyber-blue text-black font-bold font-mono text-sm hover:bg-white transition-colors">UPDATE_CERTIFICATE</button>
            </div>
          </form>
        )}
      </Modal>

      <Modal title="CONFIRM_DELETE" isOpen={!!deleteId} onClose={() => setDeleteId(null)}>
        <p className="font-mono text-sm text-gray-300 mb-6">Are you sure you want to permanently delete certificate <span className="text-red-400">{deleteId}</span>?</p>
        <div className="flex justify-end gap-2">
          <button onClick={() => setDeleteId(null)} className="px-4 py-2 border border-gray-600 text-gray-400 hover:text-white font-mono text-sm">CANCEL</button>
          <button onClick={handleDelete} className="px-4 py-2 bg-red-500/20 text-red-500 border border-red-500 font-bold font-mono text-sm hover:bg-red-500 hover:text-black transition-colors">DELETE_CERTIFICATE</button>
        </div>
      </Modal>
    </div>
  );
}

function AdminNotifications() {
  const { searchQuery } = useAdmin();
  const [notifications, setNotifications] = useState<any[]>([]);
  const navigate = useNavigate();

  const loadNotifs = () => {
    adminFetch('/api/admin/notifications')
      .then(res => {
        if(res.status === 401 || res.status === 403) navigate('/admin/login');
        return res.json();
      })
      .then(data => setNotifications(data || []))
      .catch(console.error);
  };

  useEffect(() => { loadNotifs(); }, []);

  const filteredNotifs = notifications.filter(n => 
    n.message.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const markAllRead = () => {
    adminFetch('/api/admin/notifications/read-all', { method: 'PUT' })
      .then(res => res.json())
      .then(data => setNotifications(data))
      .catch(console.error);
  };

  const getIconColor = (type: string) => {
    switch(type) {
      case 'SYSTEM': return 'bg-cyber-blue';
      case 'ALERT': return 'bg-red-500';
      case 'USER': return 'bg-cyber-green';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-widest uppercase">Notifications</h1>
          <p className="font-mono text-xs text-gray-400 mt-1">SYSTEM_ALERTS // USER_MESSAGES</p>
        </div>
        <button 
          onClick={markAllRead}
          className="px-4 py-2 border border-cyber-blue/50 text-cyber-blue font-mono text-xs hover:bg-cyber-blue/10 transition-colors"
        >
          MARK_ALL_AS_READ
        </button>
      </div>

      <div className="space-y-4">
        {filteredNotifs.map((n, i) => (
          <div key={i} className={`bg-[#121212] border ${n.read ? 'border-white/10' : 'border-cyber-blue/40 shadow-[0_0_15px_rgba(10,226,255,0.1)]'} p-4 flex gap-4 items-start transition-all`}>
            <div className={`w-2 h-2 mt-1.5 rounded-full ${getIconColor(n.type)} ${!n.read && 'animate-pulse'}`} />
            <div className="flex-1">
              <div className="flex justify-between items-start gap-4">
                <span className={`text-sm ${n.read ? 'text-gray-400' : 'text-white font-bold'}`}>{n.message}</span>
                <span className="font-mono text-[10px] text-gray-500 whitespace-nowrap">{n.time}</span>
              </div>
              <div className="mt-2 flex gap-2">
                <span className="px-2 py-0.5 text-[9px] font-mono border border-white/10 text-gray-500">{n.type}</span>
              </div>
            </div>
          </div>
        ))}
        {filteredNotifs.length === 0 && (
          <div className="bg-[#121212] border border-white/10 p-8 text-center font-mono text-sm text-gray-500">
            NO_NOTIFICATIONS_FOUND
          </div>
        )}
      </div>
    </div>
  );
}

function AdminSettings() {
  const { showToast } = useAdmin();
  const [settings, setSettings] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    adminFetch('/api/settings')
      .then(res => {
        if(res.status === 401 || res.status === 403) navigate('/admin/login');
        return res.json();
      })
      .then(data => setSettings(data))
      .catch(console.error);
  }, []);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newSettings = {
      siteTitle: formData.get('siteTitle'),
      siteLogo: formData.get('siteLogo'),
      contactEmail: formData.get('contactEmail'),
      socialLinks: {
        github: formData.get('github'),
        linkedin: formData.get('linkedin'),
        twitter: formData.get('twitter'),
        instagram: formData.get('instagram'),
        email: formData.get('email'),
        whatsapp: formData.get('whatsapp'),
      },
      maintenanceMode: formData.get('maintenanceMode') === 'on'
    };
    
    adminFetch('/api/admin/settings', { method: 'PUT', body: JSON.stringify(newSettings) })
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        showToast('SETTINGS CORRECTLY SAVED');
      });
  };

  if (!settings) return null;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-widest uppercase">Settings</h1>
        <p className="font-mono text-xs text-gray-400 mt-1">SYSTEM_CONFIGURATION</p>
      </div>

      <div className="bg-[#121212] border border-cyber-blue/30 rounded-sm p-6 max-w-2xl">
        <form className="space-y-6" onSubmit={handleSave}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <label className="block font-mono text-xs text-cyber-blue mb-2">SITE_TITLE</label>
                <input type="text" name="siteTitle" defaultValue={settings.siteTitle} className="w-full bg-black/50 border border-white/10 px-4 py-2 text-white font-mono text-sm focus:border-cyber-blue focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="block font-mono text-xs text-cyber-blue mb-2">CONTACT_EMAIL</label>
                <input type="email" name="contactEmail" defaultValue={settings.contactEmail} className="w-full bg-black/50 border border-white/10 px-4 py-2 text-white font-mono text-sm focus:border-cyber-blue focus:outline-none transition-colors" />
              </div>
            </div>
            
            <div>
              <label className="block font-mono text-xs text-cyber-blue mb-2">SITE_LOGO (DRAG & DROP)</label>
              <FileUploadArea name="siteLogo" defaultValue={settings.siteLogo} accept="image/*" label="Drop logo image here" />
            </div>
          </div>

          <div className="border-t border-white/10 pt-6">
            <h3 className="font-mono text-sm text-white mb-4">SOCIAL_LINKS</h3>
            <div className="space-y-4">
              <div>
                <label className="block font-mono text-xs text-cyber-blue mb-2">GITHUB</label>
                <input type="url" name="github" defaultValue={settings.socialLinks?.github} className="w-full bg-black/50 border border-white/10 px-4 py-2 text-white font-mono text-sm focus:border-cyber-blue focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="block font-mono text-xs text-cyber-blue mb-2">LINKEDIN</label>
                <input type="url" name="linkedin" defaultValue={settings.socialLinks?.linkedin} className="w-full bg-black/50 border border-white/10 px-4 py-2 text-white font-mono text-sm focus:border-cyber-blue focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="block font-mono text-xs text-cyber-blue mb-2">TWITTER/X</label>
                <input type="url" name="twitter" defaultValue={settings.socialLinks?.twitter} className="w-full bg-black/50 border border-white/10 px-4 py-2 text-white font-mono text-sm focus:border-cyber-blue focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="block font-mono text-xs text-cyber-blue mb-2">INSTAGRAM</label>
                <input type="url" name="instagram" defaultValue={settings.socialLinks?.instagram} className="w-full bg-black/50 border border-white/10 px-4 py-2 text-white font-mono text-sm focus:border-cyber-blue focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="block font-mono text-xs text-cyber-blue mb-2">EMAIL (PUBLIC)</label>
                <input type="email" name="email" defaultValue={settings.socialLinks?.email} className="w-full bg-black/50 border border-white/10 px-4 py-2 text-white font-mono text-sm focus:border-cyber-blue focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="block font-mono text-xs text-cyber-blue mb-2">WHATSAPP (e.g. +628123456789)</label>
                <input type="text" name="whatsapp" defaultValue={settings.socialLinks?.whatsapp} className="w-full bg-black/50 border border-white/10 px-4 py-2 text-white font-mono text-sm focus:border-cyber-blue focus:outline-none transition-colors" />
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6">
            <label className="block font-mono text-xs text-cyber-blue mb-2">MAINTENANCE_MODE</label>
            <div className="flex items-center gap-2">
              <input type="checkbox" name="maintenanceMode" defaultChecked={settings.maintenanceMode} className="accent-cyber-blue" />
              <span className="text-sm text-gray-400">Enable</span>
            </div>
          </div>
          
          <button type="submit" className="px-6 py-2 bg-cyber-blue text-black font-bold font-mono text-sm hover:bg-white transition-colors">
            SAVE_CHANGES
          </button>
        </form>
      </div>
    </div>
  );
}

function AdminCategories() {
  const { searchQuery } = useAdmin();
  const [categories, setCategories] = useState<any[]>([]);
  const navigate = useNavigate();

  const loadCats = () => {
    adminFetch('/api/categories').then(res => {
      if(res.status === 401 || res.status === 403) navigate('/admin/login');
      return res.json();
    }).then(setCategories).catch(console.error);
  };

  useEffect(() => { loadCats(); }, []);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editCat, setEditCat] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredCats = categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    adminFetch('/api/admin/categories', { method: 'POST', body: JSON.stringify(Object.fromEntries(formData)) })
      .then(() => { setIsAddOpen(false); loadCats(); });
  };

  const handleEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    adminFetch(`/api/admin/categories/${editCat.id}`, { method: 'PUT', body: JSON.stringify(Object.fromEntries(formData)) })
      .then(() => { setEditCat(null); loadCats(); });
  };

  const handleDelete = () => {
    if (!deleteId) return;
    adminFetch(`/api/admin/categories/${deleteId}`, { method: 'DELETE' })
      .then(() => { setDeleteId(null); loadCats(); });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-widest uppercase">Categories</h1>
          <p className="font-mono text-xs text-gray-400 mt-1">MANAGE_CATEGORIES</p>
        </div>
        <button onClick={() => setIsAddOpen(true)} className="px-4 py-2 bg-cyber-blue/10 border border-cyber-blue text-cyber-blue font-mono text-sm hover:bg-cyber-blue/20 flex items-center gap-2">
          <Plus size={16}/> ADD_CATEGORY
        </button>
      </div>

      <div className="bg-[#121212] border border-cyber-blue/30 rounded-sm overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead>
            <tr className="border-b border-cyber-blue/20">
              <th className="p-4 font-mono text-xs text-gray-500 font-normal">ID</th>
              <th className="p-4 font-mono text-xs text-gray-500 font-normal">TYPE</th>
              <th className="p-4 font-mono text-xs text-gray-500 font-normal">NAME</th>
              <th className="p-4 font-mono text-xs text-gray-500 font-normal text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredCats.map((c, i) => (
              <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="p-4 font-mono text-xs text-cyber-blue">{c.id}</td>
                <td className="p-4 text-sm text-gray-400 uppercase">{c.type}</td>
                <td className="p-4 text-sm text-white">{c.name}</td>
                <td className="p-4 text-right space-x-4">
                  <button onClick={() => setEditCat(c)} className="text-xs font-mono text-gray-400 hover:text-white"><Edit2 size={12} className="inline mr-1"/> EDIT</button>
                  <button onClick={() => setDeleteId(c.id)} className="text-xs font-mono text-red-400 hover:text-red-300"><Trash2 size={12} className="inline mr-1"/> DEL</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal title="ADD_CATEGORY" isOpen={isAddOpen} onClose={() => setIsAddOpen(false)}>
        <form className="space-y-4" onSubmit={handleCreate}>
          <div>
            <label className="block font-mono text-xs text-cyber-blue mb-2">TYPE</label>
            <select name="type" className="w-full bg-black/50 border border-white/10 px-4 py-2 text-white font-mono text-sm focus:border-cyber-blue focus:outline-none">
              <option value="portfolio">PORTFOLIO</option>
              <option value="certificate">CERTIFICATE</option>
            </select>
          </div>
          <div>
            <label className="block font-mono text-xs text-cyber-blue mb-2">NAME</label>
            <input type="text" name="name" className="w-full bg-black/50 border border-white/10 px-4 py-2 text-white font-mono text-sm focus:border-cyber-blue focus:outline-none" required />
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <button type="submit" className="px-4 py-2 bg-cyber-blue text-black font-bold font-mono text-sm hover:bg-white transition-colors">SAVE</button>
          </div>
        </form>
      </Modal>

      <Modal title="EDIT_CATEGORY" isOpen={!!editCat} onClose={() => setEditCat(null)}>
        {editCat && (
          <form className="space-y-4" onSubmit={handleEdit}>
            <div>
              <label className="block font-mono text-xs text-cyber-blue mb-2">TYPE</label>
              <select name="type" defaultValue={editCat.type} className="w-full bg-black/50 border border-white/10 px-4 py-2 text-white font-mono text-sm focus:border-cyber-blue focus:outline-none">
                <option value="portfolio">PORTFOLIO</option>
                <option value="certificate">CERTIFICATE</option>
              </select>
            </div>
            <div>
              <label className="block font-mono text-xs text-cyber-blue mb-2">NAME</label>
              <input type="text" name="name" defaultValue={editCat.name} className="w-full bg-black/50 border border-white/10 px-4 py-2 text-white font-mono text-sm focus:border-cyber-blue focus:outline-none" required />
            </div>
            <div className="pt-4 flex justify-end gap-2">
              <button type="submit" className="px-4 py-2 bg-cyber-blue text-black font-bold font-mono text-sm hover:bg-white transition-colors">UPDATE</button>
            </div>
          </form>
        )}
      </Modal>

      <Modal title="DELETE_CATEGORY" isOpen={!!deleteId} onClose={() => setDeleteId(null)}>
        <p className="font-mono text-sm text-gray-300 mb-6">Permanently delete category?</p>
        <div className="flex justify-end gap-2">
          <button onClick={handleDelete} className="px-4 py-2 bg-red-500/20 text-red-500 border border-red-500 font-bold font-mono text-sm">DELETE</button>
        </div>
      </Modal>
    </div>
  );
}

function AdminHero() {
  const { showToast } = useAdmin();
  const [settings, setSettings] = useState<any>(null);
  
  useEffect(() => {
    adminFetch('/api/settings').then(res => res.json()).then(setSettings);
  }, []);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const heroData = {
      typeText1: formData.get('typeText1'),
      typeText2: formData.get('typeText2'),
      heading: formData.get('heading'),
      description: formData.get('description'),
      exploreText: formData.get('exploreText'),
      exploreLink: formData.get('exploreLink'),
      cvText: formData.get('cvText'),
      cvFile: formData.get('cvFile')
    };
    adminFetch('/api/admin/settings', { method: 'PUT', body: JSON.stringify({ heroData }) }).then(() => showToast('HERO DATA SAVED'));
  };

  if(!settings) return null;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-white tracking-widest uppercase mb-8">Hero Section</h1>
      <form onSubmit={handleSave} className="space-y-6 bg-[#121212] border border-cyber-blue/30 p-6">
        <div><label className="block font-mono text-xs text-cyber-blue mb-2">Type Text 1</label><input type="text" name="typeText1" defaultValue={settings.heroData?.typeText1 || "> System Initialized..."} className="w-full bg-black/50 border border-white/10 px-4 py-2 text-white font-mono text-sm outline-none focus:border-cyber-blue" /></div>
        <div><label className="block font-mono text-xs text-cyber-blue mb-2">Type Text 2</label><input type="text" name="typeText2" defaultValue={settings.heroData?.typeText2 || "> Loading Portfolio_AI_Engineer/Designer_"} className="w-full bg-black/50 border border-white/10 px-4 py-2 text-white font-mono text-sm outline-none focus:border-cyber-blue" /></div>
        <div><label className="block font-mono text-xs text-cyber-blue mb-2">Heading</label><input type="text" name="heading" defaultValue={settings.heroData?.heading || "Architecting Intelligence & Digital Experiences."} className="w-full bg-black/50 border border-white/10 px-4 py-2 text-white font-mono text-sm outline-none focus:border-cyber-blue" /></div>
        <div><label className="block font-mono text-xs text-cyber-blue mb-2">Description</label><textarea name="description" rows={3} defaultValue={settings.heroData?.description || "Fusing code, design, and machine learning to build future-ready solutions. Welcome to my neural workspace."} className="w-full bg-black/50 border border-white/10 px-4 py-2 text-white font-mono text-sm outline-none focus:border-cyber-blue" /></div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <div><label className="block font-mono text-xs text-cyber-blue mb-2">Explore Button Text</label><input type="text" name="exploreText" defaultValue={settings.heroData?.exploreText || "EXPLORE MY WORK"} className="w-full bg-black/50 border border-white/10 px-4 py-2 text-white font-mono text-sm outline-none focus:border-cyber-blue" /></div>
            <div><label className="block font-mono text-xs text-cyber-blue mb-2">Explore Button Link</label><input type="text" name="exploreLink" defaultValue={settings.heroData?.exploreLink || "#portfolio"} className="w-full bg-black/50 border border-white/10 px-4 py-2 text-white font-mono text-sm outline-none focus:border-cyber-blue" /></div>
          </div>
          <div className="space-y-4">
            <div><label className="block font-mono text-xs text-cyber-blue mb-2">CV Button Text</label><input type="text" name="cvText" defaultValue={settings.heroData?.cvText || "DOWNLOAD_CV.exe"} className="w-full bg-black/50 border border-white/10 px-4 py-2 text-white font-mono text-sm outline-none focus:border-cyber-blue" /></div>
            <div>
              <label className="block font-mono text-xs text-cyber-blue mb-2">CV Document File</label>
              <FileUploadArea name="cvFile" defaultValue={settings.heroData?.cvFile} accept=".pdf,.doc,.docx" label="Drop CV Document Here" />
            </div>
          </div>
        </div>
        
        <button type="submit" className="px-6 py-2 bg-cyber-blue text-black font-bold font-mono text-sm">SAVE HERO</button>
      </form>
    </div>
  );
}

function AdminAbout() {
  const { showToast } = useAdmin();
  const [settings, setSettings] = useState<any>(null);
  
  useEffect(() => {
    adminFetch('/api/settings').then(res => res.json()).then(setSettings);
  }, []);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const aboutData = {
      fingerprintText: formData.get('fingerprintText'),
      fingerprintActiveText: formData.get('fingerprintActiveText'),
      leftTerminalTitle: formData.get('leftTerminalTitle'),
      skillsTitle: formData.get('skillsTitle'),
      skillsList: formData.get('skillsList'),
      sysStats: formData.get('sysStats'),
      rightTerminalTitle: formData.get('rightTerminalTitle'),
      scanCompleteText: formData.get('scanCompleteText'),
      scanDetails: formData.get('scanDetails')
    };
    adminFetch('/api/admin/settings', { method: 'PUT', body: JSON.stringify({ aboutData }) }).then(() => showToast('ABOUT DATA SAVED'));
  };

  if(!settings) return null;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-white tracking-widest uppercase mb-8">About Section</h1>
      <form onSubmit={handleSave} className="space-y-6 bg-[#121212] border border-cyber-blue/30 p-6">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block font-mono text-xs text-cyber-blue mb-2">Auth Btn Text</label><input type="text" name="fingerprintText" defaultValue={settings.aboutData?.fingerprintText || "IDENTIFICATION"} className="w-full bg-black/50 border border-white/10 px-4 py-2 text-white font-mono text-sm outline-none focus:border-cyber-blue" /></div>
          <div><label className="block font-mono text-xs text-cyber-blue mb-2">Auth Btn Active Text</label><input type="text" name="fingerprintActiveText" defaultValue={settings.aboutData?.fingerprintActiveText || "ACCESS GRANTED"} className="w-full bg-black/50 border border-white/10 px-4 py-2 text-white font-mono text-sm outline-none focus:border-cyber-blue" /></div>
        </div>
        <div className="border-t border-white/10 pt-4">
          <h3 className="text-white font-bold mb-4 uppercase">Left Terminal</h3>
          <div className="space-y-4">
            <div><label className="block font-mono text-xs text-cyber-blue mb-2">Title</label><input type="text" name="leftTerminalTitle" defaultValue={settings.aboutData?.leftTerminalTitle || "PROFILE V1.0"} className="w-full bg-black/50 border border-white/10 px-4 py-2 text-white font-mono text-sm outline-none focus:border-cyber-blue" /></div>
            <div><label className="block font-mono text-xs text-cyber-blue mb-2">Skills Title</label><input type="text" name="skillsTitle" defaultValue={settings.aboutData?.skillsTitle || "KEAHLIAN TEKNIS"} className="w-full bg-black/50 border border-white/10 px-4 py-2 text-white font-mono text-sm outline-none focus:border-cyber-blue" /></div>
            <div><label className="block font-mono text-xs text-cyber-blue mb-2">Skills List (comma separated)</label><textarea name="skillsList" rows={2} defaultValue={settings.aboutData?.skillsList || "Front-End Development, Back-End, Desain UI/UX (Figma), Data Science, Cloud Architecture"} className="w-full bg-black/50 border border-white/10 px-4 py-2 text-white font-mono text-sm outline-none focus:border-cyber-blue" /></div>
            <div><label className="block font-mono text-xs text-cyber-blue mb-2">Sys Stats</label><input type="text" name="sysStats" defaultValue={settings.aboutData?.sysStats || "Sys_stats: OK | CPU: 34% | RAM: 4.2GB"} className="w-full bg-black/50 border border-white/10 px-4 py-2 text-white font-mono text-sm outline-none focus:border-cyber-blue" /></div>
          </div>
        </div>
        <div className="border-t border-white/10 pt-4">
          <h3 className="text-white font-bold mb-4 uppercase">Right Terminal</h3>
          <div className="space-y-4">
            <div><label className="block font-mono text-xs text-cyber-blue mb-2">Title</label><input type="text" name="rightTerminalTitle" defaultValue={settings.aboutData?.rightTerminalTitle || "TERMINAL V1.0"} className="w-full bg-black/50 border border-white/10 px-4 py-2 text-white font-mono text-sm outline-none focus:border-cyber-blue" /></div>
            <div><label className="block font-mono text-xs text-cyber-blue mb-2">Scan Complete Text</label><input type="text" name="scanCompleteText" defaultValue={settings.aboutData?.scanCompleteText || "[BIOMETRIC SCAN COMPLETE]"} className="w-full bg-black/50 border border-white/10 px-4 py-2 text-white font-mono text-sm outline-none focus:border-cyber-blue" /></div>
            <div><label className="block font-mono text-xs text-cyber-blue mb-2">Scan Details</label><textarea name="scanDetails" rows={3} defaultValue={settings.aboutData?.scanDetails || "USER_ID: 9942\nACCESS: Administrator\nHACKER_MODE: ENGAGED"} className="w-full bg-black/50 border border-white/10 px-4 py-2 text-white font-mono text-sm outline-none focus:border-cyber-blue" /></div>
          </div>
        </div>
        <button type="submit" className="px-6 py-2 bg-cyber-blue text-black font-bold font-mono text-sm">SAVE ABOUT</button>
      </form>
    </div>
  );
}

export function Admin() {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [toastMsg, setToastMsg] = React.useState('');
  const [toastVisible, setToastVisible] = React.useState(false);
  const location = useLocation();

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Hero Section', path: '/admin/hero', icon: Edit2 },
    { name: 'About Section', path: '/admin/about', icon: Edit2 },
    { name: 'Categories', path: '/admin/categories', icon: FolderKanban },
    { name: 'Portfolio', path: '/admin/portfolio', icon: FolderKanban },
    { name: 'Certificates', path: '/admin/certificates', icon: Award },
    { name: 'Notifications', path: '/admin/notifications', icon: Bell },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <AdminContext.Provider value={{ searchQuery, setSearchQuery, showToast }}>
      <Toast message={toastMsg} visible={toastVisible} />
      <div className="min-h-screen bg-cyber-dark text-gray-300 flex overflow-hidden font-sans selection:bg-cyber-blue/30">
        {/* Mobile sidebar overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <motion.aside
          className={`fixed lg:static top-0 left-0 h-full w-64 bg-[#0a0a0a] border-r border-cyber-blue/20 z-50 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        >
          <div className="p-6 border-b border-cyber-blue/20 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white tracking-widest">NEXUS<span className="text-cyber-blue">CMS</span></h2>
              <div className="font-mono text-[10px] text-cyber-blue mt-1 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-pulse" />
                SYS_ACTIVE
              </div>
            </div>
            <button className="lg:hidden text-gray-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-6">
            <nav className="space-y-1 px-3">
              <div className="px-3 mb-2 font-mono text-[10px] text-gray-500 tracking-widest">MAIN_MENU</div>
              {navItems.map((item) => {
                const active = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-sm group relative ${active ? 'text-cyber-blue' : 'text-gray-400 hover:text-white'}`}
                  >
                    {active && (
                      <motion.div layoutId="sidebar-active" className="absolute inset-0 bg-cyber-blue/10 border-l-2 border-cyber-blue pointer-events-none" />
                    )}
                    <item.icon size={18} className="relative z-10" />
                    <span className="font-mono text-sm relative z-10">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="p-4 border-t border-cyber-blue/20 flex flex-col gap-2">
            <Link to="/" className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white transition-colors">
              <LogOut size={18} className="rotate-180" />
              <span className="font-mono text-sm">Exit to Site</span>
            </Link>
            <button onClick={async () => {
               await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
               localStorage.removeItem('adminToken');
               window.location.href = '/admin/login';
            }} className="flex items-center gap-3 px-3 py-2 text-red-500/80 hover:text-red-500 transition-colors w-full text-left">
              <LogOut size={18} />
              <span className="font-mono text-sm">LOGOUT</span>
            </button>
          </div>
        </motion.aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,150,255,0.05),transparent_50%)] pointer-events-none" />
          
          {/* Top Header */}
          <header className="h-16 border-b border-cyber-blue/20 bg-[#0a0a0a]/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-8 z-10">
            <div className="flex items-center gap-4">
              <button className="lg:hidden text-gray-400 hover:text-white" onClick={() => setSidebarOpen(true)}>
                <Menu size={24} />
              </button>
              <div className="hidden md:flex items-center gap-2 bg-black/50 border border-white/10 px-3 py-1.5 rounded-sm">
                <Search size={16} className="text-gray-500" />
                <input 
                  type="text" 
                  placeholder="QUERY_RECORDS..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm font-mono text-white placeholder-gray-600 w-64" 
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Link to="/admin/notifications" className="relative text-gray-400 hover:text-white transition-colors">
                <Bell size={20} />
                <span className="absolute top-0 right-0 w-2 h-2 bg-cyber-purple rounded-full" />
              </Link>
              <div className="w-8 h-8 rounded-sm bg-cyber-blue/20 border border-cyber-blue/50 flex items-center justify-center font-mono text-sm text-cyber-blue">
                DK
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-8 z-10 no-scrollbar">
            <Routes>
              <Route path="/" element={<AdminDashboard />} />
              <Route path="/hero" element={<AdminHero />} />
              <Route path="/about" element={<AdminAbout />} />
              <Route path="/categories" element={<AdminCategories />} />
              <Route path="/portfolio" element={<AdminPortfolio />} />
              <Route path="/certificates" element={<AdminCertificates />} />
              <Route path="/notifications" element={<AdminNotifications />} />
              <Route path="/settings" element={<AdminSettings />} />
            </Routes>
          </main>
        </div>
      </div>
    </AdminContext.Provider>
  );
}
