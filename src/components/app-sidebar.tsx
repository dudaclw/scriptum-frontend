import { Home, Inbox, Menu, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { ModeToggle } from "@/components/mode-toggle";

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
		url: "#",
		icon: Settings,
	},
];

export function AppSidebar() {
	const { toggleSidebar } = useSidebar();
	const location = useLocation();

	return (
		<Sidebar collapsible="icon">
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton onClick={toggleSidebar} tooltip="Abrir/fechar menu">
							<Menu />
							<span className="font-semibold">Scriptum</span>
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
						<ModeToggle />
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
