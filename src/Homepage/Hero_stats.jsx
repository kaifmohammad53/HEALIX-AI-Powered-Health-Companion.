import statsBg from "../assets/statsBg.png"
export function Stats(props){
  return (
    <div className="flex flex-col h-3/5 w-2/5 justify-center items-center text-white">
      <h1 className="text-6xl mb-3 text-[#00C9A7]">{props.stat}</h1>
      <h4>{props.message.toUpperCase()}</h4>
    </div>
  );
};
const Hero_stats = () => {
  return (
    <div
      className="relative h-48 w-full bg-cover bg-center before:absolute before:inset-0
             before:bg-black/40
             before:content-['']"
      style={{ backgroundImage: `url(${statsBg})` }}
    >
      <div className="relative z-10 h-full w-full flex flex-row justify-evenly items-center">
        <Stats stat="50K+" message="Health queries answered" />
        <Stats stat="10K+" message="Healthcare Providers Listed" />
        <Stats stat="98%" message="User Satisfaction" />
      </div>
    </div>
  );
};
export default Hero_stats;
