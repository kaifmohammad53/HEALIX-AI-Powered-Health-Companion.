import heroBg from "../assets/Hero-bg.png";
const Hero = () => {
  return (
    <div>
      <div
        className="h-screen w-screen relative bg-cover bg-center
             before:absolute before:inset-0 before:bg-black/50 before:content-['']"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="relative h-full w-full flex justify-start items-center gap-2">
          <div className="w-1/2 h-3/4 flex flex-col justify-center gap-7  px-28">
            {/* //hero-left */}
            <h3 className="text-xs border-2 border-[#00C9A7] rounded-xl w-fit px-3 py-1 text-[#00C9A7]">
              Meet Healix Companion
            </h3>
            <div>
              <h1 className="text-6xl text-white font-serif">
                Your AI - Powered Health Companion
              </h1>
            </div>
            <p className="text-white text-lg">
              Understand your symptoms, explore potential causes, and find
              nearby healthcare-all in one place. Intelligent insights made
              simple.
            </p>
            <div className="text-white flex justify-start gap-8 text-lg">
              <button className="border-[#00C9A7] border-2 px-3 py-2 rounded-3xl text-black bg-[#00C9A7] font-semibold">
                Get Started Now →
              </button>
              <button className="border-white border-2 px-3 py-2 rounded-3xl">
                Explore How it works
              </button>
            </div>
          </div>
          <div>{/* //hero right */}</div>
        </div>
      </div>
    </div>
  );
};
export default Hero;
