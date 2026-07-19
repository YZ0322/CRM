import { useState, useRef } from 'react';
import { Layout } from '../components/Layout';
import { User, Mail, Phone, Building, Calendar, Edit2, Save, X, Camera, Shield, Lock, Bell, Palette, Globe, Check } from 'lucide-react';
import { useAuthStore } from '../hooks/useAuthStore';

export function Profile() {
  const { user, logout } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.username || '',
    email: user?.email || '',
    phone: '138****1234',
    company: '科技有限公司',
    role: user?.role === 'super_admin' ? '超级管理员' :
          user?.role === 'admin' ? '管理员' :
          user?.role === 'warehouse_admin' ? '仓库管理员' : '普通成员'
  });
  const [avatar, setAvatar] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    setEditing(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordChange = () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('请填写所有密码字段');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('新密码和确认密码不一致');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('密码长度不能少于6位');
      return;
    }
    
    setPasswordError('');
    setPasswordSuccess(true);
    setTimeout(() => {
      setPasswordSuccess(false);
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }, 2000);
  };

  const getRoleColor = () => {
    switch (user?.role) {
      case 'super_admin': return 'bg-red-100 text-red-700';
      case 'admin': return 'bg-indigo-100 text-indigo-700';
      case 'warehouse_admin': return 'bg-green-100 text-green-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  return (
    <Layout title="个人中心">
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                {avatar ? (
                  <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10" />
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-white text-indigo-600 flex items-center justify-center shadow-lg hover:bg-slate-100 transition-colors"
              >
                <Camera className="w-3 h-3" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-1">{profileData.name}</h1>
              <p className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getRoleColor()}`}>
                {profileData.role}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-800">基本信息</h2>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
                >
                  <Edit2 className="w-4 h-4" />
                  编辑资料
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-2">姓名</label>
                {editing ? (
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                ) : (
                  <p className="font-medium text-slate-800">{profileData.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-2">角色</label>
                <p className="font-medium text-slate-800">{profileData.role}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-2">电子邮箱</label>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  {editing ? (
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                  ) : (
                    <p className="font-medium text-slate-800">{profileData.email}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-2">联系电话</label>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  {editing ? (
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                  ) : (
                    <p className="font-medium text-slate-800">{profileData.phone}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-2">公司名称</label>
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-slate-400" />
                  {editing ? (
                    <input
                      type="text"
                      value={profileData.company}
                      onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                      className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                  ) : (
                    <p className="font-medium text-slate-800">{profileData.company}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-2">加入时间</label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <p className="font-medium text-slate-800">2024-01-01</p>
                </div>
              </div>
            </div>

            {editing && (
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1 px-4 py-2 text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg transition-all"
                >
                  <Save className="w-4 h-4" />
                  保存更改
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="flex items-center gap-1 px-4 py-2 text-sm text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                  取消
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">账户安全</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <Lock className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span className="text-slate-700">修改密码</span>
                  </div>
                  <span className="text-slate-400 text-sm">已设置</span>
                </button>
                <button className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-50 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-slate-700">两步验证</span>
                  </div>
                  <span className="text-green-600 text-sm">已启用</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">偏好设置</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-50 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Bell className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-slate-700">通知设置</span>
                  </div>
                  <span className="text-slate-400 text-sm">管理</span>
                </button>
                <button className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-50 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Palette className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="text-slate-700">主题设置</span>
                  </div>
                  <span className="text-slate-400 text-sm">浅色</span>
                </button>
                <button className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-50 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                      <Globe className="w-4 h-4 text-orange-600" />
                    </div>
                    <span className="text-slate-700">语言设置</span>
                  </div>
                  <span className="text-slate-400 text-sm">中文</span>
                </button>
              </div>
            </div>

            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
            >
              <Lock className="w-4 h-4" />
              退出登录
            </button>
          </div>
        </div>
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-800">修改密码</h2>
              <button onClick={() => setShowPasswordModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              {passwordError && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="p-3 bg-green-50 text-green-600 text-sm rounded-lg flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  密码修改成功
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">当前密码 *</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  placeholder="请输入当前密码"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">新密码 *</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  placeholder="请输入新密码（至少6位）"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">确认新密码 *</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  placeholder="请再次输入新密码"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 px-4 py-2 text-sm text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handlePasswordChange}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg transition-all"
              >
                <Save className="w-4 h-4" />
                修改密码
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}