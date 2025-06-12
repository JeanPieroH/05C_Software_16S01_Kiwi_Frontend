
"use client";
import type { ReactNode } from "react";
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import Logo from "@/components/shared/logo";
import { LayoutGrid, Settings, UserCircle, Users, Target as TargetIcon, Power, ChevronDown, ShoppingCart } from "lucide-react";
import { fetchUserProfile, logoutUser } from '@/lib/api';
import type { User } from '@/types/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

// This component contains the actual UI and uses the useSidebar hook
function DashboardUI({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobile, setOpenMobile } = useSidebar(); 
  
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    async function loadUserProfile() {
      setLoadingUser(true);
      const currentUser = await fetchUserProfile();
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push('/login');
      }
      setLoadingUser(false);
    }
    loadUserProfile();
  }, [router]);

  const handleLogout = () => {
    logoutUser();
    router.push('/login');
  };

  const getInitials = (name?: string, lastName?: string) => {
    if (!name || !lastName) return "??";
    return `${name.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getPageTitle = () => {
    if (pathname === '/dashboard') return "Resumen del Dashboard";
    if (pathname === '/dashboard/profile') return "Mi Perfil";
    if (pathname === '/dashboard/classrooms') return "Mis Classrooms";
    if (pathname.startsWith('/dashboard/classrooms/') && pathname.split('/').length > 3) {
      return "Detalle del Classroom"; 
    }
    if (pathname === '/dashboard/competencies') return "Mis Competencias";
    if (pathname === '/dashboard/store') return "Tienda de Personajes";
    return "Dashboard";
  };

  if (loadingUser) {
    return (
      <div className="flex min-h-screen w-full">
           <Sidebar collapsible="icon" className="border-r hidden md:flex">
            <SidebarHeader>
              <div className="flex items-center gap-2 p-2 justify-between">
                <Logo size="small" className="text-2xl group-data-[collapsible=icon]:hidden" />
                <Logo size="small" className="text-2xl hidden group-data-[collapsible=icon]:block">K</Logo>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <Skeleton className="h-8 w-full my-1" />
              <Skeleton className="h-8 w-full my-1" />
              <Skeleton className="h-8 w-full my-1" />
              <Skeleton className="h-8 w-full my-1" />
              {/* Skeleton for potential Store link */}
              <Skeleton className="h-8 w-full my-1" /> 
            </SidebarContent>
            <SidebarFooter className="p-2 mt-auto">
               <Skeleton className="h-8 w-full my-1" />
            </SidebarFooter>
          </Sidebar>
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b h-16 flex items-center px-4 sm:px-6 justify-between">
            <div className="flex items-center gap-2">
                <Skeleton className="h-7 w-7 md:hidden" />
                <Skeleton className="h-6 w-48" />
            </div>
            <Skeleton className="h-9 w-24 rounded-full" />
          </header>
          <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-auto">
            <Skeleton className="h-64 w-full" />
          </main>
          <footer className="py-4 text-center text-sm text-muted-foreground border-t">
            <Skeleton className="h-4 w-1/3 mx-auto" />
          </footer>
        </div>
      </div>
    );
  }
  
  if (!user) {
     return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <p className="text-lg text-destructive">Cargando o redirigiendo...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background w-full">
      <Sidebar collapsible="icon" className="border-r">
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2 justify-between">
            <Logo size="small" className="text-2xl group-data-[collapsible=icon]:hidden" />
            <Logo size="small" className="text-2xl hidden group-data-[collapsible=icon]:block">K</Logo>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                isActive={pathname === "/dashboard"} 
                tooltip="Resumen"
                onClick={() => isMobile && setOpenMobile(false)}
              >
                <Link href="/dashboard">
                  <LayoutGrid /><span>Resumen</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                isActive={pathname === "/dashboard/profile"} 
                tooltip="Mi Perfil"
                onClick={() => isMobile && setOpenMobile(false)}
              >
                <Link href="/dashboard/profile">
                  <UserCircle /><span>Mi Perfil</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                isActive={pathname.startsWith("/dashboard/classrooms")} 
                tooltip="Mis Classrooms"
                onClick={() => isMobile && setOpenMobile(false)}
              >
                <Link href="/dashboard/classrooms">
                  <Users /><span>Mis Classrooms</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {user.role === 'TEACHER' && (
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={pathname === "/dashboard/competencies"} 
                  tooltip="Mis Competencias"
                  onClick={() => isMobile && setOpenMobile(false)}
                >
                  <Link href="/dashboard/competencies">
                    <TargetIcon /><span>Mis Competencias</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}

            {user.role === 'STUDENT' && (
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={pathname === "/dashboard/store"} 
                  tooltip="Tienda"
                  onClick={() => isMobile && setOpenMobile(false)}
                >
                  <Link href="/dashboard/store">
                    <ShoppingCart /><span>Tienda</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-2 mt-auto">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Configuración" disabled>
                <Settings />
                <span>Configuración</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="flex-1 flex flex-col">
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b h-16 flex items-center px-4 sm:px-6 justify-between">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="md:hidden" />
                <h1 className="text-xl font-semibold text-foreground">{getPageTitle()}</h1>
            </div>
          
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 p-1 h-auto rounded-full">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={`https://placehold.co/40x40.png?text=${getInitials(user.name, user.lastName)}`} alt={`${user.name} ${user.lastName}`} data-ai-hint="profile avatar"/>
                            <AvatarFallback>{getInitials(user.name, user.lastName)}</AvatarFallback>
                        </Avatar>
                        <span className="hidden sm:inline text-sm font-medium">{user.name}</span>
                        <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:inline" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name} {user.lastName}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => { router.push('/dashboard/profile'); if (isMobile) setOpenMobile(false); }}>
                        <UserCircle className="mr-2 h-4 w-4" />
                        <span>Mi Perfil</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Configuración</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                        <Power className="mr-2 h-4 w-4" />
                        <span>Cerrar Sesión</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
        
        <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-auto">
          {children}
        </main>

        <footer className="py-4 text-center text-sm text-muted-foreground border-t">
            © {new Date().getFullYear()} KIWI Classroom. Todos los derechos reservados.
        </footer>
      </SidebarInset>
    </div>
  );
}

// Default export for the layout file
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <DashboardUI>{children}</DashboardUI>
    </SidebarProvider>
  );
}
