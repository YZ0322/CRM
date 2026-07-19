import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Settings2, Bell, Globe, Palette, Shield, Database, Cloud, Save, RefreshCw, Check, Moon, Sun, Download, FileText } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '../hooks/useTheme';
import { request } from '../lib/request';

interface SettingItem {
  id: string;
  label: string;
  description: string;
  type: 'toggle' | 'select' | 'text';
  value: boolean | string;
  options?: string[];
}

const settingsData: SettingItem[] = [
  { id: 'notifications', label: '系统通知', description: '接收系统重要通知和消息', type: 'toggle', value: true },
  { id: 'email_notifications', label: '邮件通知', description: '通过邮件接收通知', type: 'toggle', value: true },
  { id: 'sms_notifications', label: '短信通知', description: '通过短信接收重要通知', type: 'toggle', value: false },
  { id: 'language', label: '语言', description: '系统显示语言', type: 'select', value: 'zh-CN', options: ['zh-CN', 'en-US', 'ja-JP'] },
  { id: 'theme', label: '主题', description: '界面主题风格', type: 'select', value: 'light', options: ['light', 'dark'] },
  { id: 'timezone', label: '时区', description: '系统显示时区', type: 'select', value: 'Asia/Shanghai', options: ['Asia/Shanghai', 'UTC', 'America/New_York'] }
];

