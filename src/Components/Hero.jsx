import heroBg from "../assets/Hero-bg.png";
import logoImage from "../assets/hero-logo.png"
export function GetStarted(){
  return (
    <button className="border-[#00C9A7] border-2 px-4 py-2 rounded-3xl text-black bg-[#00C9A7] font-semibold">
      Get Started Now →
    </button>
  );
};
export function Navbar(){
  return (
    <div className="h-full w-full flex justify-between items-center">
      <div className="w-1/6 h-full flex items-center">
        <img src={logoImage} alt="HEALIX" className="w-auto h-full" />
      </div>
      <div className="h-full w-2/5 flex justify-between items-center text-white text-lg">
        <a
        href="">
          Home
        </a>
        <a href="">
          About
        </a>
        <a href="">
          Features
        </a>
        <a href="">
          How it works
        </a>
        <a href="">
          Contact
        </a>
      </div>
      <div>
        <GetStarted />
      </div>
    </div>
  );
};
const Hero = () => {
  return (
    <div>
      <div
        className="h-screen w-screen relative bg-cover bg-center
             before:absolute before:inset-0 before:bg-black/55 before:content-['']"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="fixed top-0 left-1/2 -translate-x-1/2 flex h-14 w-11/12 border-x-0 border-gray-500 rounded-3xl justify-center items-center px-10 mt-5">
          <Navbar />
        </div>
        <div className="relative h-full w-full flex justify-start items-center gap-2">
          <div className="w-3/5 h-3/4 flex flex-col justify-center gap-7  px-28">
            {/* //hero-left */}
            <h3 className="text-xs border-2 border-[#00C9A7] rounded-xl w-fit px-3 py-1 text-[#00C9A7]">
              Meet Healix Companion
            </h3>
            <div>
              <h1 className="text-7xl text-white font-serif">
                Your AI - Powered Health Companion
              </h1>
            </div>
            <p className="text-white text-lg">
              Understand your symptoms, explore potential causes, and find
              nearby healthcare-all in one place. Intelligent insights made
              simple.
            </p>
            <div className="text-white flex justify-start gap-8 text-lg">
              <GetStarted />
              <button className="border-white border-2 px-4 py-2 rounded-3xl">
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
