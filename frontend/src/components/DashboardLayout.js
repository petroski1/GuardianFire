import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { API } from "../App";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import {
  Shield,
  LayoutDashboard,
  Activity,
  Wrench,
  FileText,
  Settings,
  LogOut,
  Menu,
  ChevronRight
} from "lucide-react";

const DashboardLayout = ({ children, user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.error("Logout error:", error);
    }
    navigate("/");
  };

  const navItems = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: "Dashboard", path: "/dashboard" },
    { icon: <Activity className="w-5 h-5" />, label: "Sensores", path: "/sensors" },
    { icon: <Wrench className="w-5 h-5" />, label: "Ordens de Serviço", path: "/work-orders" },
    { icon: <FileText className="w-5 h-5" />, label: "Relatos", path: "/reports" },
    { icon: <Settings className="w-5 h-5" />, label: "Configurações", path: "/settings" },
  ];

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ item, mobile = false }) => (
    <button
      onClick={() => {
        navigate(item.path);
        if (mobile) setMobileMenuOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        isActive(item.path)
          ? "bg-orange-500/10 text-orange-500 border border-orange-500/30"
          : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
      }`}
      data-testid={`nav-${item.path.replace("/", "")}`}
    >
      {item.icon}
      <span className="font-medium text-sm">{item.label}</span>
      {isActive(item.path) && <ChevronRight className="w-4 h-4 ml-auto" />}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#09090b] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-zinc-800 bg-[#09090b] fixed h-full">
        {/* Logo */}
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-heading font-bold text-white text-sm tracking-wide">GUARDIANFIRE</span>
              <span className="block text-xs text-zinc-500">Previsão Ativa Industrial</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink key={item.path} item={item} />
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center gap-3 px-2">
            <Avatar className="w-9 h-9">
              <AvatarImage src={user?.picture} />
              <AvatarFallback className="bg-zinc-800 text-white">
                {user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{user?.name}</p>
              <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-[#09090b]/95 backdrop-blur border-b border-zinc-800">
          <div className="flex items-center justify-between px-4 lg:px-6 py-4">
            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="text-zinc-400" data-testid="mobile-menu-btn">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-[#09090b] border-zinc-800 p-0 w-72">
                <div className="p-6 border-b border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-heading font-bold text-white">GUARDIANFIRE</span>
                  </div>
                </div>
                <nav className="p-4 space-y-2">
                  {navItems.map((item) => (
                    <NavLink key={item.path} item={item} mobile />
                  ))}
                </nav>
              </SheetContent>
            </Sheet>

            {/* Page Title - Hidden on mobile */}
            <div className="hidden lg:block" />

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2" data-testid="user-menu-btn">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.picture} />
                    <AvatarFallback className="bg-zinc-800 text-white text-sm">
                      {user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-zinc-300 hidden sm:inline">{user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#121214] border-zinc-800">
                <DropdownMenuItem className="text-zinc-400">
                  {user?.email}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-red-400 cursor-pointer"
                  data-testid="logout-btn"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
