import HorizontalPage from "@/components/HorizontalPage";
import Navbar from "@/components/Navbar";
import Preloader from "@/components/preloader/Preloader";
import SmoothScroll from "@/components/SmoothScroll";
import StitchCursor from "@/components/StitchCursor";
import DialNav from "@/components/DialNav";

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <Preloader />
      <StitchCursor />
      <Navbar />
      <DialNav />
      <main className="min-h-screen flex-1 bg-white text-[#141414]">
        {/* every section side by side; scrolling down carries the page sideways */}
        <HorizontalPage />
      </main>
    </>
  );
}
