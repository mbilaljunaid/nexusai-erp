type Language = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'ar' | 'pt' | 'hi' | 'ru' | 'th' | 'id';

interface Translations {
  [key: string]: string;
}

interface I18nConfig {
  language: Language;
  region: string;
  currency: string;
  timezone: string;
}

const translations: Record<Language, Translations> = {
  en: {
    'nav.dashboard': 'Dashboard',
    'nav.erp': 'Enterprise Resource Planning',
    'nav.crm': 'Customer Relationship Management',
    'nav.projects': 'Project Management',
    'nav.hr': 'Human Resources',
    'nav.industries': 'Industries',
    'form.submit': 'Submit',
    'form.cancel': 'Cancel',
    'form.save': 'Save',
    'form.delete': 'Delete',
    'message.success': 'Operation successful',
    'message.error': 'Operation failed',
  },
  es: {
    'nav.dashboard': 'Panel',
    'nav.erp': 'Planificación de Recursos Empresariales',
    'nav.crm': 'Gestión de Relaciones con Clientes',
    'nav.projects': 'Gestión de Proyectos',
    'nav.hr': 'Recursos Humanos',
    'nav.industries': 'Industrias',
    'form.submit': 'Enviar',
    'form.cancel': 'Cancelar',
    'form.save': 'Guardar',
    'form.delete': 'Eliminar',
    'message.success': 'Operación exitosa',
    'message.error': 'Operación fallida',
  },
  fr: {
    'nav.dashboard': 'Tableau de bord',
    'nav.erp': 'Planification des Ressources Entreprise',
    'nav.crm': 'Gestion de la Relation Client',
    'nav.projects': 'Gestion de Projets',
    'nav.hr': 'Ressources Humaines',
    'nav.industries': 'Industries',
    'form.submit': 'Soumettre',
    'form.cancel': 'Annuler',
    'form.save': 'Enregistrer',
    'form.delete': 'Supprimer',
    'message.success': 'Opération réussie',
    'message.error': 'Opération échouée',
  },
  de: {
    'nav.dashboard': 'Dashboard',
    'nav.erp': 'Enterprise-Ressourcenplanung',
    'nav.crm': 'Kundenbeziehungsmanagement',
    'nav.projects': 'Projektmanagement',
    'nav.hr': 'Personalwesen',
    'nav.industries': 'Industrien',
    'form.submit': 'Absenden',
    'form.cancel': 'Abbrechen',
    'form.save': 'Speichern',
    'form.delete': 'Löschen',
    'message.success': 'Operation erfolgreich',
    'message.error': 'Operation fehlgeschlagen',
  },
  zh: {
    'nav.dashboard': '仪表板',
    'nav.erp': '企业资源计划',
    'nav.crm': '客户关系管理',
    'nav.projects': '项目管理',
    'nav.hr': '人力资源',
    'nav.industries': '行业',
    'form.submit': '提交',
    'form.cancel': '取消',
    'form.save': '保存',
    'form.delete': '删除',
    'message.success': '操作成功',
    'message.error': '操作失败',
  },
  ja: {
    'nav.dashboard': 'ダッシュボード',
    'nav.erp': '企業資源計画',
    'nav.crm': '顧客関係管理',
    'nav.projects': 'プロジェクト管理',
    'nav.hr': '人事',
    'nav.industries': '業界',
    'form.submit': '送信',
    'form.cancel': 'キャンセル',
    'form.save': '保存',
    'form.delete': '削除',
    'message.success': '操作成功',
    'message.error': '操作失敗',
  },
  ar: {
    'nav.dashboard': 'لوحة التحكم',
    'nav.erp': 'تخطيط موارد المؤسسة',
    'nav.crm': 'إدارة علاقات العملاء',
    'nav.projects': 'إدارة المشاريع',
    'nav.hr': 'الموارد البشرية',
    'nav.industries': 'الصناعات',
    'form.submit': 'إرسال',
    'form.cancel': 'إلغاء',
    'form.save': 'حفظ',
    'form.delete': 'حذف',
    'message.success': 'نجحت العملية',
    'message.error': 'فشلت العملية',
  },
  pt: {
    'nav.dashboard': 'Painel',
    'nav.erp': 'Planejamento de Recursos Empresariais',
    'nav.crm': 'Gerenciamento de Relacionamento com Clientes',
    'nav.projects': 'Gerenciamento de Projetos',
    'nav.hr': 'Recursos Humanos',
    'nav.industries': 'Indústrias',
    'form.submit': 'Enviar',
    'form.cancel': 'Cancelar',
    'form.save': 'Salvar',
    'form.delete': 'Excluir',
    'message.success': 'Operação bem-sucedida',
    'message.error': 'Operação falhou',
  },
  hi: {
    'nav.dashboard': 'डैशबोर्ड',
    'nav.erp': 'एंटरप्राइज रिसोर्स प्लानिंग',
    'nav.crm': 'ग्राहक संबंध प्रबंधन',
    'nav.projects': 'प्रकल्प प्रबंधन',
    'nav.hr': 'मानव संसाधन',
    'nav.industries': 'उद्योग',
    'form.submit': 'जमा करें',
    'form.cancel': 'रद्द करें',
    'form.save': 'बचाओ',
    'form.delete': 'हटाएं',
    'message.success': 'ऑपरेशन सफल',
    'message.error': 'ऑपरेशन विफल',
  },
  ru: {
    'nav.dashboard': 'Панель управления',
    'nav.erp': 'Планирование ресурсов предприятия',
    'nav.crm': 'Управление отношениями с клиентами',
    'nav.projects': 'Управление проектами',
    'nav.hr': 'Управление персоналом',
    'nav.industries': 'Отрасли',
    'form.submit': 'Отправить',
    'form.cancel': 'Отмена',
    'form.save': 'Сохранить',
    'form.delete': 'Удалить',
    'message.success': 'Операция успешна',
    'message.error': 'Операция не удалась',
  },
  th: {
    'nav.dashboard': 'แดชบอร์ด',
    'nav.erp': 'การวางแผนทรัพยากรองค์กร',
    'nav.crm': 'การจัดการความสัมพันธ์ของลูกค้า',
    'nav.projects': 'การจัดการโครงการ',
    'nav.hr': 'ทรัพยากรบุคคล',
    'nav.industries': 'อุตสาหกรรม',
    'form.submit': 'ส่ง',
    'form.cancel': 'ยกเลิก',
    'form.save': 'บันทึก',
    'form.delete': 'ลบ',
    'message.success': 'ดำเนินการสำเร็จ',
    'message.error': 'ดำเนินการล้มเหลว',
  },
  id: {
    'nav.dashboard': 'Dasbor',
    'nav.erp': 'Perencanaan Sumber Daya Perusahaan',
    'nav.crm': 'Manajemen Hubungan Pelanggan',
    'nav.projects': 'Manajemen Proyek',
    'nav.hr': 'Sumber Daya Manusia',
    'nav.industries': 'Industri',
    'form.submit': 'Kirim',
    'form.cancel': 'Batal',
    'form.save': 'Simpan',
    'form.delete': 'Hapus',
    'message.success': 'Operasi berhasil',
    'message.error': 'Operasi gagal',
  },
};