export function Settings() {
  const [settings, setSettings] = useState<Record<string, boolean | string>>(() => {
    const initial: Record<string, boolean | string> = {};
    settingsData.forEach(item => {
      initial[item.id] = item.value;
    });
    return initial;
  });

  const { theme, isDark } = useTheme();
  const [activeSection, setActiveSection] = useState('general');
  const [backupSuccess, setBackupSuccess] = useState(false);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [backupList, setBackupList] = useState<string[]>([]);
  const [loadingBackups, setLoadingBackups] = useState(false);

  useEffect(() => {
    setSettings(prev => ({ ...prev, theme }));
  }, [theme]);

  const toggleSetting = (id: string) => {
    setSettings(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const updateSetting = (id: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [id]: value
    }));
    if (id === 'theme') {
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(value);
      localStorage.setItem('theme', value);
    }
  };

  const fetchBackupList = async () => {
    setLoadingBackups(true);
    try {
      const result = await request.get('/backup/list');
      setBackupList(result.data || []);
    } catch (err) {
      console.error('获取备份列表失败:', err);
    } finally {
      setLoadingBackups(false);
    }
  };

  const handleBackup = async () => {
    try {
      const result = await request.post('/backup/create');
      setBackupSuccess(true);
      fetchBackupList();
      setTimeout(() => setBackupSuccess(false), 2000);

      const downloadUrl = result.downloadUrl;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = result.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('创建备份失败:', err);
    }
  };

  const handleDownloadBackup = (fileName: string) => {
    const token = localStorage.getItem('crm_access_token');
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `/api/backup/download/${fileName}`, true);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.responseType = 'blob';
    xhr.onload = () => {
      if (xhr.status === 200) {
        const blob = xhr.response;
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(link.href);
      }
    };
    xhr.send();
  };

  useEffect(() => {
    if (activeSection === 'system') {
      fetchBackupList();
    }
  }, [activeSection]);

  const handleCheckUpdate = () => {
    setCheckingUpdate(true);
    setTimeout(() => setCheckingUpdate(false), 1500);
  };

  const sections = [
    { id: 'general', label: '常规设置', icon: Settings2 },
    { id: 'notifications', label: '通知设置', icon: Bell },
    { id: 'appearance', label: '外观设置', icon: Palette },
    { id: 'security', label: '安全设置', icon: Shield },
    { id: 'system', label: '系统管理', icon: Database }
  ];

  return (
    <Layout title="系统设置">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
            <nav className="space-y-1">
              {sections.map(section => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors',
                      activeSection === section.id
                        ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{section.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                  {sections.find(s => s.id === activeSection)?.label}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  管理系统的各项配置和偏好设置
                </p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-lg transition-all">
                <Save className="w-4 h-4" />
                保存设置
              </button>
            </div>

            {activeSection === 'general' && (
              <div className="space-y-6">
                {settingsData.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                    <div>
                      <h3 className="font-medium text-slate-800 dark:text-slate-100">{item.label}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{item.description}</p>
                    </div>
                    {item.type === 'toggle' && (
                      <button
                        onClick={() => toggleSetting(item.id)}
                        className={cn(
                          'relative w-12 h-6 rounded-full transition-colors',
                          settings[item.id] ? 'bg-indigo-600' : 'bg-slate-300'
                        )}
                      >
                        <div className={cn(
                          'absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform',
                          settings[item.id] ? 'left-7' : 'left-1'
                        )} />
                      </button>
                    )}
                    {item.type === 'select' && item.options && (
                      <select
                        value={settings[item.id] as string}
                        onChange={(e) => updateSetting(item.id, e.target.value)}
                        className="px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      >
                        {item.options.map(option => (
                          <option key={option} value={option}>
                            {option === 'light' ? '浅色模式' : option === 'dark' ? '深色模式' : option}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeSection === 'notifications' && (
              <div className="space-y-6">
                {settingsData.filter(s => s.id.includes('notification')).map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Bell className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-800 dark:text-slate-100">{item.label}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{item.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleSetting(item.id)}
                      className={cn(
                        'relative w-12 h-6 rounded-full transition-colors',
                        settings[item.id] ? 'bg-indigo-600' : 'bg-slate-300'
                      )}
                    >
                      <div className={cn(
                        'absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform',
                        settings[item.id] ? 'left-7' : 'left-1'
                      )} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeSection === 'appearance' && (
              <div className="space-y-6">
                {settingsData.filter(s => s.id === 'theme' || s.id === 'language').map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        item.id === 'theme' ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-orange-100 dark:bg-orange-900/30'
                      }`}>
                        {item.id === 'theme' ? (
                          isDark ? (
                            <Moon className="w-5 h-5 text-purple-600" />
                          ) : (
                            <Sun className="w-5 h-5 text-purple-600" />
                          )
                        ) : (
                          <Globe className="w-5 h-5 text-orange-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-800">{item.label}</h3>
                        <p className="text-sm text-slate-500">{item.description}</p>
                      </div>
                    </div>
                    {item.options && (
                      <select
                        value={settings[item.id] as string}
                        onChange={(e) => updateSetting(item.id, e.target.value)}
                        className="px-4 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 bg-white dark:bg-slate-600 text-slate-800 dark:text-slate-100"
                      >
                        {item.options.map(option => (
                          <option key={option} value={option}>
                            {option === 'light' ? '浅色模式' : option === 'dark' ? '深色模式' : option}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeSection === 'security' && (
              <div className="space-y-4">
                {[
                  { label: '两步验证', status: 'enabled', description: '已启用，登录时需要额外验证' },
                  { label: '密码有效期', status: 'enabled', description: '每90天需要更换密码' },
                  { label: '登录失败锁定', status: 'enabled', description: '连续5次失败后锁定账号15分钟' },
                  { label: '会话超时', status: 'enabled', description: '30分钟无操作自动退出' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                    <div>
                      <h3 className="font-medium text-slate-800 dark:text-slate-100">{item.label}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{item.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-600">已启用</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeSection === 'system' && (
            <div className="space-y-6">
                <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                      <Database className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-800 dark:text-slate-100">数据库备份</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">定期备份系统数据，确保数据安全</p>
                    </div>
                  </div>
                  <button
                    onClick={handleBackup}
                    disabled={backupSuccess}
                    className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all ${
                      backupSuccess
                        ? 'bg-green-100 text-green-600'
                        : 'text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500'
                    }`}
                  >
                    {backupSuccess ? (
                      <>
                        <Check className="w-4 h-4" />
                        备份成功
                      </>
                    ) : (
                      <>
                        <Cloud className="w-4 h-4" />
                        创建备份
                      </>
                    )}
                  </button>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-800 dark:text-slate-100">备份文件列表</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">已创建的备份文件，点击下载保存到本地</p>
                    </div>
                  </div>
                  {loadingBackups ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : backupList.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">暂无备份文件</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {backupList.map((fileName, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-white dark:bg-slate-600 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-slate-700 dark:text-slate-200">{fileName}</span>
                          </div>
                          <button
                            onClick={() => handleDownloadBackup(fileName)}
                            className="flex items-center gap-1 px-3 py-1 text-xs text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                          >
                            <Download className="w-3 h-3" />
                            下载
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <RefreshCw className={`w-5 h-5 text-green-600 ${checkingUpdate ? 'animate-spin' : ''}`} />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-800 dark:text-slate-100">系统更新</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">当前版本 v1.0.0，检查是否有可用更新</p>
                    </div>
                  </div>
                  <button
                    onClick={handleCheckUpdate}
                    disabled={checkingUpdate}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-indigo-600 bg-indigo-100 hover:bg-indigo-200 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${checkingUpdate ? 'animate-spin' : ''}`} />
                    {checkingUpdate ? '检查中...' : '检查更新'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}