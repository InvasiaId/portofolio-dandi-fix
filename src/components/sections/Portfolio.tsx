import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";
import { PortfolioCanvas } from "../canvas/PortfolioCanvas";
import { X, ExternalLink, Github } from "lucide-react";

export function Portfolio() {
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [projects, setProjects] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(["ALL"]);
  const [zoomMedia, setZoomMedia] = useState<{
    url: string;
    type: "image" | "video";
  } | null>(null);
  const containerRef = useRef<HTMLElement>(null);

  const colors = [
    "#0ae2ff",
    "#ff0ab5",
    "#00ff41",
    "#f5d300",
    "#ba0aff",
    "#ff510a",
  ];

  useEffect(() => {
    // Fetch projects and assign unique glowing colors
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const enriched = data.map((p, i) => ({
            ...p,
            color: colors[i % colors.length],
          }));
          setProjects(enriched);
        }
      })
      .catch(console.error);

    // Fetch dynamic categories
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const catNames = data
            .filter((c) => c.type === "portfolio")
            .map((c) => c.name);
          setCategories(["ALL", ...catNames]);
        }
      })
      .catch(console.error);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  return (
    <>
      <section
        ref={containerRef as React.RefObject<HTMLElement>}
        id="portfolio"
        className="relative z-50 w-full h-screen bg-[#02040a] overflow-hidden flex items-center justify-center"
      >
        {/* Parallax Background Grid / Element */}
        <motion.div
          className="absolute inset-0 z-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at center, #0ae2ff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="absolute top-1/2 -translate-y-1/2 left-4 md:left-10 z-50 font-mono text-sm max-h-[80vh] overflow-y-auto no-scrollbar">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyber-purple to-cyber-blue mb-4 pointer-events-none">
            PROJECT ARCHIVE
          </h2>
          <div className="space-y-2 text-gray-500">
            {categories.map((cat) => (
              <p
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`cursor-pointer transition-colors hover:text-cyber-green uppercase ${filterCategory === cat ? "text-cyber-green" : ""}`}
              >
                -&gt; {cat}
              </p>
            ))}
          </div>
        </div>

        {/* Giant Background Parallax Text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 font-mono font-bold text-[12vw] text-white/5 pointer-events-none whitespace-nowrap select-none">
          PORTFOLIO
        </div>

        <div className="absolute inset-0 z-10">
          <PortfolioCanvas
            projects={projects}
            onSelectProject={setSelectedProject}
            filterCategory={filterCategory}
          />
        </div>

        {/* Pop-up Modal */}
        <AnimatePresence>
          {selectedProject && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
              onClick={() => setSelectedProject(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-cyber-dark border shadow-[0_0_30px_rgba(0,0,0,0.5)] border-white/10 w-full max-w-3xl overflow-hidden"
                style={{
                  borderColor: selectedProject.color,
                  boxShadow: `0 0 30px ${selectedProject.color}40`,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div
                  className="flex justify-between items-center p-4 border-b border-white/10"
                  style={{ backgroundColor: `${selectedProject.color}20` }}
                >
                  <div
                    className="font-mono font-bold truncate pr-4"
                    style={{ color: selectedProject.color }}
                  >
                    {selectedProject.title} // DETAIL
                  </div>
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="text-gray-400 hover:text-white transition-colors shrink-0"
                  >
                    <X />
                  </button>
                </div>

                {/* Body */}
                <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-1/2 flex flex-col gap-4">
                    <div
                      className="w-full aspect-video bg-black/50 border flex items-center justify-center relative overflow-hidden group shrink-0 cursor-pointer"
                      style={{ borderColor: `${selectedProject.color}50` }}
                      onClick={() => {
                        if (selectedProject.image) {
                          setZoomMedia({
                            url: selectedProject.image,
                            type: "image",
                          });
                        }
                      }}
                    >
                      {selectedProject.image ? (
                        <img
                          src={selectedProject.image}
                          alt={selectedProject.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <>
                          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/micro-carbon.png')] opacity-30 mix-blend-overlay z-0"></div>
                          <span className="font-mono text-gray-600 z-10 group-hover:scale-110 transition-transform">
                            MEDIA_UNAVAILABLE
                          </span>
                        </>
                      )}
                    </div>

                    {/* Extra Media Gallery */}
                    {selectedProject.media &&
                      Array.isArray(selectedProject.media) &&
                      selectedProject.media.length > 0 && (
                        <div className="flex w-full gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-cyber-blue/20 scrollbar-track-transparent">
                          {selectedProject.media.map(
                            (url: string, i: number) => {
                              const isImg =
                                url.match(/\.(jpeg|jpg|gif|png|webp|svg)/i) ||
                                url.includes("res.cloudinary.com") ||
                                url.startsWith("data:image/");
                              const isVideo =
                                url.match(/\.(mp4|webm|mkv|avi)/i) ||
                                url.includes("video/upload");

                              if (isImg) {
                                return (
                                  <div
                                    key={i}
                                    onClick={() =>
                                      setZoomMedia({ url, type: "image" })
                                    }
                                    className="shrink-0 w-24 h-24 border border-white/10 hover:border-cyber-blue/50 transition-colors cursor-pointer overflow-hidden group"
                                  >
                                    <img
                                      src={url}
                                      alt="Media"
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                  </div>
                                );
                              } else if (isVideo) {
                                return (
                                  <div
                                    key={i}
                                    onClick={() =>
                                      setZoomMedia({ url, type: "video" })
                                    }
                                    className="shrink-0 w-24 h-24 border border-white/10 hover:border-cyber-blue/50 transition-colors cursor-pointer bg-black flex items-center justify-center font-mono text-[10px] text-cyber-blue text-center p-2 group"
                                  >
                                    <span className="truncate w-full block group-hover:scale-110 transition-transform duration-500">
                                      VIDEO
                                    </span>
                                  </div>
                                );
                              } else {
                                return (
                                  <a
                                    href={url}
                                    target="_blank"
                                    rel="noreferrer"
                                    key={i}
                                    className="shrink-0 w-24 h-24 border border-white/10 hover:border-cyber-blue/50 transition-colors bg-white/5 flex items-center justify-center font-mono text-[10px] text-gray-400 text-center p-2"
                                  >
                                    <span className="truncate w-full block uppercase">
                                      FILE
                                    </span>
                                  </a>
                                );
                              }
                            },
                          )}
                        </div>
                      )}
                  </div>

                  <div className="w-full md:w-1/2 font-mono text-sm flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2 break-words max-h-32 overflow-y-auto">
                        {selectedProject.description || selectedProject.desc}
                      </h3>
                      <div className="text-gray-500 mb-4 text-xs truncate uppercase">
                        DATE: {selectedProject.dateCreated || "2026.04"} | CAT:{" "}
                        {selectedProject.cat}
                      </div>
                    </div>

                    <div className="flex gap-4">
                      {selectedProject.link && (
                        <a
                          href={selectedProject.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 border transition-colors"
                          style={{
                            color: selectedProject.color,
                            borderColor: `${selectedProject.color}50`,
                          }}
                        >
                          <ExternalLink size={16} /> LIVE_DEMO
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Zoom Media Modal */}
      <AnimatePresence>
        {zoomMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
            onClick={() => setZoomMedia(null)}
          >
            <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center">
              <button
                className="absolute top-4 right-4 text-white hover:text-cyber-blue transition-colors z-[110] bg-black/50 p-2 rounded-full border border-white/10"
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomMedia(null);
                }}
              >
                <X size={24} />
              </button>

              {zoomMedia.type === "image" && (
                <img
                  src={zoomMedia.url}
                  alt="Zoomed"
                  className="max-w-full max-h-full object-contain cursor-default border border-white/10"
                  onClick={(e) => e.stopPropagation()}
                />
              )}
              {zoomMedia.type === "video" && (
                <video
                  src={zoomMedia.url}
                  controls
                  autoPlay
                  className="max-w-full max-h-full cursor-default border border-white/10"
                  onClick={(e) => e.stopPropagation()}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
