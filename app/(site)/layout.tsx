import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import NoticePopup from "@/components/popup/NoticePopup";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <AnalyticsTracker />
      <NoticePopup imageSrc="/images/popup.jpg" />
    </>
  );
}
