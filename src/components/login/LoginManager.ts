import { ParticleNetwork } from './ParticleNetwork';

interface Empresa {
    id: number;
    nombre: string;
}

interface Usuario {
    id: number;
    nombre_completo: string;
    rol_nombre: string;
}

interface LogosMap {
    [key: string]: string;
}

export class LoginManager {
    // Vistas
    private viewCompanies: HTMLElement | null;
    private viewLogin: HTMLElement | null;

    // Elementos Vista 1
    private companiesGrid: HTMLElement | null;

    // Elementos Vista 2
    private btnBack: HTMLElement | null;
    private selectedCompanyImg: HTMLImageElement | null;
    private empresaIdInput: HTMLInputElement | null;
    private usuarioSelect: HTMLSelectElement | null;
    private passwordInput: HTMLInputElement | null;
    private loginForm: HTMLFormElement | null;
    private loginBtn: HTMLButtonElement | null;
    private loginBtnText: HTMLElement | null;
    private messageContainer: HTMLElement | null;

    private logosMap: LogosMap;

    constructor(logosMap: LogosMap) {
        this.logosMap = logosMap;

        // Vistas
        this.viewCompanies = document.getElementById("view-companies");
        this.viewLogin = document.getElementById("view-login");

        // Elementos Vista 1
        this.companiesGrid = document.getElementById("companies-grid");

        // Elementos Vista 2
        this.btnBack = document.getElementById("btn-back");
        this.selectedCompanyImg = document.getElementById("selected-company-img") as HTMLImageElement;
        this.empresaIdInput = document.getElementById("empresaId") as HTMLInputElement;
        this.usuarioSelect = document.getElementById("usuarioSelect") as HTMLSelectElement;
        this.passwordInput = document.getElementById("passwordInput") as HTMLInputElement;
        this.loginForm = document.getElementById("loginForm") as HTMLFormElement;
        this.loginBtn = document.getElementById("loginBtn") as HTMLButtonElement;
        this.loginBtnText = document.getElementById("loginBtnText");
        this.messageContainer = document.getElementById("messageContainer");

        this.init();
    }

    init() {
        // Init Particles
        const canvas = document.getElementById("bg-canvas") as HTMLCanvasElement;
        if (canvas) new ParticleNetwork(canvas);

        this.cargarEmpresas();
        this.setupEventListeners();
        this.checkExistingLogin();
    }

    setupEventListeners() {
        this.btnBack?.addEventListener("click", () =>
            this.showCompaniesView(),
        );
        this.loginForm?.addEventListener("submit", (e) =>
            this.onLogin(e),
        );
    }

    async cargarEmpresas() {
        if (!this.companiesGrid) return;
        try {
            const response = await fetch("/api/empresas");
            const data = await response.json();

            if (data.success && data.empresas) {
                this.renderEmpresas(data.empresas);
            } else {
                this.companiesGrid.innerHTML =
                    '<p style="color:#64748b">Error al cargar empresas</p>';
            }
        } catch (error) {
            console.error("Error:", error);
            this.companiesGrid.innerHTML =
                '<p style="color:#64748b">Error de conexión</p>';
        }
    }

    renderEmpresas(empresas: Empresa[]) {
        if (!this.companiesGrid) return;
        this.companiesGrid.innerHTML = "";

        // Sort alphabetically
        empresas.sort((a, b) => a.nombre.localeCompare(b.nombre));

        empresas.forEach((empresa) => {
            const card = document.createElement("div");
            card.className = "company-card";

            // Buscar logo
            const normalizedName = empresa.nombre
                .toLowerCase()
                .trim();
            const logoSrc = this.logosMap[normalizedName] || null;

            let content = "";
            if (logoSrc) {
                content = `
                <div class="company-logo-container">
                    <img src="${logoSrc}" alt="${empresa.nombre}">
                </div>
            `;
            }

            // Removed company name text as requested

            card.innerHTML = content;
            card.onclick = () =>
                this.selectCompany(empresa, logoSrc);

            this.companiesGrid!.appendChild(card);
        });
    }

    selectCompany(empresa: Empresa, logoSrc: string | null) {
        if (!this.empresaIdInput || !this.selectedCompanyImg || !this.viewCompanies || !this.viewLogin) return;

        // Configurar vista de login
        this.empresaIdInput.value = empresa.id.toString();

        if (logoSrc) {
            this.selectedCompanyImg.src = logoSrc;
            this.selectedCompanyImg.style.display = "block";
        } else {
            this.selectedCompanyImg.style.display = "none";
        }

        // Cambiar vista
        this.viewCompanies.classList.add("hidden");
        this.viewLogin.classList.remove("hidden");

        // Cargar usuarios
        this.loadUsuarios(empresa.id);
    }

    showCompaniesView() {
        if (!this.viewLogin || !this.viewCompanies || !this.passwordInput || !this.messageContainer) return;
        this.viewLogin.classList.add("hidden");
        this.viewCompanies.classList.remove("hidden");
        this.passwordInput.value = "";
        this.messageContainer.innerHTML = "";
    }

