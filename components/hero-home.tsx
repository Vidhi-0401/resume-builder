"use client";
import Link from "next/link";

import { useRouter } from "next/navigation";
import VideoThumb from "@/public/images/hero-image-01.jpg";
import ModalVideo from "@/components/modal-video";

export default function HeroHome() {
  const router = useRouter();

  const handleStartBuilding = () => {
    const token = localStorage.getItem("token");

    // if (token) {
    //   router.push("/templates"); // user signed in
    // } else {
    //   const confirmSignIn = window.confirm(
    //     "You need to sign in first to start building your resume. Do you want to sign in now?"
    //   );

    //   if (confirmSignIn) {
    //     router.push("/signin");
    //   }
    // }
      router.push("/templates");

  };

  return (
    <section>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Hero content */}
        <div className="py-12 md:py-20">
          {/* Section header */}
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
                Our Resume Builder helps you create professional, job-winning resumes effortlessly. Customize, preview, and download your resume
                <br></br>— all in just a few clicks.
              </p>
              <div className="mx-auto max-w-xs sm:flex sm:max-w-none sm:justify-center">
                <div data-aos="fade-up" data-aos-delay={400}>
                  {/* <button
                    onClick={handleStartBuilding}
                    className="btn group mb-4 w-full bg-linear-to-t from-indigo-600 to-indigo-500 text-white sm:mb-0 sm:w-auto"
                  >
                    <span className="relative inline-flex items-center">
                      Start Building
                      <span className="ml-1 tracking-normal text-white/50 transition-transform group-hover:translate-x-0.5">
                        -&gt;
                      </span>
                    </span>
                    
                  </button> */}
                  {/* ✅ Use Link for routing */}
                  <div data-aos="fade-up" data-aos-delay={400}>
                    <button
                      onClick={handleStartBuilding}
                      className="bg-purple-600 px-6 py-3 text-white rounded-lg shadow-lg hover:bg-purple-700"
                    >
                      Start Building →
                    </button>

                  </div>

                </div>
                {/* <div data-aos="fade-up" data-aos-delay={600}>
                  <a
                    className="btn relative w-full bg-linear-to-b from-gray-800 to-gray-800/60 text-gray-300 sm:ml-4 sm:w-auto"
                    href="#0"
                  >
                    Schedule Demo
                  </a>
                </div> */}
              </div>
            </div>
          </div>

          <ModalVideo
            thumb={VideoThumb}
            thumbWidth={1104}
            thumbHeight={576}
            thumbAlt="Modal video thumbnail"
            video="videos//video.mp4"
            videoWidth={1920}
            videoHeight={1080}
          />
        </div>
      </div>
    </section>
  );
}
