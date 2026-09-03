import { Home, Inbox, LogOut, Menu, Settings } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/lib/store/use-auth-store";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";

const items = [
	{
		title: "Criar Nota",
		url: "/notes/new",
		icon: Inbox,
	},
	{
		title: "Home",
		url: "/mainpage",
		icon: Home,
	},
	{
		title: "Settings",
		url: "/settings",
		icon: Settings,
	},
];

export function AppSidebar({ onResizeWidth }: { onResizeWidth: (clientX: number) => void }) {
	const { toggleSidebar, state, isMobile } = useSidebar();
	const location = useLocation();
	const navigate = useNavigate();
	const logout = useAuthStore((state) => state.logout);
	const draggingRef = useRef(false);

	const handleLogout = () => {
		logout();
		navigate("/auth/signin");
	};

	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			if (draggingRef.current) onResizeWidth(e.clientX);
		};
		const handleMouseUp = () => {
			draggingRef.current = false;
			document.body.style.removeProperty("cursor");
			document.body.style.removeProperty("user-select");
		};
		window.addEventListener("mousemove", handleMouseMove);
		window.addEventListener("mouseup", handleMouseUp);
		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", handleMouseUp);
		};
	}, [onResizeWidth]);

	const startResize = useCallback(() => {
		draggingRef.current = true;
		document.body.style.cursor = "col-resize";
		document.body.style.userSelect = "none";
	}, []);

	return (
		<Sidebar collapsible="icon">
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton onClick={toggleSidebar} tooltip="Abrir/fechar menu">
							<Menu />
							<span className="font-styled text-xl">Scriptum</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{items.map((item) => {
								const isActive = location.pathname === item.url;
								return (
									<SidebarMenuItem key={item.title}>
										<SidebarMenuButton
											asChild
											isActive={isActive}
											tooltip={item.title}
											className={isActive ? "border-l-2 border-accent-500" : ""}
										>
											<Link to={item.url}>
												<item.icon />
												<span>{item.title}</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								);
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton onClick={handleLogout} tooltip="Sair">
							<LogOut />
							<span>Sair</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
			{!isMobile && state === "expanded" && (
				<div
					onMouseDown={startResize}
					className="absolute inset-y-0 right-0 w-1 cursor-col-resize hover:bg-accent-500/50 active:bg-accent-500"
				/>
			)}
		</Sidebar>
	);
}
