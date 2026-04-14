// Always start at the top of the page on load/refresh
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

// ============================================
// FRAMER: theme-system
// ============================================
(function initTheme() {
  const saved = localStorage.getItem('theme');
  if (saved) {
    document.documentElement.setAttribute('data-theme', saved);
  }
})();

const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  let isDark;
  if (current === 'auto') {
    isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  } else {
    isDark = current === 'dark';
  }
  const next = isDark ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  if (typeof updateParticleColors === 'function') updateParticleColors();
});

// ============================================
// FRAMER: language-switcher
// ============================================
const translations = {
  en: {
    logo: 'formflu<span class="logo-x">X</span>',
    nav_projects: "Projects",
    nav_experience: "Experience",
    nav_publications: "Publications",
    nav_about: "About",
    nav_contact: "Contact",
    hero_label: "Design \u00b7 Engineering \u00b7 Strategy",
    hero_title: 'Turning complex<br>challenges into<br><span class="hero__accent">market-ready</span> products',
    hero_subtitle: "Designer and engineer with a track record of building products from concept to production \u2014 blending bio-integrated innovation with commercial strategy.",
    hero_cta: "View Projects",
    section_projects: "Selected Projects",
    section_experience: "Experience",
    section_publications: "Publications",
    section_about: "About",
    section_contact: "Get in Touch",
    proj1_title: "Trace Terra",
    proj1_desc: "Computational design and robotic fabrication research into terrain-responsive material systems — from simulation-led workflows through to full-scale prototype delivery.",
    proj2_title: "Hydro-Plantéa Atrium",
    proj2_desc: "Bio-system design for a living atrium installation — integrating water management, plant infrastructure, and spatial prototyping across a complex interdisciplinary brief.",
    proj3_title: "Beijing KSM Technologies",
    proj3_desc: "CI and R&D collaboration with a Beijing-based tech manufacturer — delivering brand system design and product research across a multi-year engagement.",
    proj4_title: "Household Water Purifier",
    proj4_desc: "Product design and prototype delivery for a household water purification device — from brief to functional prototype. Details remain confidential.",
    proj5_title: "Mel Studios",
    proj5_desc: "Co-founded and operated a commercial 3D printing studio — managing additive manufacturing production, client delivery, and operational workflows end-to-end.",
    proj6_title: "Final Year Projects",
    proj6_desc: "Two final year design projects exploring fall prevention for older adults and circular energy systems — both grounded in user-centred and systems-level thinking.",
    proj7_title: "Sesame",
    proj7_desc: "A local-first visual inspiration tool that learns your aesthetic taste — semantic search, style briefs, and 3D cluster mapping. Built from scratch in 4 days as a native macOS app.",
    other_work_title: "Other Work",
    other_work_caption: "Smaller studies, experiments, and side projects.",
    exp1_title: "R\u0026D Designer \u00b7 KSM Technologies",
    exp1_place: "London / Remote, UK",
    exp1_desc: "Led product design for the NX Water sub-brand: filter housings, control panels, and full exterior aesthetics. Created the NX Water brand identity (logo and typeface). Continued R\u0026D support on enclosure and structural design, building on earlier thermal and airflow work. Filter housing granted a Chinese design patent (Dec 2025).",
    exp2_title: "MArch Bio-Integrated Design",
    exp2_place: "University College London (UCL) \u00b7 Bartlett School of Architecture",
    exp2_desc: "Computational design and material R\u0026D for climate-resilient systems. Built and iterated prototypes using simulation-led workflows and robotic fabrication.",
    exp3_title: "Co-Founder \u00b7 3D Printing Studio (Mel Studios)",
    exp3_place: "London, UK",
    exp3_desc: "Co-founded a 3D printing studio (£5k seed) and scaled to 10+ machines within 5 months. Delivered 200+ unit batch orders, film-crew prop assets, and bespoke prototypes. Managed end-to-end operations: machine scheduling, maintenance, supplier quoting, and client delivery.",
    exp4_title: "Design Intern \u00b7 Design 2 Gather",
    exp4_place: "Shanghai, China",
    exp4_desc: "Developed consumer product concepts for small-kitchen scenarios (cooktop, blender station). Facilitated client consultancy sessions covering competitive analysis, value mapping, consumer targeting, and pricing strategy.",
    exp5_title: "Freelance Product Designer \u00b7 Bottloop (Incom Resources)",
    exp5_place: "Beijing / Remote, China",
    exp5_desc: "Co-designed a consumer bag product from brief through to production. Product launched commercially and sold through retail channels.",
    exp6_title: "Product \u0026 VI Designer (Placement) \u00b7 Beijing KSM Technologies",
    exp6_place: "Beijing, China",
    exp6_desc: "Delivered a visual identity refresh, then supported R\u0026D on product redesign. Continued part-time support through 2021 alongside other projects.",
    exp7_title: "BA Product \u0026 Industrial Design",
    exp7_place: "Central Saint Martins, University of the Arts London (UAL) \u00b7 London, UK",
    exp7_desc: "User-centred product development with an industrial placement year (2019\u20132020) across interiors/office systems, visual identity, product R\u0026D, and cookware/furniture design.",
    exp_highlights_title: "Highlights",
    exp_hl1_head: "~40%",
    exp_hl1_body: "Reduced fabrication setup inefficiencies across testing cycles",
    exp_hl2_head: "Design Patent",
    exp_hl2_body: "Chinese Design Patent \u00b7 filter housing, NX Water (KSM Technologies, Dec 2025)",
    exp_hl3_head: "Manufacturing Pack",
    exp_hl3_body: "Full fabrication and delivery package across commercial client engagements",
    exp_hl4_head: "R\u0026D Support",
    exp_hl4_body: "Material and design research embedded in client development processes",
    exp_hl5_head: "End-to-End Delivery",
    exp_hl5_body: "Multiple projects taken from brief to validated prototype or production handover",
    exp_hl6_head: "External Recognition",
    exp_hl6_body: "Poster \u00b7 oral presentation \u00b7 conference paper \u2014 three outputs across international symposia (2025\u20132026)",
    pub1_title: "Trace Terra: Regenerative Systems in Arid Landscapes",
    pub1_venue: "Circular Strategies Symposium, 2025",
    pub2_title: "Trace Terra: Integration of biological soil-crust microbiota into robotically extruded structures for arid contexts",
    pub2_venue: "Biodesign for the Living Futures (Cocoon), 2025 \u2014 paper in publication",
    pub3_title: "Trace Terra: Integration of biological soil-crust microbiota into robotically extruded structures designed for arid environment contexts",
    pub3_venue: "DigitalFUTURES CDRF 2026 \u2014 Masterclass & 8th International Conference on Computational Design and Robotic Fabrication",
    about_p1: "I\u2019m a product and systems designer who turns research into working prototypes. I combine computational design, material testing, and additive manufacturing to build and iterate under real constraints, and to improve the workflows that make projects deliverable.",
    about_p2: "Recent work includes leading robotic extrusion workflows across multiple platforms and reducing setup inefficiencies by ~40% across testing cycles, as well as collaborating with R&D teams to resolve practical engineering issues such as heat, airflow, stability, and usability in product enclosures. I\u2019m at my best when translating complex constraints into clear, testable design decisions and shipping outcomes.",
    about_skills_title: "Tools & Skills",
    skills_g1_label: "Innovation Strategy & Systems",
    skills_g2_label: "Computational & Prototyping",
    skills_g3_label: "Product Delivery",
    skills_cat_robotics: "Robotics & Fabrication",
    skills_cat_simulation: "Simulation & Analysis",
    skills_cat_engineering: "Product Engineering",
    skills_cat_delivery: "Delivery & Operations",
    skills_cat_vis: "Visualisation & Creative Tools",
    tag_bio_design: "Bio-Integrated Design",
    tag_material_research: "Material Research",
    tag_business_strategy: "Business Strategy",
    tag_additive_mfg: "Additive Manufacturing",
    tag_parametric: "Parametric Modelling",
    tag_prototyping: "Prototyping",
    skills_toggle_more: "Show more",
    skills_toggle_less: "Show less",
    proj_view: "View Project \u2192",
    proj_back: "Back to Projects",
    proj_prev: "Previous",
    proj_next: "Next",
    tag_cmf: "CMF Development",
    tag_robotic_3dp: "Robotic 3D Printing (KUKA / WASP)",
    tag_end_effector: "End-Effector Design",
    tag_paste_extrusion: "Paste Extrusion",
    tag_toolpath: "Toolpath Planning",
    tag_env_sim: "Environmental Simulation",
    tag_cfd: "Autodesk CFD",
    tag_dfm_dfa: "DFM / DFA",
    tag_project_mgmt: "Project Management",
    tag_supply_chain: "Supply Chain",
    pub1_type: "Poster",
    pub2_type: "Conference Paper",
    pub3_type: "Under Review",
    contact_email_label: "Email",
    contact_linkedin_label: "LinkedIn",
    contact_text: "Open to product and innovation roles worldwide. I work best at the intersection of computational design, prototyping, and real-world delivery. Remote or relocation friendly.",
  },
  zh: {
    logo: 'formflu<span class="logo-x">X</span>',
    nav_projects: "\u9879\u76ee",
    nav_experience: "\u7ecf\u5386",
    nav_publications: "\u53d1\u8868",
    nav_about: "\u5173\u4e8e",
    nav_contact: "\u8054\u7cfb",
    hero_label: "\u8bbe\u8ba1 \u00b7 \u5de5\u7a0b \u00b7 \u7b56\u7565",
    hero_title: '\u5c06\u590d\u6742\u6311\u6218<br>\u8f6c\u5316\u4e3a<br><span class="hero__accent">\u5e02\u573a\u5c31\u7eea</span>\u7684\u4ea7\u54c1',
    hero_subtitle: "[TRANSLATE] \u4e00\u4f4d\u62e5\u6709\u4e30\u5bcc\u884c\u4e1a\u7ecf\u9a8c\u7684\u8bbe\u8ba1\u5e08\u4e0e\u5de5\u7a0b\u5e08\uff0c\u5c06\u751f\u7269\u96c6\u6210\u521b\u65b0\u4e0e\u5546\u4e1a\u7b56\u7565\u76f8\u7ed3\u5408\u3002",
    hero_cta: "\u67e5\u770b\u9879\u76ee",
    section_projects: "\u7cbe\u9009\u9879\u76ee",
    section_experience: "\u7ecf\u5386",
    section_publications: "论文与会议成果",
    section_about: "\u5173\u4e8e\u6211",
    section_contact: "\u8054\u7cfb\u6211",
    proj1_title: "Trace Terra",
    proj1_desc: "围绕地形响应材料系统开展的计算设计与机器人制造研究——从仿真驱动工作流到全尺寸原型交付。",
    proj2_title: "Hydro-Plantéa 中庭",
    proj2_desc: "为一处活体中庭装置进行生物系统设计——整合水资源管理、植物基础设施与空间原型，跨越复杂的跨学科任务边界。",
    proj3_title: "北京科世迈（KSM）科技",
    proj3_desc: "与北京本土科技制造商开展的 CI 与研发合作——在多年合作中完成品牌系统设计与产品研究交付。",
    proj4_title: "家用净水器",
    proj4_desc: "家用净水设备的产品设计与原型交付——从设计任务书到功能性原型全程推进。项目细节保密。",
    proj5_title: "Mel Studios",
    proj5_desc: "联合创立并运营一家商业3D打印工作室——端到端管理增材制造生产、客户交付与运营工作流。",
    proj6_title: "本科毕业设计",
    proj6_desc: "两个毕业设计项目，分别探索老年人跌倒预防与循环能源系统——均以以人为本与系统层面的设计思维为基础。",
    proj7_title: "Sesame",
    proj7_desc: "本地优先的视觉灵感工具，通过语义搜索、风格简报和3D聚类图学习你的审美偏好。4天内从零构建为原生macOS应用。",
    other_work_title: "其他作品",
    other_work_caption: "小型研究、实验性探索与个人项目。",
    exp1_title: "研发设计师｜科胜美科技（KSM Technologies）",
    exp1_place: "英国 伦敦 / 远程",
    exp1_desc: "主导 NX Water 子品牌产品外观设计，涵盖滤壳、控制面板及整体产品美学。建立 NX Water 品牌视觉识别体系（标志与字体）。持续提供外壳与结构研发支持，延续前期热管理与气流优化研究。滤壳外观已获中国外观设计专利（2025年12月）。",
    exp2_title: "生物融合设计（Bio-Integrated Design）MArch",
    exp2_place: "伦敦大学学院（UCL）巴特莱特建筑学院",
    exp2_desc: "围绕气候韧性系统开展计算设计与材料研发，结合仿真驱动迭代与机器人制造完成原型搭建与验证。",
    exp3_title: "联合创始人｜3D 打印工作室（Mel Studios）",
    exp3_place: "英国 伦敦",
    exp3_desc: "以 £5k 种子资金联合创立 3D 打印工作室，五个月内将设备规模扩展至 10 台以上。交付 200+ 件批量订单、影视道具及定制原型；端到端管理生产运营，包括排期、设备维护、供应商报价与客户交付。",
    exp4_title: "设计实习｜Design 2 Gather",
    exp4_place: "中国 上海",
    exp4_desc: "开展小厨房场景消费产品概念设计（电磁炉、搅拌站）。支持客户咨询工作，内容涵盖竞品分析、价值定位、消费者定向与定价策略。",
    exp5_title: "自由职业产品设计师｜Bottloop（英科姆资源）",
    exp5_place: "中国 北京 / 远程",
    exp5_desc: "从需求简报到量产全程参与消费类背包产品的联合设计。产品已正式上市，并通过零售渠道销售。",
    exp6_title: "产品与视觉形象设计（实习轮岗）｜北京科胜美科技有限公司",
    exp6_place: "中国 北京",
    exp6_desc: "完成企业视觉识别体系更新，后加入研发协作支持产品改版；2021 年在其他项目并行期间继续提供阶段性支持。",
    exp7_title: "产品与工业设计 学士",
    exp7_place: "伦敦艺术大学 中央圣马丁学院（UAL CSM）｜英国 伦敦",
    exp7_desc: "以用户为中心的产品开发训练；含产业实习年（2019–2020），轮岗覆盖办公系统与室内、视觉识别、产品研发，以及厨具与家具设计机构。",
    exp_highlights_title: "亮点成果",
    exp_hl1_head: "约 40%",
    exp_hl1_body: "制造流程迭代降低搭建调试低效环节（多轮测试周期）",
    exp_hl2_head: "外观设计专利",
    exp_hl2_body: "中国外观设计专利 · 滤壳，NX Water（科胜美科技，2025年12月）",
    exp_hl3_head: "制造交付包",
    exp_hl3_body: "面向商业合作交付完整制造与交付方案",
    exp_hl4_head: "研发支持",
    exp_hl4_body: "材料研究与设计咨询嵌入客户研发流程",
    exp_hl5_head: "端到端交付",
    exp_hl5_body: "多个项目从任务书全程推进至验证原型或量产移交",
    exp_hl6_head: "对外成果",
    exp_hl6_body: "海报 \u00b7 口头报告 \u00b7 会议论文\u2014\u2014三项成果发表于国际设计研讨会（2025\u20132026）",
    pub1_title: "Trace Terra: Regenerative Systems in Arid Landscapes",
    pub1_type: "海报录用",
    pub1_venue: "Circular Strategies Symposium（2025）",
    pub2_type: "会议论文",
    pub2_title: "Trace Terra: Integration of biological soil-crust microbiota into robotically extruded structures for arid contexts",
    pub2_venue: "Biodesign for the Living Futures（Cocoon，2025）｜口头报告｜论文发表流程中",
    pub3_type: "审稿中",
    pub3_title: "Trace Terra: Integration of biological soil-crust microbiota into robotically extruded structures designed for arid environment contexts",
    pub3_venue: "DigitalFUTURES CDRF 2026｜已投稿（审稿中）｜Masterclass & 第八届国际会议（Computational Design and Robotic Fabrication）",
    about_p1: "我是一名产品与系统设计师，专注于将研究转化为可运行的原型。我将计算设计、材料测试与增材制造相结合，在真实约束条件下进行构建与迭代，并优化使项目得以交付的工作流程。",
    about_p2: "近期工作包括跨多个平台主导机器人挤出工作流程，在测试周期中将设置低效率降低约40%；同时与研发团队协作，解决产品外壳中散热、气流、稳定性和可用性等实际工程问题。我最擅长将复杂约束转化为清晰、可验证的设计决策，并推动成果落地。",
    about_skills_title: "工具与技能",
    skills_g1_label: "创新策略与系统设计",
    skills_g2_label: "计算设计与原型开发",
    skills_g3_label: "产品落地与交付",
    skills_cat_robotics: "机器人与制造",
    skills_cat_simulation: "仿真与分析",
    skills_cat_engineering: "产品工程",
    skills_cat_delivery: "交付与运营",
    skills_cat_vis: "可视化与创意工具",
    tag_bio_design: "生物融合设计",
    tag_material_research: "材料研究",
    tag_business_strategy: "产品策略",
    tag_additive_mfg: "增材制造",
    tag_parametric: "参数化建模",
    tag_prototyping: "原型制作",
    skills_toggle_more: "展开更多",
    skills_toggle_less: "收起",
    proj_view: "查看项目 \u2192",
    proj_back: "返回项目",
    proj_prev: "上一个",
    proj_next: "下一个",
    tag_cmf: "CMF 设计",
    tag_robotic_3dp: "机械臂 3D 打印（KUKA / WASP）",
    tag_end_effector: "打印端头设计",
    tag_paste_extrusion: "材料挤出",
    tag_toolpath: "工具路径规划",
    tag_env_sim: "环境仿真",
    tag_cfd: "Autodesk CFD（流体仿真）",
    tag_dfm_dfa: "DFM / DFA（可制造与可装配）",
    tag_project_mgmt: "项目管理",
    tag_supply_chain: "供应链",
    contact_email_label: "邮箱",
    contact_linkedin_label: "领英",
    contact_text: "欢迎联系。我面向全球的产品与创新岗位机会，擅长在计算设计、原型制作与实际交付的交汇处工作，支持远程或异地合作。",
  },
  /* DISABLED — re-enable by removing these comment markers
  es: {
    logo: 'formflu<span class="logo-x">X</span>',
    nav_projects: "Proyectos",
    nav_experience: "Experiencia",
    nav_publications: "Publicaciones",
    nav_about: "Acerca de",
    nav_contact: "Contacto",
    hero_label: "Dise\u00f1o \u00b7 Ingenier\u00eda \u00b7 Estrategia",
    hero_title: 'Convirtiendo desaf\u00edos<br>complejos en productos<br><span class="hero__accent">listos para el mercado</span>',
    hero_subtitle: "[TRANSLATE]",
    hero_cta: "Ver Proyectos",
    section_projects: "Proyectos Seleccionados",
    section_experience: "Experiencia",
    section_publications: "Publicaciones",
    section_about: "Acerca de",
    section_contact: "Contacto",
    proj1_title: "[TRANSLATE]",
    proj1_desc: "[TRANSLATE]",
    proj2_title: "[TRANSLATE]",
    proj2_desc: "[TRANSLATE]",
    proj3_title: "[TRANSLATE]",
    proj3_desc: "[TRANSLATE]",
    proj4_title: "[TRANSLATE]",
    proj4_desc: "[TRANSLATE]",
    exp1_title: "[TRANSLATE]",
    exp1_place: "University College London / Bartlett School of Architecture",
    exp1_desc: "[TRANSLATE]",
    exp2_title: "[TRANSLATE]",
    exp2_place: "[TRANSLATE]",
    exp2_desc: "[TRANSLATE]",
    exp3_title: "[TRANSLATE]",
    exp3_place: "[TRANSLATE]",
    exp3_desc: "[TRANSLATE]",
    exp4_title: "[TRANSLATE]",
    exp4_place: "[TRANSLATE]",
    exp4_desc: "[TRANSLATE]",
    pub1_title: "Trace Terra: Regenerative Systems in Arid Landscapes",
    pub1_venue: "Circular Strategies Symposium, 2025",
    pub2_title: "Trace Terra: Integration of biological soil-crust microbiota into robotically extruded structures for arid contexts",
    pub2_venue: "Biodesign for the Living Futures (Cocoon), 2025 \u2014 paper in publication",
    pub3_title: "Trace Terra: Integration of biological soil-crust microbiota into robotically extruded structures designed for arid environment contexts",
    pub3_venue: "DigitalFUTURES CDRF 2026 \u2014 Masterclass & 8th International Conference on Computational Design and Robotic Fabrication",
    about_p1: "Soy dise\u00f1ador de productos y sistemas que convierte la investigaci\u00f3n en prototipos funcionales. Combino dise\u00f1o computacional, pruebas de materiales y fabricaci\u00f3n aditiva para construir e iterar bajo restricciones reales, y para mejorar los flujos de trabajo que hacen posible la entrega de proyectos.",
    about_p2: "El trabajo reciente incluye liderar flujos de trabajo de extrusi\u00f3n rob\u00f3tica en m\u00faltiples plataformas y reducir las ineficiencias de configuraci\u00f3n en un ~40\u00a0% a lo largo de los ciclos de prueba, adem\u00e1s de colaborar con equipos de I+D para resolver problemas de ingenier\u00eda pr\u00e1cticos como calor, flujo de aire, estabilidad y usabilidad en c\u00e1rcasas de productos. Doy lo mejor de m\u00ed cuando traduzco restricciones complejas en decisiones de dise\u00f1o claras y verificables, y cuando entrego resultados concretos.",
    about_skills_title: "Herramientas y Habilidades",
    contact_text: "[TRANSLATE]",
  },
  de: {
    logo: 'formflu<span class="logo-x">X</span>',
    nav_projects: "Projekte",
    nav_experience: "Erfahrung",
    nav_publications: "Publikationen",
    nav_about: "\u00dcber mich",
    nav_contact: "Kontakt",
    hero_label: "Design \u00b7 Engineering \u00b7 Strategie",
    hero_title: 'Komplexe Herausforderungen<br>in <span class="hero__accent">marktreife</span><br>Produkte verwandeln',
    hero_subtitle: "[TRANSLATE]",
    hero_cta: "Projekte ansehen",
    section_projects: "Ausgew\u00e4hlte Projekte",
    section_experience: "Erfahrung",
    section_publications: "Publikationen",
    section_about: "\u00dcber mich",
    section_contact: "Kontakt",
    proj1_title: "[TRANSLATE]",
    proj1_desc: "[TRANSLATE]",
    proj2_title: "[TRANSLATE]",
    proj2_desc: "[TRANSLATE]",
    proj3_title: "[TRANSLATE]",
    proj3_desc: "[TRANSLATE]",
    proj4_title: "[TRANSLATE]",
    proj4_desc: "[TRANSLATE]",
    exp1_title: "[TRANSLATE]",
    exp1_place: "University College London / Bartlett School of Architecture",
    exp1_desc: "[TRANSLATE]",
    exp2_title: "[TRANSLATE]",
    exp2_place: "[TRANSLATE]",
    exp2_desc: "[TRANSLATE]",
    exp3_title: "[TRANSLATE]",
    exp3_place: "[TRANSLATE]",
    exp3_desc: "[TRANSLATE]",
    exp4_title: "[TRANSLATE]",
    exp4_place: "[TRANSLATE]",
    exp4_desc: "[TRANSLATE]",
    pub1_title: "Trace Terra: Regenerative Systems in Arid Landscapes",
    pub1_venue: "Circular Strategies Symposium, 2025",
    pub2_title: "Trace Terra: Integration of biological soil-crust microbiota into robotically extruded structures for arid contexts",
    pub2_venue: "Biodesign for the Living Futures (Cocoon), 2025 \u2014 paper in publication",
    pub3_title: "Trace Terra: Integration of biological soil-crust microbiota into robotically extruded structures designed for arid environment contexts",
    pub3_venue: "DigitalFUTURES CDRF 2026 \u2014 Masterclass & 8th International Conference on Computational Design and Robotic Fabrication",
    about_p1: "Ich bin ein Produkt- und Systemdesigner, der Forschung in funktionierende Prototypen \u00fcberf\u00fchrt. Ich kombiniere Computational Design, Materialtests und additive Fertigung, um unter realen Bedingungen zu bauen und zu iterieren sowie die Abl\u00e4ufe zu verbessern, die Projekte lieferbar machen.",
    about_p2: "Zu meinen j\u00fcngsten Projekten geh\u00f6ren die Leitung von Roboter-Extrusionsworkflows auf mehreren Plattformen und die Reduzierung von Einrichtungsineffizienzen um ~40\u00a0% \u00fcber Testzyklen hinweg, sowie die Zusammenarbeit mit F&E-Teams zur L\u00f6sung praktischer Ingenieurprobleme wie W\u00e4rme, Luftstrom, Stabilit\u00e4t und Benutzerfreundlichkeit in Produktgeh\u00e4usen. Ich bin am st\u00e4rksten, wenn ich komplexe Anforderungen in klare, \u00fcberpr\u00fcfbare Designentscheidungen \u00fcbersetze und Ergebnisse liefere.",
    about_skills_title: "Werkzeuge & F\u00e4higkeiten",
    contact_text: "[TRANSLATE]",
  },
  */ // END DISABLED
};