class I18n {
  private config: I18nConfig;

  constructor(initialConfig: Partial<I18nConfig> = {}) {
    this.config = {
      language: (initialConfig.language || 'en') as Language,
      region: initialConfig.region || 'US',
      currency: initialConfig.currency || 'USD',
      timezone: initialConfig.timezone || 'UTC',
    };
  }

  setLanguage(lang: Language): void {
    this.config.language = lang;
    localStorage.setItem('i18n-language', lang);
  }

  getLanguage(): Language {
    return this.config.language;
  }

  setConfig(config: Partial<I18nConfig>): void {
    this.config = { ...this.config, ...config };
    localStorage.setItem('i18n-config', JSON.stringify(this.config));
  }

  getConfig(): I18nConfig {
    return this.config;
  }

  t(key: string, defaultValue?: string): string {
    const trans = translations[this.config.language];
    return trans?.[key] || defaultValue || key;
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat(this.config.language, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat(this.config.language, {
      style: 'currency',
      currency: this.config.currency,
    }).format(value);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat(this.config.language).format(date);
  }
}

export const i18n = new I18n({
  language: (localStorage.getItem('i18n-language') as Language) || 'en',
  ...JSON.parse(localStorage.getItem('i18n-config') || '{}'),
});

export type { Language, I18nConfig };