    async loadUsuarios(empresaId: number) {
        if (!this.usuarioSelect || !this.loginBtn) return;

        this.usuarioSelect.innerHTML =
            '<option value="">Cargando usuarios...</option>';
        this.usuarioSelect.disabled = true;
        this.loginBtn.disabled = true;

        try {
            const response = await fetch(
                `/api/usuarios?empresa_id=${empresaId}&activo=true`,
            );
            const data = await response.json();

            if (data.success) {
                this.usuarioSelect.innerHTML =
                    '<option value="">Seleccione su usuario...</option>';
                data.usuarios.forEach((usuario: Usuario) => {
                    const option = document.createElement("option");
                    option.value = usuario.id.toString();
                    option.textContent = `${usuario.nombre_completo} (${usuario.rol_nombre})`;
                    this.usuarioSelect!.appendChild(option);
                });
                this.usuarioSelect.disabled = false;
                this.loginBtn.disabled = false;
                this.usuarioSelect.focus();
            } else {
                this.showMessage(
                    "Error al cargar usuarios",
                    "error",
                );
            }
        } catch (error) {
            this.showMessage("Error de conexión", "error");
        }
    }

    async onLogin(event: Event) {
        event.preventDefault();

        if (!this.empresaIdInput || !this.usuarioSelect || !this.passwordInput) return;

        const empresaId = this.empresaIdInput.value;
        const usuarioId = this.usuarioSelect.value;
        const password = this.passwordInput.value;

        if (!usuarioId || !password) {
            this.showMessage("Complete todos los campos", "error");
            return;
        }

        this.setLoading(true);

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    empresa_id: parseInt(empresaId),
                    usuario_id: parseInt(usuarioId),
                    password: password,
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                localStorage.setItem(
                    "userSession",
                    JSON.stringify({
                        usuario: data.usuario,
                        loginTime: new Date().toISOString(),
                        expiresAt: new Date(
                            Date.now() + 8 * 60 * 60 * 1000,
                        ).toISOString(),
                    }),
                );

                this.showMessage(
                    "¡Bienvenido! Ingresando...",
                    "success",
                );
                setTimeout(
                    () => (window.location.href = "/"),
                    2800,
                );
            } else {
                this.showMessage(
                    data.details || "Credenciales incorrectas",
                    "error",
                );
                this.setLoading(false);
            }
        } catch (error) {
            this.showMessage("Error de conexión", "error");
            this.setLoading(false);
        }
    }

    setLoading(loading: boolean) {
        if (!this.loginBtn || !this.loginBtnText) return;
        if (loading) {
            this.loginBtn.disabled = true;
            this.loginBtnText.innerHTML =
                '<div class="spinner" style="display:inline-block; vertical-align:middle; margin-right:8px;"></div> Verificando...';
        } else {
            this.loginBtn.disabled = false;
            this.loginBtnText.textContent = "Iniciar Sesión";
        }
    }

    showMessage(message: string, type: "error" | "success") {
        if (!this.messageContainer) return;

        // Si es un mensaje de éxito de bienvenida, usar el modal especial
        if (
            type === "success" &&
            (message.includes("Bienvenido") ||
                message.includes("Ingresando"))
        ) {
            this.showWelcomeModal();
            return;
        }

        const className =
            type === "error" ? "message-error" : "message-success";
        const icon = type === "error" ? "⚠️" : "✅";
        this.messageContainer.innerHTML = `
        <div class="message-box ${className}">
            <span>${icon}</span> ${message}
        </div>
    `;
    }

    showWelcomeModal() {
        const modal = document.getElementById("welcome-modal");
        if (modal) {
            modal.classList.add("show");
            this.animateWelcomeIcons();

            // Ocultar el modal después de 2.5 segundos
            setTimeout(() => {
                modal.classList.remove("show");
            }, 2500);
        }
    }

    animateWelcomeIcons() {
        const iconElement = document.getElementById("welcome-icon");
        if (!iconElement) return;

        const icons = ["🚜", "👷", "🚁", "🗺️", "🏗️", "📐", "🧱"];
        let index = 0;

        // Cambio inicial inmediato
        iconElement.textContent = icons[0];
        index++;

        const interval = setInterval(() => {
            iconElement.style.transition =
                "transform 0.15s ease-out";
            iconElement.style.transform = "scale(0.8)";

            setTimeout(() => {
                iconElement.textContent = icons[index];
                iconElement.style.transform = "scale(1.1)";
                index = (index + 1) % icons.length;
            }, 150);

            setTimeout(() => {
                iconElement.style.transform = "scale(1)";
            }, 300);
        }, 600);

        setTimeout(() => clearInterval(interval), 3000);
    }

    checkExistingLogin() {
        const session = localStorage.getItem("userSession");
        if (session) {
            try {
                const sessionData = JSON.parse(session);
                if (new Date(sessionData.expiresAt) > new Date()) {
                    window.location.href = "/";
                }
            } catch (e) {
                localStorage.removeItem("userSession");
            }
        }
    }
}