let currentLang = localStorage.getItem('lang') || 'en';

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  const dict = translations[lang];
  if (!dict) return;

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (dict[key] !== undefined) {
      el.innerHTML = dict[key];
    }
  });

  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : lang;
  const langLabels = { en: 'EN', zh: '中文', es: 'ES', de: 'DE' };
  document.getElementById('lang-current').textContent = langLabels[lang] || lang.toUpperCase();

  document.querySelectorAll('#lang-menu button').forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
  });
}

// Language switcher dropdown
const langBtn = document.getElementById('lang-btn');
const langMenu = document.getElementById('lang-menu');

langBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  langMenu.classList.toggle('open');
});

langMenu.querySelectorAll('button').forEach((btn) => {
  btn.addEventListener('click', () => {
    setLanguage(btn.getAttribute('data-lang'));
    langMenu.classList.remove('open');
  });
});

document.addEventListener('click', () => {
  langMenu.classList.remove('open');
});

if (currentLang !== 'en') {
  setLanguage(currentLang);
}

// ============================================
// FRAMER: particle-system
// Flow-field particles with occasional shape formation
// ============================================
const canvas = document.getElementById('hero-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let mouse = { x: null, y: null };
let baseColor = { r: 168, g: 213, b: 162 };
let animationId;
let time = 0;
const PARTICLE_COUNT = 600;

function updateParticleColors() {
  const theme = document.documentElement.getAttribute('data-theme');
  let isDark;
  if (theme === 'auto') {
    isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  } else {
    isDark = theme === 'dark' || (!theme);
  }
  baseColor = isDark
    ? { r: 168, g: 213, b: 162 }
    : { r: 54, g: 120, b: 46 };
}

window.updateParticleColors = updateParticleColors;

function resizeCanvas() {
  const hero = document.getElementById('hero');
  canvas.width = hero.offsetWidth;
  canvas.height = hero.offsetHeight;
}

// ---- Flow field (multi-octave sine-based noise) ----
function flowAngle(x, y, t) {
  const s = 0.003;
  const a1 = Math.sin(x * s + t * 0.4) * Math.cos(y * s * 0.8 + t * 0.3);
  const a2 = Math.sin(x * s * 1.7 - t * 0.25 + y * s * 0.6) * 0.5;
  const a3 = Math.cos(y * s * 2.1 + t * 0.15 + x * s * 0.4) * 0.3;
  return (a1 + a2 + a3) * Math.PI * 2;
}

function flowStrength(x, y, t) {
  const s = 0.002;
  return 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(x * s * 1.3 + y * s * 0.9 + t * 0.2));
}

