import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ZustandProvider } from "@/components/providers/zustand-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { SidebarLayout } from "@/layouts/sidebar-layout";
import { HomePage } from "@/pages/home-page";
import { SigninPage } from "@/pages/auth/signin-page";
import { SignupPage } from "@/pages/auth/signup-page";
import { MainPage } from "@/pages/main-page";
import { NewNotePage } from "@/pages/notes/new-note-page";
import { NotePage } from "@/pages/notes/note-page";

export default function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ZustandProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth/signin" element={<SigninPage />} />
            <Route path="/auth/signup" element={<SignupPage />} />
            <Route element={<SidebarLayout />}>
              <Route path="/mainpage" element={<MainPage />} />
              <Route path="/notes/new" element={<NewNotePage />} />
              <Route path="/notes/:noteId" element={<NotePage />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster />
      </ZustandProvider>
    </ThemeProvider>
  );
}
