import { Hero_header_steps } from "./Hero_how_works"
import { Activity, Sparkles, MapPin, DollarSign } from "lucide-react";
export function Journey(props){
  const Icon = props.icon;
  return (
    <div className="flex flex-col justify-center items-center gap-5">
      <div className="h-20 w-20 rounded-full flex items-center justify-center border-2 border-black/10 bg-white hover:bg-[#00C9A7] hover:text-white">
        <Icon />
      </div>
      <h2 className="text-base font-serif font-semibold">
        {props.activityName}
      </h2>
    </div>
  );
}
const Hero_Journey = () => {
  return (
    <div className="journey w-screen h-auto flex flex-col bg-white items-center justify-center gap-20 p-20">
      <Hero_header_steps
        minheading="CONTINUUM"
        mainHeader="From understanding your health to knowing what to do next"
      />
      <div className="flex items-center justify-between w-full border-2 border-[#00C9A7] p-20 bg-[#F8F9FB] rounded-3xl">
        <Journey icon={Activity} activityName="Health Insight" />
        <div className="h-[2px] w-40 bg-[#00C9A7]" />
        <Journey icon={Sparkles} activityName="Personalized Guidance" />
        <div className="h-[2px] w-40 bg-[#00C9A7]" />
        <Journey icon={MapPin} activityName="Nearby Healthcare" />
        <div className="h-[2px] w-40 bg-[#00C9A7]" />
        <Journey icon={DollarSign} activityName="Approximate Cost" />
      </div>
    </div>
  );
}
export default Hero_Journey