// ---- Shape definitions (profession-related silhouettes) ----
// Each shape generates ~200-300 points for clear visibility
// Helper: interpolate dense points along a line
function linePts(x1, y1, x2, y2, n) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    pts.push({ x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t });
  }
  return pts;
}
// Helper: circle points
function circlePts(cx, cy, r, n) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
  }
  return pts;
}

const shapeLibrary = [
  // Gear / cog (engineering)
  { name: 'gear', points: (() => {
    const pts = [];
    const cx = 0.5, cy = 0.5;
    const teeth = 10, outerR = 0.38, innerR = 0.28;
    // Gear outline with dense sampling
    for (let i = 0; i < teeth * 2; i++) {
      const a = (i / (teeth * 2)) * Math.PI * 2;
      const nextA = ((i + 1) / (teeth * 2)) * Math.PI * 2;
      const r = i % 2 === 0 ? outerR : innerR;
      const nextR = (i + 1) % 2 === 0 ? outerR : innerR;
      for (let j = 0; j <= 10; j++) {
        const t = j / 10;
        const ca = a * (1 - t) + nextA * t;
        const cr = r * (1 - t) + nextR * t;
        pts.push({ x: cx + Math.cos(ca) * cr, y: cy + Math.sin(ca) * cr });
      }
    }
    // Center hole
    pts.push(...circlePts(cx, cy, 0.1, 30));
    // Spokes
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      pts.push(...linePts(cx + Math.cos(a) * 0.1, cy + Math.sin(a) * 0.1, cx + Math.cos(a) * 0.26, cy + Math.sin(a) * 0.26, 8));
    }
    return pts;
  })()},

  // Hexagonal molecule (bio-design)
  { name: 'molecule', points: (() => {
    const pts = [];
    const cx = 0.5, cy = 0.5, r = 0.2;
    // Central hexagon — dense
    for (let i = 0; i < 6; i++) {
      const a1 = (i / 6) * Math.PI * 2 - Math.PI / 6;
      const a2 = ((i + 1) / 6) * Math.PI * 2 - Math.PI / 6;
      pts.push(...linePts(cx + Math.cos(a1) * r, cy + Math.sin(a1) * r, cx + Math.cos(a2) * r, cy + Math.sin(a2) * r, 15));
    }
    // 6 branches with terminal circles
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 - Math.PI / 6;
      const nx = cx + Math.cos(a) * r;
      const ny = cy + Math.sin(a) * r;
      const ox = cx + Math.cos(a) * r * 2;
      const oy = cy + Math.sin(a) * r * 2;
      pts.push(...linePts(nx, ny, ox, oy, 12));
      pts.push(...circlePts(ox, oy, 0.05, 16));
    }
    // Second ring of hexagons at each branch tip
    for (let i = 0; i < 3; i++) {
      const a = (i * 2 / 6) * Math.PI * 2 - Math.PI / 6;
      const bx = cx + Math.cos(a) * r * 2;
      const by = cy + Math.sin(a) * r * 2;
      const sr = r * 0.6;
      for (let j = 0; j < 6; j++) {
        const a1 = (j / 6) * Math.PI * 2;
        const a2 = ((j + 1) / 6) * Math.PI * 2;
        pts.push(...linePts(bx + Math.cos(a1) * sr, by + Math.sin(a1) * sr, bx + Math.cos(a2) * sr, by + Math.sin(a2) * sr, 6));
      }
    }
    return pts;
  })()},

  // Isometric cube (3D printing)
  { name: 'cube', points: (() => {
    const pts = [];
    const cx = 0.5, cy = 0.5, s = 0.28;
    const front = [
      { x: cx, y: cy + s * 1.15 },
      { x: cx - s, y: cy + s * 0.35 },
      { x: cx, y: cy - s * 0.45 },
      { x: cx + s, y: cy + s * 0.35 },
    ];
    const top = [
      { x: cx, y: cy - s * 0.45 },
      { x: cx - s, y: cy - s * 0.45 - s * 0.6 },
      { x: cx, y: cy - s * 0.45 - s * 1.2 },
      { x: cx + s, y: cy - s * 0.45 - s * 0.6 },
    ];
    // All visible edges — dense
    const edges = [
      [front[0], front[1]], [front[1], front[2]], [front[2], front[3]], [front[3], front[0]],
      [top[0], top[1]], [top[1], top[2]], [top[2], top[3]], [top[3], top[0]],
      [front[1], top[1]], [front[3], top[3]],
    ];
    edges.forEach(([a, b]) => {
      pts.push(...linePts(a.x, a.y, b.x, b.y, 25));
    });
    return pts;
  })()},

  // Leaf (bio-integrated design)
  { name: 'leaf', points: (() => {
    const pts = [];
    const cx = 0.5, cy = 0.5;
    // Leaf outline — cardioid-like shape, dense
    for (let i = 0; i <= 120; i++) {
      const t = (i / 120) * Math.PI * 2;
      const r = 0.3 * (1 + 0.2 * Math.cos(t)) * Math.abs(Math.sin(t / 2));
      pts.push({ x: cx + r * Math.cos(t - 0.3), y: cy - r * Math.sin(t - 0.3) });
    }
    // Central vein
    pts.push(...linePts(cx - 0.08, cy + 0.08, cx + 0.22, cy - 0.18, 25));
    // Side veins
    for (let v = 0; v < 6; v++) {
      const t = (v + 1) / 7;
      const sx = cx - 0.08 + t * 0.3;
      const sy = cy + 0.08 - t * 0.26;
      const dir = v % 2 === 0 ? 1 : -1;
      pts.push(...linePts(sx, sy, sx + 0.08 * dir, sy - 0.06, 8));
    }
    return pts;
  })()},

  // Pen nib / design tool
  { name: 'pen', points: (() => {
    const pts = [];
    const a = -Math.PI / 5;
    const c = Math.cos(a), s = Math.sin(a);
    // Pen body
    const len = 0.6, w = 0.05;
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      pts.push({ x: 0.5 + t * len * c - w * s, y: 0.5 + t * len * s + w * c });
      pts.push({ x: 0.5 + t * len * c + w * s, y: 0.5 + t * len * s - w * c });
    }
    // Nib tip
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const tipW = w * (1 - t);
      pts.push({ x: 0.5 - t * 0.1 * c - tipW * s, y: 0.5 - t * 0.1 * s + tipW * c });
      pts.push({ x: 0.5 - t * 0.1 * c + tipW * s, y: 0.5 - t * 0.1 * s - tipW * c });
    }
    // Cap end
    pts.push(...linePts(0.5 + len * c - w * s, 0.5 + len * s + w * c, 0.5 + len * c + w * s, 0.5 + len * s - w * c, 12));
    return pts;
  })()},

  // DNA double helix (bio-science)
  { name: 'dna', points: (() => {
    const pts = [];
    const cx = 0.5, cy = 0.5;
    const amplitude = 0.15, turns = 2.5;
    for (let i = 0; i <= 150; i++) {
      const t = i / 150;
      const angle = t * turns * Math.PI * 2;
      // Two strands
      pts.push({ x: cx + Math.sin(angle) * amplitude, y: cy - 0.4 + t * 0.8 });
      pts.push({ x: cx - Math.sin(angle) * amplitude, y: cy - 0.4 + t * 0.8 });
    }
    // Rungs connecting strands
    for (let i = 0; i < 12; i++) {
      const t = (i + 0.5) / 12;
      const y = cy - 0.4 + t * 0.8;
      const angle = t * turns * Math.PI * 2;
      const x1 = cx + Math.sin(angle) * amplitude;
      const x2 = cx - Math.sin(angle) * amplitude;
      pts.push(...linePts(x1, y, x2, y, 6));
    }
    return pts;
  })()},
];

