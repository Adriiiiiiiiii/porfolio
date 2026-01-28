const TRANSLATIONS = {
  en: {
    page_title: "Adrià Montero — Student & SysAdmin",
    name: "Adrià Montero",
    role: "Student • Aspiring SysAdmin",
    nav_about: "About",
    nav_skills: "Skills",
    nav_projects: "Projects",
    nav_scripts: "Scripts", // NEW
    nav_contact: "Contact",

    hero_hi: "Hi, I'm Adrià.",
    hero_role: "SysAdmin Student & Cyber Enthusiast",
    hero_sub: "Finishing my Higher Degree (ASIX). I test everything I learn in my homelab — breaking servers and automating anything that I have to do more than once.",

    download_resume: "Download CV",
    see_projects: "View My Progress",

    about_title: "Who am I?",
    about_ops_title: "Future SysAdmin",
    about_ops: "Training in Linux/Windows administration. I don't just study for exams; I maintain real services at home, break them, and learn how to fix them properly.",
    about_cyber_title: "Cyber Security Student",
    about_cyber: "I believe you can't defend what you don't understand. That's why I spend time on CTFs and Red Team boxes—to see how the bad guys think.",
    about_code_title: "Automation Learner",
    about_code: "I hate doing the same thing twice. I'm learning Bash & Python to script away the boring stuff and make my life easier.",

    skills_title: "Skill Stack",

    projects_title: "Learning by Doing",
    proj1_title: "Automated Server Hardening",
    proj1_desc: "My attempt at an enterprise-grade script. Configures UFW, SSH, and Fail2Ban on fresh Debian installs.",
    proj2_title: "Cloud Infrastructure Lab",
    proj2_desc: "Learning Terraform by deploying a test VPC. It's not production-ready yet, but it scales automatically!",
    proj3_title: "DFIR Log Tool",
    proj3_desc: "A Python script I wrote to understand how forensic artifacts work. Grabs system logs and hashes files.",

    scripts_title: "My Scripts Library",
    scripts_sub: "Tools I've written to solve my own problems and learn scripting. Feel free to steal them!",
    script1_desc: "My first dashboard script. Checks CPU/RAM and warns me if I left zombie processes.",
    script2_desc: "Powershell practice: verifying who is actually an Admin on my Windows VMs.",
    script3_desc: "Simple network checker I use when my homelab DNS breaks (again).",

    certs_title: "Certifications",
    cert_have_1: "Cisco Intro to Cybersecurity",
    cert_have_2: "Cisco Network Technician",
    cert_plan_1: "LPIC-1 Linux Admin",

    contact_title: "Let's Connect",
    contact_lead: "Eager to learn and work. Looking for internships or junior positions in SysAdmin/DevOps.",
    form_send: "Execute Send",
    form_name_placeholder: "Name",
    form_email_placeholder: "Email",
    form_message_placeholder: "echo 'Hello World'",
    footer_text: "All systems normal.",
    term_welcome: "Type 'help' to see available commands. Try 'matrix' for a surprise.",
    meta_description: "Portfolio of Adrià Montero - SysAdmin Student & Cyber Enthusiast. Projects, scripts, and skills.",
  },
  es: {
    page_title: "Adrià Montero — Estudiante & SysAdmin",
    name: "Adrià Montero",
    role: "Estudiante • Futuro SysAdmin",
    nav_about: "Sobre mí",
    nav_skills: "Habilidades",
    nav_projects: "Proyectos",
    nav_scripts: "Scripts",
    nav_contact: "Contacto",

    hero_hi: "Hola, soy Adrià.",
    hero_role: "Estudiante de SysAdmin & Ciberseguridad",
    hero_sub: "Terminando el grado (ASIX). Lo que aprendo en clase me lo llevo al homelab para romperlo, arreglarlo y entender cómo funciona de verdad bajo el capó.",

    download_resume: "Bajar CV",
    see_projects: "Ver mi Progreso",

    about_title: "¿Quién soy?",
    about_ops_title: "Futuro SysAdmin",
    about_ops: "Formándome en Linux y Windows Server. No me quedo en la teoría: en casa tengo mis propios servicios corriendo y me peleo con ellos cuando fallan (que es a menudo).",
    about_cyber_title: "Estudiante de Ciberseguridad",
    about_cyber: "Para defender hay que saber atacar. Por eso le doy a los CTFs y estudio técnicas de Red Team: para entender por dónde intentarán entrar.",
    about_code_title: "Aprendiz de Automatización",
    about_code: "Odio repetir tareas. Si tengo que hacerlo más de dos veces, intento hacer un script en Bash o Python. A veces tardo más en programarlo que en hacerlo, pero así aprendo.",

    skills_title: "Mi Stack Técnico",

    projects_title: "Aprendiendo Haciendo",
    proj1_title: "Hardening Automatizado",
    proj1_desc: "Mi intento de script 'pro'. Configura UFW, SSH y Fail2Ban en instalaciones limpias de Debian/Ubuntu para no dejarme nada.",
    proj2_title: "Laboratorio Cloud",
    proj2_desc: "Aprendiendo Terraform desplegando una red de prueba. Aún rompo cosas, ¡pero escala solo!",
    proj3_title: "Herramienta Forense (DFIR)",
    proj3_desc: "Script en Python que escribí para entender qué buscan los analistas forenses. Saca logs y calcúla hashes de archivos.",

    scripts_title: "Mis Scripts",
    scripts_sub: "Herramientas que he escrito para solucionar mis problemas (y pelearme con el código). ¡Úsalos si quieres!",
    script1_desc: "Mi primer dashboard. Mira CPU/RAM y me chiva si he dejado procesos zombi colgados.",
    script2_desc: "Práctica de PowerShell: para ver quién es realmente Admin en mis VMs de Windows y evitar sorpresas.",
    script3_desc: "Checker de red sencillo que uso cuando el DNS de mi laboratorio decide dejar de funcionar.",

    certs_title: "Certificaciones",
    cert_have_1: "Cisco Intro to Cybersecurity",
    cert_have_2: "Cisco Network Technician",
    cert_plan_1: "LPIC-1 Admin Linux",

    contact_title: "Conectemos",
    contact_lead: "Con muchas ganas de aprender y trabajar. Busco prácticas o posición Junior en SysAdmin/DevOps.",
    form_send: "Enviar Mensaje",
    form_name_placeholder: "Nombre",
    form_email_placeholder: "Correo",
    form_message_placeholder: "echo 'Hola Mundo'",
    footer_text: "Todos los sistemas operativos.",
    term_welcome: "Escribe 'help' para ver comandos. Prueba 'matrix' para una sorpresa.",
    meta_description: "Portfolio de Adrià Montero - Estudiante de SysAdmin y Ciberseguridad. Proyectos, scripts y conocimientos.",
  }
};

window.TRANSLATIONS = TRANSLATIONS;