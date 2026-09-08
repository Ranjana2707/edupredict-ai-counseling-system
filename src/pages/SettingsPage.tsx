import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Settings,
  Building2,
  Lock,
  Cpu,
  Mail,
  ShieldAlert,
  Save,
  Globe,
  RefreshCw,
  Bell,
  Sliders,
  CheckCircle2,
  KeyRound
} from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useSystemSettings, useUpdateSystemSettings } from '../hooks/useAdminData';
import { SystemSettingsConfig } from '../types';
import { ForgotPasswordModal } from '../components/auth/ForgotPasswordModal';

export default function SettingsPage() {
  const { data: settings, isLoading } = useSystemSettings();
  const updateSettingsMutation = useUpdateSystemSettings();

  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'prediction'>('general');
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Form states matching SystemSettingsConfig
  const [appName, setAppName] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [language, setLanguage] = useState('en');
  const [enableAlerts, setEnableAlerts] = useState(true);
  const [enableFastApiProxy, setEnableFastApiProxy] = useState(true);
  const [securitySessionTimeoutMin, setSecuritySessionTimeoutMin] = useState(30);
  const [jwtSecretExpiryDays, setJwtSecretExpiryDays] = useState(7);
  const [requireMfaAdmins, setRequireMfaAdmins] = useState(false);
  const [allowedDomains, setAllowedDomains] = useState('');

  // Local sync
  useEffect(() => {
    if (settings) {
      setAppName(settings.general?.appName || '');
      setInstitutionName(settings.general?.timezone || '');
      setSupportEmail(settings.email?.senderAddress || '');
      setTheme('light');
      setLanguage(settings.general?.defaultLanguage || 'en');
      setEnableAlerts(settings.application?.autoArchiveInactiveStudents ?? true);
      setEnableFastApiProxy(true);
      setSecuritySessionTimeoutMin(settings.security?.lockoutDurationMinutes || 30);
      setJwtSecretExpiryDays(settings.security?.jwtExpiryHours || 7);
      setRequireMfaAdmins(settings.security?.mfaRequired ?? false);
      setAllowedDomains(settings.email?.smtpUser || '');
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedConfig: SystemSettingsConfig = {
      general: {
        appName,
        timezone: institutionName,
        defaultLanguage: language,
        maintenanceMode: false
      },
      email: {
        smtpServer: 'smtp.university.edu',
        smtpPort: 587,
        smtpUser: allowedDomains,
        senderAddress: supportEmail,
        enableSsl: true
      },
      security: {
        minPasswordLength: 8,
        requireSpecialChar: true,
        requireNumbers: true,
        maxFailedAttempts: 5,
        lockoutDurationMinutes: securitySessionTimeoutMin,
        jwtExpiryHours: jwtSecretExpiryDays,
        mfaRequired: requireMfaAdmins
      },
      application: {
        predictionIntervalHours: 12,
        autoArchiveInactiveStudents: enableAlerts,
        retentionTargetPercentage: 92.5
      }
    };

    updateSettingsMutation.mutate(updatedConfig);
  };

  if (isLoading || !settings) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="System Settings"
          description="Configure predictive feature weights, cohort criteria thresholds, and API connection routes."
          breadcrumbs={[{ label: 'System Settings', path: '/settings' }]}
        />
        <div className="h-96 bg-surface-container rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Settings"
        description="Configure predictive feature weights, cohort criteria thresholds, and API connection routes."
        breadcrumbs={[{ label: 'System Settings', path: '/settings' }]}
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Navigation Tab rail */}
        <div className="xl:col-span-3 space-y-2 select-none">
          <Card className="border-outline-variant/60 p-2 space-y-1 bg-surface-container/10">
            <button
              onClick={() => setActiveTab('general')}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-black uppercase flex items-center gap-2.5 transition cursor-pointer ${
                activeTab === 'general'
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <Building2 className="h-4 w-4" />
              General & Institution
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-black uppercase flex items-center gap-2.5 transition cursor-pointer ${
                activeTab === 'security'
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <Lock className="h-4 w-4" />
              Security & Sessions
            </button>

            <button
              onClick={() => setActiveTab('prediction')}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-black uppercase flex items-center gap-2.5 transition cursor-pointer ${
                activeTab === 'prediction'
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <Cpu className="h-4 w-4" />
              ML Prediction Engine
            </button>
          </Card>
        </div>

        {/* Dynamic settings form panel */}
        <div className="xl:col-span-9">
          <Card className="border-outline-variant/60">
            <form onSubmit={handleSubmit}>
              <CardHeader className="bg-surface-container/20 border-b border-outline-variant/30 p-lg">
                <CardTitle className="text-xs font-black uppercase text-on-surface flex items-center gap-2">
                  <Settings className="h-4.5 w-4.5" />
                  {activeTab === 'general' && 'Institutional Identity Configuration'}
                  {activeTab === 'security' && 'Roster Privacy & JWT Firewalls'}
                  {activeTab === 'prediction' && 'Predictive Engine Proxy Alignment'}
                </CardTitle>
                <CardDescription className="text-xs font-medium">
                  {activeTab === 'general' && 'Modify branding parameters, support route channels, and default language sets.'}
                  {activeTab === 'security' && 'Define lock periods, authorization constraints, multi-factor overrides, and email domains.'}
                  {activeTab === 'prediction' && 'Connect FastAPI XGBoost proxy relays, toggle automated notification alerts, and balance weight criteria.'}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-lg space-y-6 text-xs font-semibold">
                {/* --- GENERAL CONFIG PANEL --- */}
                {activeTab === 'general' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-on-surface-variant">Central System Label</label>
                        <input
                          type="text"
                          required
                          value={appName}
                          onChange={(e) => setAppName(e.target.value)}
                          className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-semibold focus:outline-hidden focus:border-primary text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-on-surface-variant">Institution Name</label>
                        <input
                          type="text"
                          required
                          value={institutionName}
                          onChange={(e) => setInstitutionName(e.target.value)}
                          className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-semibold focus:outline-hidden focus:border-primary text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-on-surface-variant">Central Support Routing Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-outline" />
                        <input
                          type="email"
                          required
                          value={supportEmail}
                          onChange={(e) => setSupportEmail(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-semibold focus:outline-hidden focus:border-primary text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5 select-none">
                        <label className="text-[10px] font-black uppercase text-on-surface-variant">Default App Theme</label>
                        <select
                          value={theme}
                          onChange={(e) => setTheme(e.target.value as any)}
                          className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-extrabold uppercase focus:outline-hidden focus:border-primary text-[11px] tracking-wider"
                        >
                          <option value="light">LIGHT COGNITIVE CANVAS</option>
                          <option value="dark">DARK IMMERSIVE COGNITIVE</option>
                          <option value="system">FOLLOW DESKTOP ENVIRONMENT</option>
                        </select>
                      </div>

                      <div className="space-y-1.5 select-none">
                        <label className="text-[10px] font-black uppercase text-on-surface-variant">Primary Language</label>
                        <select
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-extrabold uppercase focus:outline-hidden focus:border-primary text-[11px] tracking-wider"
                        >
                          <option value="en">ENGLISH (US - ACADEMIC)</option>
                          <option value="es">ESPAÑOL (ES - LATAM)</option>
                          <option value="fr">FRANÇAIS (FR)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- SECURITY CONFIG PANEL --- */}
                {activeTab === 'security' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-on-surface-variant">Roster Idle Session Timeout (Minutes)</label>
                        <input
                          type="number"
                          required
                          min={5}
                          value={securitySessionTimeoutMin}
                          onChange={(e) => setSecuritySessionTimeoutMin(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-semibold focus:outline-hidden focus:border-primary text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-on-surface-variant">JWT Secret Expiry (Days)</label>
                        <input
                          type="number"
                          required
                          min={1}
                          value={jwtSecretExpiryDays}
                          onChange={(e) => setJwtSecretExpiryDays(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-semibold focus:outline-hidden focus:border-primary text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-on-surface-variant">White-listed Institutional Email Domains</label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-2.5 h-4 w-4 text-outline" />
                        <input
                          type="text"
                          required
                          value={allowedDomains}
                          onChange={(e) => setAllowedDomains(e.target.value)}
                          placeholder="university.edu, college.org"
                          className="w-full pl-9 pr-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-semibold focus:outline-hidden focus:border-primary text-xs"
                        />
                      </div>
                      <p className="text-[10px] text-outline mt-1 font-medium leading-normal">
                        Separate multiple domains with commas. Restricts roster registration to recognized endpoints.
                      </p>
                    </div>

                    {/* Checkbox trigger toggles */}
                    <div className="p-3 bg-surface-container-low border border-outline-variant/30 rounded-xl space-y-3 select-none">
                      <h5 className="text-[10px] font-black uppercase text-on-surface-variant">Authorized Compliance Checklists</h5>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={requireMfaAdmins}
                          onChange={(e) => setRequireMfaAdmins(e.target.checked)}
                          className="h-4.5 w-4.5 accent-primary rounded border-outline-variant"
                        />
                        <div className="space-y-0.5">
                          <span className="text-[11px] font-bold text-on-surface">Require Multi-Factor (MFA) for Administrative roles</span>
                          <p className="text-[10px] text-on-surface-variant font-medium leading-none">Increases barrier protection across roster deletion matrices.</p>
                        </div>
                      </label>
                    </div>

                    {/* Password Recovery & Reset Protocol */}
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-3">
                      <div className="flex items-center gap-2 text-primary font-bold text-xs">
                        <KeyRound className="h-4 w-4" />
                        <span>Password & Access Recovery Protocol</span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant font-medium leading-relaxed">
                        Forgot your institutional password or need to reset system access? Launch the recovery wizard to dispatch a secure 6-digit OTP code to your institutional mailbox.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowForgotModal(true)}
                        className="text-xs font-bold gap-1.5 h-8.5"
                      >
                        <KeyRound className="h-3.5 w-3.5 text-primary" />
                        Launch Password Recovery
                      </Button>
                    </div>
                  </div>
                )}

                {/* --- PREDICTION ENGINE CONFIG PANEL --- */}
                {activeTab === 'prediction' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl border border-primary/10 bg-primary/5 flex gap-3 text-xs leading-relaxed">
                      <Sliders className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h6 className="font-sans font-black uppercase text-[10px] text-primary">FastAPI Model Interlock Config</h6>
                        <p className="text-[11px] text-on-surface-variant font-medium">
                          These metrics calibrate the live dropout prediction models. Adjusting thresholds impacts the frequency of counselor dashboard alert cards.
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-surface-container-low border border-outline-variant/30 rounded-xl space-y-4 select-none">
                      <h5 className="text-[10px] font-black uppercase text-on-surface-variant">Predictive Integration Relays</h5>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={enableFastApiProxy}
                          onChange={(e) => setEnableFastApiProxy(e.target.checked)}
                          className="h-4.5 w-4.5 accent-primary rounded border-outline-variant"
                        />
                        <div className="space-y-0.5">
                          <span className="text-[11px] font-bold text-on-surface">Enable Active FastAPI XGBoost Proxy Relay</span>
                          <p className="text-[10px] text-on-surface-variant font-medium leading-none">Toggles real-time inference vs offline lookup cached rosters.</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={enableAlerts}
                          onChange={(e) => setEnableAlerts(e.target.checked)}
                          className="h-4.5 w-4.5 accent-primary rounded border-outline-variant"
                        />
                        <div className="space-y-0.5">
                          <span className="text-[11px] font-bold text-on-surface">Enable Automatic Support Broadcast Warnings</span>
                          <p className="text-[10px] text-on-surface-variant font-medium leading-none">Sends instant push warnings to assigned counselor indices upon high threat predictions.</p>
                        </div>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 select-none">
                      <div className="p-3 border border-outline-variant/40 rounded-xl space-y-1.5">
                        <span className="text-[10px] font-black uppercase text-on-surface-variant block">Predictive Weight Coefficient</span>
                        <div className="flex items-center gap-3">
                          <input type="range" min="1" max="100" defaultValue="75" className="flex-1 accent-primary cursor-pointer" />
                          <span className="font-mono font-black text-xs">75%</span>
                        </div>
                        <p className="text-[9px] text-outline leading-none font-medium mt-1">Balances academic marks vs demographic features.</p>
                      </div>

                      <div className="p-3 border border-outline-variant/40 rounded-xl space-y-1.5">
                        <span className="text-[10px] font-black uppercase text-on-surface-variant block">Critical Alert Threshold</span>
                        <div className="flex items-center gap-3">
                          <input type="range" min="50" max="95" defaultValue="80" className="flex-1 accent-primary cursor-pointer" />
                          <span className="font-mono font-black text-xs">80%</span>
                        </div>
                        <p className="text-[9px] text-outline leading-none font-medium mt-1">Triggers high-severity tags on scores &gt;= 80%</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>

              {/* Action buttons footer */}
              <div className="p-lg border-t border-outline-variant/30 flex justify-end gap-3 bg-surface-container/10">
                <Button
                  loading={updateSettingsMutation.isPending}
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="text-xs uppercase font-black gap-1.5 h-9"
                >
                  <Save className="h-4.5 w-4.5" /> Save Configuration
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
      />
    </div>
  );
}