// ---- Shape formation system ----
let currentShape = null;
let shapeTimer = 0;
let shapePhase = 'idle'; // idle, forming, holding, dissolving
const SHAPE_IDLE_MIN = 480;    // ~8s at 60fps
const SHAPE_IDLE_MAX = 900;    // ~15s
const SHAPE_FORM_FRAMES = 180; // 3s to form
const SHAPE_HOLD_FRAMES = 300; // 5s holding
const SHAPE_DISSOLVE_FRAMES = 150; // 2.5s to dissolve
let nextShapeTime = Math.floor(Math.random() * 180) + 180; // first shape at ~3-6s
let shapeTargets = []; // target positions for shape-forming particles
let shapeParticleIndices = []; // which particles participate

function pickNextShape() {
  const shape = shapeLibrary[Math.floor(Math.random() * shapeLibrary.length)];
  // Place shape on the right half of the canvas (away from hero text)
  const offsetX = (0.55 + Math.random() * 0.2) * canvas.width;
  const offsetY = (0.3 + Math.random() * 0.3) * canvas.height;
  const scale = Math.min(canvas.width, canvas.height) * (0.5 + Math.random() * 0.2);

  shapeTargets = shape.points.map(p => ({
    x: offsetX + (p.x - 0.5) * scale,
    y: offsetY + (p.y - 0.5) * scale,
  }));

  // Cap targets to half our particles (leave some flowing freely)
  const maxTargets = Math.min(shapeTargets.length, Math.floor(PARTICLE_COUNT * 0.5));
  if (shapeTargets.length > maxTargets) {
    // Evenly sample
    const step = shapeTargets.length / maxTargets;
    const sampled = [];
    for (let i = 0; i < maxTargets; i++) {
      sampled.push(shapeTargets[Math.floor(i * step)]);
    }
    shapeTargets = sampled;
  }

  // Pick closest particles to each target point
  const usedIndices = new Set();
  shapeParticleIndices = [];
  shapeTargets.forEach(target => {
    let bestIdx = -1, bestDist = Infinity;
    for (let i = 0; i < particles.length; i++) {
      if (usedIndices.has(i)) continue;
      const dx = particles[i].x - target.x;
      const dy = particles[i].y - target.y;
      const d = dx * dx + dy * dy;
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    if (bestIdx >= 0) {
      usedIndices.add(bestIdx);
      shapeParticleIndices.push(bestIdx);
    }
  });

  currentShape = shape;
  shapePhase = 'forming';
  shapeTimer = 0;
}

function updateShapeSystem() {
  if (shapePhase === 'idle') {
    shapeTimer++;
    if (shapeTimer >= nextShapeTime) {
      pickNextShape();
    }
    return 0;
  }

  shapeTimer++;
  let influence = 0;

  if (shapePhase === 'forming') {
    influence = Math.min(1, shapeTimer / SHAPE_FORM_FRAMES);
    influence = influence * influence * (3 - 2 * influence); // smoothstep
    if (shapeTimer >= SHAPE_FORM_FRAMES) {
      shapePhase = 'holding';
      shapeTimer = 0;
    }
  } else if (shapePhase === 'holding') {
    influence = 1;
    if (shapeTimer >= SHAPE_HOLD_FRAMES) {
      shapePhase = 'dissolving';
      shapeTimer = 0;
    }
  } else if (shapePhase === 'dissolving') {
    influence = 1 - Math.min(1, shapeTimer / SHAPE_DISSOLVE_FRAMES);
    influence = influence * influence;
    if (shapeTimer >= SHAPE_DISSOLVE_FRAMES) {
      shapePhase = 'idle';
      shapeTimer = 0;
      nextShapeTime = SHAPE_IDLE_MIN + Math.floor(Math.random() * (SHAPE_IDLE_MAX - SHAPE_IDLE_MIN));
      currentShape = null;
      shapeParticleIndices = [];
      shapeTargets = [];
    }
  }

  return influence;
}

// ---- Particle class ----
class Particle {
  constructor() {
    this.spawn();
  }

  spawn() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = 0;
    this.vy = 0;

    // Depth layer: 0 = far/dim/small, 1 = near/bright/large
    this.depth = Math.random();

    // Size — boosted from previous too-faded values
    this.baseSize = this.depth < 0.3
      ? Math.random() * 0.6 + 0.3    // far: 0.3-0.9
      : this.depth < 0.7
        ? Math.random() * 0.8 + 0.5  // mid: 0.5-1.3
        : Math.random() * 1.2 + 0.7; // near: 0.7-1.9

    this.size = this.baseSize;

    // Opacity — more visible now
    this.baseOpacity = this.depth < 0.3
      ? Math.random() * 0.12 + 0.04   // far: 0.04-0.16
      : this.depth < 0.7
        ? Math.random() * 0.20 + 0.08 // mid: 0.08-0.28
        : Math.random() * 0.30 + 0.12; // near: 0.12-0.42

    this.opacity = this.baseOpacity;

    this.colorShift = (Math.random() - 0.5) * 30;

    this.pulsePhase = Math.random() * Math.PI * 2;
    this.pulseSpeed = Math.random() * 0.02 + 0.005;

    this.life = 0;
    this.maxLife = Math.random() * 800 + 400;
  }

  update(t, shapeTarget, shapeInfluence) {
    this.life++;

    // Fade in/out
    const lifeFrac = this.life / this.maxLife;
    let lifeFade = 1;
    if (lifeFrac < 0.05) lifeFade = lifeFrac / 0.05;
    else if (lifeFrac > 0.9) lifeFade = (1 - lifeFrac) / 0.1;
    this.opacity = this.baseOpacity * Math.max(0, lifeFade);

    // Respawn when life ends
    if (this.life >= this.maxLife) {
      this.spawn();
      return;
    }

    // Flow field force (reduced when forming a shape)
    const angle = flowAngle(this.x, this.y, t);
    const strength = flowStrength(this.x, this.y, t);
    const flowSpeed = (0.3 + this.depth * 0.7) * strength;
    const flowMult = shapeTarget && shapeInfluence > 0 ? 0.03 * (1 - shapeInfluence * 0.8) : 0.03;

    this.vx += Math.cos(angle) * flowSpeed * flowMult;
    this.vy += Math.sin(angle) * flowSpeed * flowMult;

    // Shape attraction — direct position lerp for reliable convergence
    if (shapeTarget && shapeInfluence > 0) {
      const lerpStrength = shapeInfluence * 0.06; // 6% per frame at full influence
      this.x += (shapeTarget.x - this.x) * lerpStrength;
      this.y += (shapeTarget.y - this.y) * lerpStrength;
      // Dampen velocity so flow doesn't fight the shape
      this.vx *= (1 - shapeInfluence * 0.7);
      this.vy *= (1 - shapeInfluence * 0.7);
      // Gentle drift around target when close
      const dx = shapeTarget.x - this.x;
      const dy = shapeTarget.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 10 && shapeInfluence > 0.8) {
        this.vx += (-dy / (dist + 1)) * 0.01;
        this.vy += (dx / (dist + 1)) * 0.01;
      }
      // Boost opacity & size when forming shape
      this.opacity = Math.min(0.7, this.opacity + shapeInfluence * 0.25);
      this.size = this.size + shapeInfluence * 0.4;
    }

    // Mouse interaction
    if (mouse.x !== null) {
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 200 && dist > 5) {
        const force = (200 - dist) / 200 * 0.03;
        this.vx += (-dy / dist) * force + dx / dist * force * 0.3;
        this.vy += (dx / dist) * force + dy / dist * force * 0.3;
      }
    }

    // Damping
    const damp = 0.92 + this.depth * 0.05;
    this.vx *= damp;
    this.vy *= damp;

    // Speed limit
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    const maxSpeed = 0.6 + this.depth * 0.4;
    if (speed > maxSpeed) {
      this.vx *= maxSpeed / speed;
      this.vy *= maxSpeed / speed;
    }

    this.x += this.vx;
    this.y += this.vy;

    // Pulse size
    this.pulsePhase += this.pulseSpeed;
    this.size = this.baseSize + Math.sin(this.pulsePhase) * this.baseSize * 0.3;

    // Wrap edges
    const pad = 30;
    if (this.x < -pad) this.x = canvas.width + pad;
    if (this.x > canvas.width + pad) this.x = -pad;
    if (this.y < -pad) this.y = canvas.height + pad;
    if (this.y > canvas.height + pad) this.y = -pad;
  }

  draw() {
    if (this.opacity <= 0.01) return;

    const r = Math.min(255, Math.max(0, baseColor.r + this.colorShift));
    const g = Math.min(255, Math.max(0, baseColor.g + this.colorShift * 0.5));
    const b = Math.min(255, Math.max(0, baseColor.b - this.colorShift * 0.3));

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${this.opacity})`;
    ctx.fill();
  }
}

// ---- Init & animate ----
function initParticles() {
  particles = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
  }
}

// Build a reverse lookup: particleIndex → targetIndex
let shapeParticleMap = new Map();

function rebuildShapeMap() {
  shapeParticleMap = new Map();
  shapeParticleIndices.forEach((pIdx, tIdx) => {
    shapeParticleMap.set(pIdx, tIdx);
  });
}

// Patch pickNextShape to rebuild map
const _origPickNextShape = pickNextShape;
pickNextShape = function() {
  _origPickNextShape();
  rebuildShapeMap();
};

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  time += 0.005;

  const shapeInfluence = updateShapeSystem();

  for (let i = 0; i < particles.length; i++) {
    const tIdx = shapeParticleMap.get(i);
    const target = tIdx !== undefined ? shapeTargets[tIdx] : null;
    particles[i].update(time, target, shapeInfluence);
    particles[i].draw();
  }

  animationId = requestAnimationFrame(animate);
}

// Init
updateParticleColors();
resizeCanvas();
initParticles();
animate();

// Mouse tracking
const heroSection = document.getElementById('hero');
heroSection.addEventListener('mousemove', (e) => {
  const rect = heroSection.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
});

heroSection.addEventListener('mouseleave', () => {
  mouse.x = null;
  mouse.y = null;
});

window.addEventListener('resize', () => {
  resizeCanvas();
  initParticles();
  // Reset shape if in progress
  shapePhase = 'idle';
  shapeTimer = 0;
  nextShapeTime = SHAPE_IDLE_MIN + Math.floor(Math.random() * (SHAPE_IDLE_MAX - SHAPE_IDLE_MIN));
});

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (document.documentElement.getAttribute('data-theme') === 'auto') {
    updateParticleColors();
  }
});

// ============================================
// Scroll-triggered fade-in animations
// ============================================
const fadeElements = document.querySelectorAll('.fade-in');

const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
});

fadeElements.forEach((el) => fadeObserver.observe(el));

// ============================================
// Nav scroll border
// ============================================
const nav = document.getElementById('nav');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    nav.classList.add('nav--scrolled');
  } else {
    nav.classList.remove('nav--scrolled');
  }
}, { passive: true });

// ============================================
// Mobile nav toggle
// ============================================
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');

navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('active');
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('active');
    navLinks.classList.remove('open');
  });
});

// ============================================
// Skills toggle
// ============================================
const skillsToggle = document.getElementById('skills-toggle');
const skillsExpanded = document.getElementById('skills-expanded');

if (skillsToggle && skillsExpanded) {
  skillsToggle.addEventListener('click', () => {
    const isOpen = skillsToggle.getAttribute('aria-expanded') === 'true';
    skillsToggle.setAttribute('aria-expanded', String(!isOpen));
    skillsExpanded.setAttribute('aria-hidden', String(isOpen));
    skillsExpanded.classList.toggle('open', !isOpen);
  });
}

// ============================================
// Other Work expandable cards
// ============================================
document.querySelectorAll('.other-card--expandable').forEach((card) => {
  card.addEventListener('click', () => {
    card.classList.toggle('other-card--expanded');
  });
});

// ============================================
// Project detail panel
// ============================================
const projectData = {
  1: {
    en: {
      title: 'Trace Terra',
      tags: ['Computational Design', 'Robotic Fabrication', 'Material R&D'],
      meta: [
        { label: 'Year',  value: '2024\u20132025' },
        { label: 'Role',  value: 'Design Researcher & Fabrication Lead' },
        { label: 'Type',  value: 'Academic Research' },
      ],
      sections: [
        { heading: 'Overview',
          body: 'Computational design and robotic fabrication research into terrain-responsive material systems \u2014 investigating how landscape geometry and surface data can be translated into fabricated form at architectural scale.' },
        { heading: 'Context',
          body: 'The project sits at the intersection of computational design and physical making. The research question centred on how topographic and environmental data could directly inform fabrication parameters, producing outcomes that are both functionally responsive and materially honest.' },
        { heading: 'Process',
          body: 'Grasshopper-based simulation workflows to process terrain data and generate toolpath geometry. Robotic fabrication on KUKA and WASP platforms using clay paste extrusion. Iterative material testing across mix ratios, layer heights, and deposition speeds.' },
        { heading: 'Outcome',
          body: 'A series of fabricated panels demonstrating terrain-to-form translation at scale. Validated end-to-end workflow from GIS data input through to robotic output. Work contributed to publications presented at Circular Strategies Symposium (2025) and Biodesign for the Living Futures (Cocoon, 2025).' },
      ],
    },
    zh: {
      title: 'Trace Terra',
      tags: ['计算设计', '机器人制造', '材料研发'],
      meta: [
        { label: '年份', value: '2024\u20132025' },
        { label: '角色', value: '设计研究员与制造负责人' },
        { label: '类型', value: '学术研究' },
      ],
      sections: [
        { heading: '项目概述',
          body: '围绕地形响应材料系统开展的计算设计与机器人制造研究——探索如何将景观几何形态与地表数据转化为建筑尺度的实体制造形式。' },
        { heading: '背景',
          body: '项目立于计算设计与实体制造的交叉地带，核心研究问题在于：如何将地形数据与环境数据直接转化为制造参数，使成果在功能响应性与材料真实性上得以统一。' },
        { heading: '过程',
          body: '基于 Grasshopper 的仿真工作流处理地形数据并生成刀具路径几何；在 KUKA 与 WASP 平台上进行粘土浆料挤出的机器人制造；跨配合比、层高与沉积速度的迭代材料测试。' },
        { heading: '成果',
          body: '完成一系列展示地形到形式转化的制造面板；验证从 GIS 数据输入到机器人输出的端到端完整工作流；研究成果发表于 Circular Strategies Symposium（2025）和 Biodesign for the Living Futures（Cocoon，2025）。' },
      ],
    },
  },
  2: {
    en: {
      title: 'Hydro-Plantéa Atrium',
      tags: ['Bio-Systems', 'Prototyping', 'Systems Design'],
      meta: [
        { label: 'Year',  value: '2023\u20132024' },
        { label: 'Role',  value: 'Systems Designer & Prototyping Lead' },
        { label: 'Type',  value: 'Installation Design' },
      ],
      sections: [
        { heading: 'Overview',
          body: 'Bio-system design for a living atrium installation \u2014 integrating water circulation infrastructure, planting systems, and spatial structure across a complex multi-discipline brief.' },
        { heading: 'Context',
          body: 'The brief required a self-sustaining living installation within a constrained architectural volume. The challenge was coordinating plant biology, hydraulic engineering, and spatial design into a coherent system that could be built and maintained at scale.' },
        { heading: 'Process',
          body: 'System mapping to identify water, nutrient, and light interdependencies. Physical prototyping of modular planting units and water distribution nodes. Structural coordination with the architectural envelope. Plant species selection for growth rate, root behaviour, and spatial coverage.' },
        { heading: 'Outcome',
          body: 'A full system specification for a living atrium installation. Validated modular planting unit prototypes. Integrated water circulation design capable of maintaining plant health with minimal external intervention.' },
      ],
    },
    zh: {
      title: 'Hydro-Plantéa 中庭',
      tags: ['生物系统', '原型制作', '系统设计'],
      meta: [
        { label: '年份', value: '2023\u20132024' },
        { label: '角色', value: '系统设计师与原型负责人' },
        { label: '类型', value: '装置设计' },
      ],
      sections: [
        { heading: '项目概述',
          body: '为一处活体中庭装置进行生物系统设计——在复杂的跨学科任务框架下，整合水循环基础设施、植物系统与空间结构。' },
        { heading: '背景',
          body: '任务要求在有限的建筑体量内建立一套自维持的活体装置。核心挑战在于将植物生物学、液压工程与空间设计协调整合为一个可规模化建设与维护的完整系统。' },
        { heading: '过程',
          body: '系统图谱梳理，识别水分、养分与光照的相互依存关系；模块化种植单元与配水节点的实体原型制作；与建筑围护结构的结构协调；基于生长速率、根系行为与空间覆盖的植物品种筛选。' },
        { heading: '成果',
          body: '完成活体中庭装置的完整系统规格文档；验证模块化种植单元原型；设计集成水循环方案，以最低外部干预维持植物健康生长。' },
      ],
    },
  },
  3: {
    en: {
      title: 'Beijing KSM Technologies',
      tags: ['Product Design', 'CI/VI System', 'R&D Collaboration'],
      meta: [
        { label: 'Year',  value: '2022\u20132024' },
        { label: 'Role',  value: 'Design Consultant' },
        { label: 'Type',  value: 'Commercial Engagement' },
      ],
      sections: [
        { heading: 'Overview',
          body: 'A multi-year design collaboration with a Beijing-based technology manufacturer \u2014 covering corporate identity system development, product R&D support, and design strategy across multiple product categories.' },
        { heading: 'Context',
          body: 'KSM required design capability to support rapid product development and brand repositioning. The engagement spanned CI/VI system design for internal and external communications, product design input on new hardware categories, and collaborative R&D on material and manufacturing decisions.' },
        { heading: 'Process',
          body: 'Brand audit and CI system development across print, digital, and environmental applications. Product design consultation on form, CMF, and manufacturing feasibility. R&D collaboration with internal engineering teams on material selection and prototype review.' },
        { heading: 'Outcome',
          body: 'Delivered a cohesive CI/VI system adopted across the company\u2019s product and communications output. Design input contributed to two new product categories brought to market. Ongoing R&D collaboration embedded within the product development process.' },
      ],
    },
    zh: {
      title: '北京科世迈（KSM）科技',
      tags: ['产品设计', '品牌视觉系统', '研发合作'],
      meta: [
        { label: '年份', value: '2022\u20132024' },
        { label: '角色', value: '设计顾问' },
        { label: '类型', value: '商业合作项目' },
      ],
      sections: [
        { heading: '项目概述',
          body: '与北京本土科技制造商开展的多年设计合作——涵盖企业形象系统建设、产品研发支持，以及跨多个产品品类的设计策略。' },
        { heading: '背景',
          body: 'KSM 需要设计能力支撑其快速产品研发与品牌重新定位。合作范围覆盖内外部传播的 CI/VI 系统设计、新硬件品类的产品设计介入，以及材料与制造决策的协同研发。' },
        { heading: '过程',
          body: '品牌审计与 CI 系统开发，覆盖印刷、数字与环境应用场景；就形态、CMF 与制造可行性进行产品设计咨询；与内部工程团队协作开展材料筛选与原型审查。' },
        { heading: '成果',
          body: '交付统一的 CI/VI 系统，已在公司产品与传播全线落地应用；设计输入助力两个新产品品类成功上市；研发合作持续嵌入产品开发流程。' },
      ],
    },
  },
  4: {
    en: {
      title: 'Household Water Purifier',
      tags: ['Product Design', 'Prototype Delivery', 'Confidential'],
      meta: [
        { label: 'Year',  value: '2023' },
        { label: 'Role',  value: 'Product Designer' },
        { label: 'Type',  value: 'Commercial Product' },
      ],
      sections: [
        { heading: 'Overview',
          body: 'Product design and prototype delivery for a household water purification device \u2014 from brief through to functional prototype. Full project details remain confidential.' },
        { heading: 'Scope',
          body: 'End-to-end product design engagement covering user research, concept development, industrial design, CMF specification, and prototype delivery. The project was delivered within a defined commercial timeline and manufacturing budget.' },
        { heading: 'Deliverables',
          body: 'Functional prototype validated against the product specification. Full design documentation for manufacturing handover. Tooling-ready CAD files and CMF spec sheets.' },
      ],
    },
    zh: {
      title: '家用净水器',
      tags: ['产品设计', '原型交付', '保密项目'],
      meta: [
        { label: '年份', value: '2023' },
        { label: '角色', value: '产品设计师' },
        { label: '类型', value: '商业产品' },
      ],
      sections: [
        { heading: '项目概述',
          body: '为一款家用净水设备提供产品设计与原型交付服务——从设计任务书到功能性原型全程推进。完整项目细节保密。' },
        { heading: '项目范围',
          body: '端到端产品设计合作，涵盖用户研究、概念开发、工业设计、CMF 规格制定与原型交付。项目在既定商业时间节点与制造预算内完成交付。' },
        { heading: '交付成果',
          body: '经产品规格验证的功能性原型；面向制造移交的完整设计文档；可供开模的 CAD 文件与 CMF 规格表。' },
      ],
    },
  },
  5: {
    en: {
      title: 'Mel Studios',
      tags: ['Additive Manufacturing', 'Production Workflow', 'Client Delivery'],
      meta: [
        { label: 'Year',  value: '2021\u20132023' },
        { label: 'Role',  value: 'Co-Founder & Operations Lead' },
        { label: 'Type',  value: 'Studio / Commercial' },
      ],
      sections: [
        { heading: 'Overview',
          body: 'Co-founded and operated a commercial 3D printing studio \u2014 managing the full production workflow from client brief through to finished delivery across a range of additive manufacturing technologies and materials.' },
        { heading: 'Context',
          body: 'Mel Studios was set up to serve design, architecture, and product clients needing high-quality rapid prototyping and small-batch production. The studio operated FDM, resin, and SLS workflows, with a focus on turnaround speed and finish quality.' },
        { heading: 'Operations',
          body: 'Client intake and brief translation into print specifications. Machine management and print scheduling across multiple simultaneous jobs. Post-processing, finishing, and quality review. Supplier and material sourcing for specialist requests. Client delivery and project documentation.' },
        { heading: 'Outcome',
          body: 'Delivered over 200 client projects across architecture, product design, and bespoke fabrication. Established a reliable repeat-client base. Built internal workflows and documentation standards used to train new staff and maintain quality at scale.' },
      ],
    },
    zh: {
      title: 'Mel Studios',
      tags: ['增材制造', '生产工作流', '客户交付'],
      meta: [
        { label: '年份', value: '2021\u20132023' },
        { label: '角色', value: '联合创始人与运营负责人' },
        { label: '类型', value: '工作室 / 商业项目' },
      ],
      sections: [
        { heading: '项目概述',
          body: '联合创立并运营一家商业3D打印工作室——跨多种增材制造技术与材料，端到端管理从客户任务书到成品交付的全流程。' },
        { heading: '背景',
          body: 'Mel Studios 面向设计、建筑与产品客户提供高质量快速原型与小批量生产服务。工作室运营 FDM、光固化与 SLS 工作流，以交货速度与表面质量为核心竞争力。' },
        { heading: '运营内容',
          body: '客户接洽与任务书转化为打印规格；多任务并行的设备管理与打印排程；后处理、精修与质量审查；专项需求的供应商与耗材采购；客户交付与项目归档。' },
        { heading: '成果',
          body: '完成逾200个横跨建筑、产品设计与定制制造的客户项目；建立稳定的复购客户基础；搭建内部工作流与文档规范，用于员工培训并维持规模化交付质量。' },
      ],
    },
  },
  6: {
    en: {
      title: 'Final Year Projects',
      tags: ['User-Centred Design', 'Circular Design', 'Prototyping'],
      meta: [
        { label: 'Year',  value: '2020\u20132021' },
        { label: 'Role',  value: 'Designer & Researcher' },
        { label: 'Type',  value: 'Academic / Undergraduate' },
      ],
      sections: [
        { heading: 'Overview',
          body: 'Two final year undergraduate design projects: one exploring fall prevention for older adults through product and environmental design, the other investigating circular energy systems at domestic scale.' },
        { heading: 'Fall Prevention',
          body: 'User research with older adults and occupational therapists to map fall risk triggers and existing intervention gaps. Concept development and prototyping of assistive product and environmental modifications targeting the highest-risk scenarios in domestic settings. Designed for dignity \u2014 avoiding the aesthetic and social stigma associated with conventional assistive equipment.' },
        { heading: 'Circular Energy',
          body: 'Systems-level investigation into how domestic energy use, storage, and waste could be redesigned around circular principles. Concept development for a home energy management system integrating renewable generation, battery storage, and behavioural feedback. Prototyped interface and physical components for user testing.' },
        { heading: 'Outcome',
          body: 'Both projects received distinction grades. Fall Prevention project shortlisted for university design awards. Work informed subsequent interest in bio-integrated and systems-level design approaches.' },
      ],
    },
    zh: {
      title: '本科毕业设计',
      tags: ['以人为本设计', '循环设计', '原型制作'],
      meta: [
        { label: '年份', value: '2020\u20132021' },
        { label: '角色', value: '设计师与研究员' },
        { label: '类型', value: '学术 / 本科阶段' },
      ],
      sections: [
        { heading: '项目概述',
          body: '两个本科毕业设计项目：其一通过产品与环境设计探索老年人跌倒预防；其二研究家庭尺度的循环能源系统。' },
        { heading: '跌倒预防',
          body: '与老年用户及职业治疗师开展用研，梳理跌倒风险诱因与现有干预缺口；针对居家场景中高风险情境进行辅助产品与环境改造的概念开发与原型制作。设计以尊严为先——刻意规避传统辅助设备在外观与社会层面带来的污名化感受。' },
        { heading: '循环能源',
          body: '系统层面研究居家能源使用、储存与废弃如何围绕循环原则重构；开发整合可再生能源发电、电池储能与行为反馈的家庭能源管理系统概念；完成界面与实体组件的用户测试原型。' },
        { heading: '成果',
          body: '两个项目均获优异成绩；跌倒预防项目入围校级设计奖项；研究成果深化了对生物融合与系统层面设计方法的持续探索。' },
      ],
    },
  },
};

const TOTAL_PROJECTS = Object.keys(projectData).length;
let currentProjectId = null;

const projectPanel    = document.getElementById('project-panel');
const projectBack     = document.getElementById('project-back');
const projectIndex    = document.getElementById('project-index');
const projTitle       = document.getElementById('proj-title');
const projTags        = document.getElementById('proj-tags');
const projMeta        = document.getElementById('proj-meta');
const projSections    = document.getElementById('proj-sections');
const projPrev        = document.getElementById('proj-prev');
const projNext        = document.getElementById('proj-next');

function renderProject(id) {
  const lang = currentLang === 'zh' ? 'zh' : 'en';
  const data = projectData[id][lang];
  currentProjectId = id;

  // Index counter
  projectIndex.textContent = String(id).padStart(2, '0') + ' / ' + String(TOTAL_PROJECTS).padStart(2, '0');

  // Title
  projTitle.textContent = data.title;

  // Tags
  projTags.innerHTML = data.tags.map(t => `<span class="tag">${t}</span>`).join('');

  // Meta
  projMeta.innerHTML = data.meta.map(m =>
    `<div class="proj-detail__meta-item">
      <span class="proj-detail__meta-label">${m.label}</span>
      <span class="proj-detail__meta-value">${m.value}</span>
    </div>`
  ).join('');

  // Sections
  projSections.innerHTML = data.sections.map(s =>
    `<div class="proj-detail__section">
      <h2 class="proj-detail__section-heading">${s.heading}</h2>
      <p class="proj-detail__section-body">${s.body}</p>
    </div>`
  ).join('');

  // Prev / next state
  projPrev.disabled = id <= 1;
  projNext.disabled = id >= TOTAL_PROJECTS;

  // Scroll panel to top
  projectPanel.querySelector('.project-panel__body').scrollTop = 0;
}

function openProject(id) {
  renderProject(id);
  projectPanel.classList.add('open');
  projectPanel.setAttribute('aria-hidden', 'false');
  document.body.classList.add('panel-open');
  projectBack.focus();
}

function closeProject() {
  projectPanel.classList.remove('open');
  projectPanel.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('panel-open');
  // Scroll main page to projects section
  document.getElementById('projects').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Projects with dedicated pages (id → URL)
const dedicatedPages = {
  1: 'trace-terra.html',
  2: 'hydro-plantea.html',
  3: 'ksm-technologies.html',
  4: 'water-purifier.html',
  5: 'mel-studios.html',
  6: 'final-year-projects.html',
  7: 'sesame.html',
};

function handleProjectClick(id) {
  if (dedicatedPages[id]) {
    window.location.href = dedicatedPages[id];
  } else {
    openProject(id);
  }
}

// Open via card click or CTA button
document.querySelectorAll('.project-card').forEach((card) => {
  card.addEventListener('click', (e) => {
    const id = parseInt(card.getAttribute('data-project'), 10);
    if (id) handleProjectClick(id);
  });
});

// CTA button clicks should not bubble to card (already handled above, just stop default)
document.querySelectorAll('.project-card__cta').forEach((btn) => {
  btn.addEventListener('click', (evt) => {
    evt.stopPropagation();
    const id = parseInt(btn.closest('[data-project]').getAttribute('data-project'), 10);
    if (id) handleProjectClick(id);
  });
});

projectBack.addEventListener('click', closeProject);

projPrev.addEventListener('click', () => {
  if (currentProjectId > 1) renderProject(currentProjectId - 1);
});

projNext.addEventListener('click', () => {
  if (currentProjectId < TOTAL_PROJECTS) renderProject(currentProjectId + 1);
});

// Keyboard: Escape closes panel
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && projectPanel.classList.contains('open')) closeProject();
});

// ============================================
// Highlights interaction + count-up
// ============================================
(function () {
  const hlList = document.querySelector('.experience__highlights-list');
  if (!hlList) return;

  const hlRows = [...hlList.querySelectorAll('.hl-row')];
  if (!hlRows.length) return;

  let lockedIndex = 0;

  function setActive(index) {
    hlRows.forEach((r, i) => r.classList.toggle('active', i === index));
  }

  // Default: first row active on load
  setActive(0);

  hlRows.forEach((row, i) => {
    row.addEventListener('mouseenter', () => setActive(i));
    row.addEventListener('mouseleave', () => setActive(lockedIndex));
    row.addEventListener('click', () => { lockedIndex = i; setActive(i); });
  });

  // ── Count-up for first metric row only (~40% / 约 40%) ──────────────
  const firstHead = hlRows[0] ? hlRows[0].querySelector('.hl-head') : null;
  if (!firstHead) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let countHasRun = false;

  function runCountUp() {
    if (countHasRun) return;
    countHasRun = true;
    if (reducedMotion) return; // already showing final value, nothing to do

    const raw = firstHead.textContent.trim();
    // match optional non-digit prefix, the number, optional non-digit suffix
    const match = raw.match(/^(\D*)(\d+)(\D*)$/);
    if (!match) return;

    const prefix = match[1];
    const target = parseInt(match[2], 10);
    const suffix = match[3];

    // Rebuild innerHTML with the animatable number span
    const numSpan = document.createElement('span');
    numSpan.textContent = '0';
    firstHead.textContent = '';
    if (prefix) firstHead.appendChild(document.createTextNode(prefix));
    firstHead.appendChild(numSpan);
    if (suffix) firstHead.appendChild(document.createTextNode(suffix));

    // Ease-out cubic, ~700ms
    const duration = 2800;
    const t0 = performance.now();
    function tick(now) {
      const p = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      numSpan.textContent = Math.round(eased * target);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // Trigger once when the highlights section enters the viewport
  const hlSection = document.querySelector('.experience__highlights');
  if (!hlSection) { runCountUp(); return; }

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        runCountUp();
        observer.disconnect();
      }
    },
    { threshold: 0.05 }
  );
  observer.observe(hlSection);
}());
