"use client";

import { useRouter } from "next/navigation";
import VideoThumb from "@/public/images/hero-image-01.jpg";
import ModalVideo from "@/components/modal-video";

export default function HeroHome() {
  const router = useRouter();

  const handleStartBuilding = async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });

      if (!res.ok) {
        // not signed in
        const confirmSignIn = window.confirm(
          "You need to sign in first to start building your resume. Do you want to sign in now?"
        );
        if (confirmSignIn) router.push("/signin");
        return;
      }

      const data = await res.json();
      const user = data?.user;

      if (!user) {
        const confirmSignIn = window.confirm(
          "You need to sign in first to start building your resume. Do you want to sign in now?"
        );
        if (confirmSignIn) router.push("/signin");
        return;
      }

      // 🚫 Block admin access
      if (user.role === "admin") {
        alert("Admin accounts cannot use the Resume Builder. Redirecting to admin dashboard...");
        router.push("/admin"); // redirect admin to their area
        return;
      }

      // ✅ Normal user
      router.push("/templates");

    } catch (error) {
      console.error("Error checking auth:", error);
      const confirmSignIn = window.confirm(
        "You need to sign in first to start building your resume. Do you want to sign in now?"
      );
      if (confirmSignIn) router.push("/signin");
    }
  };

  return (
    <section>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="py-12 md:py-20">
          <div className="pb-12 text-center md:pb-20">
            <h1
              className="animate-[gradient_6s_linear_infinite] bg-[linear-gradient(to_right,var(--color-gray-200),var(--color-indigo-200),var(--color-gray-50),var(--color-indigo-300),var(--color-gray-200))] bg-[length:200%_auto] bg-clip-text pb-5 font-nacelle text-4xl font-semibold text-transparent md:text-5xl"
              data-aos="fade-up"
            >
              Resume Builder Tool
            </h1>
            <div className="mx-auto max-w-3xl">
              <p
                className="mb-8 text-xl text-indigo-200/65"
                data-aos="fade-up"
                data-aos-delay={200}
              >
                Our Resume Builder helps you create professional, job-winning resumes effortlessly.
                Customize, preview, and download your resume — all in just a few clicks.
              </p>

              <div className="mx-auto max-w-xs sm:flex sm:max-w-none sm:justify-center">
                <div data-aos="fade-up" data-aos-delay={400}>
                  <button
                    onClick={handleStartBuilding}
                    className="bg-purple-600 px-6 py-3 text-white rounded-lg shadow-lg hover:bg-purple-700 transition-all"
                  >
                    Start Building →
                  </button>
                </div>
              </div>
            </div>
          </div>

          <ModalVideo
            thumb={VideoThumb}
            thumbWidth={1104}
            thumbHeight={576}
            thumbAlt="Modal video thumbnail"
            video="videos/video.mp4"
            videoWidth={1920}
            videoHeight={1080}
          />
        </div>
      </div>
    </section>
  );
}
